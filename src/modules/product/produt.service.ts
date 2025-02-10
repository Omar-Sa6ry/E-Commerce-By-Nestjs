import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from './entity/product.entity'
import { CreateProductDto } from 'src/modules/product/dtos/CreateProduct.dto'
import { UpdateProductDto } from 'src/modules/product/dtos/UpdateProduct.dto'
import { ProductFilterDto } from './dtos/filter.dto'
import { CompanyService } from '../company/company.service'
import { ColorService } from '../color/color.service'
import { ProductSortDto } from './dtos/sortdto'
import { PaginationDto } from '../../common/dtos/pagination.dto'
import { Images } from './entity/images.entity'
import { ProductResponse } from './dtos/productResoponse.dto'
import { Color } from '../color/entity/color.entity'
import { Company } from '../company/entity/company.entity'
import {
  CompanysNotFound,
  MaxImage,
  MinImage,
  ProductNotFound,
  ProductNotMatchCompany,
  UpdateProduct,
} from 'src/common/constant/messages.constant'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { CreateColorDto } from '../color/dto/createColor.dto'
import { UploadService } from 'src/common/upload/upload.service'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import { RedisService } from 'src/common/redis/redis.service'

@Injectable()
export class ProductService {
  constructor (
    private companyService: CompanyService,
    private colorService: ColorService,
    private uploadService: UploadService,
    private readonly redisService: RedisService,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Color) private colorRepository: Repository<Color>,
    @InjectRepository(Images) private imageRepository: Repository<Images>,
  ) {}

  async create (
    createProductDto: CreateProductDto,
    imgs: CreateImagDto[],
    userId: number,
    companyId: number,
  ): Promise<ProductResponse> {
    const { name, description, price, category } = createProductDto
    const color = createProductDto.colors

    if (imgs.length === 0) {
      throw new BadRequestException(MinImage)
    }
    if (imgs.length > 5) {
      throw new BadRequestException(MaxImage)
    }

    const query = this.productRepository.manager.connection.createQueryRunner()
    await query.startTransaction()
    try {
      const company = await this.companyService.findById(companyId)
      if (!(company instanceof Company)) {
        throw new BadRequestException(CompanysNotFound)
      }

      const product = await this.productRepository.create({
        name,
        description,
        category,
        price,
        userId,
        companyId,
      })
      await this.productRepository.save(product)

      const images = await this.uploadService.uploadImages(imgs, product.id)

      const colors = []
      await Promise.all(
        color.map(async productColor => {
          const color = await this.colorService.create(
            productColor.name,
            productColor.quantity,
            product.id,
          )
          colors.push({ name: color.name, quantity: color.quantity })
        }),
      )
      const result = { ...product, images, colors, company: company.name }

      const productCacheKey = `product:${product.id}`
      await this.redisService.set(productCacheKey, result, 3600)

      return result
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findById (id: number): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException(`Product with ${id} not found`)
    }

    const companyName = await this.companyService.findById(product.companyId)

    const images = []
    const files = await this.imageRepository.find({
      where: { productId: product.id },
    })
    for (const file of files) {
      images.push(file.path)
    }

    const colors = []
    const color = await this.colorService.findByProductId(product.id)

    if (color.length !== 0) {
      await Promise.all(
        color.map(c => {
          colors.push({ name: c.name, quantity: c.quantity })
        }),
      )
    }

    const result = { ...product, colors, images, company: companyName.name }
    const productCacheKey = `product:${product.id}`
    await this.redisService.set(productCacheKey, result, 3600)
    return result
  }

  async findAll (
    productFilterDto?: ProductFilterDto,
    productSortDto?: ProductSortDto,
    paginationDto?: PaginationDto,
  ): Promise<ProductResponse[]> {
    let products = await this.productRepository.find()
    if (products.length === 0) {
      throw new NotFoundException(ProductNotFound)
    }

    if (productFilterDto) {
      const { name, maxPrice, minPrice, category, company } = productFilterDto

      if (name) {
        products = products.filter(product => product.name.includes(name))
      }

      if (category) {
        products = products.filter(product =>
          product.category.includes(category),
        )
      }

      if (company) {
        const companyId = await await this.companyService.find(company)
        if (!companyId) {
          throw new NotFoundException(CompanysNotFound)
        }
        products.filter(product => product.companyId === companyId.id)
      }

      if (maxPrice !== undefined) {
        products = products.filter(product => product.price <= maxPrice + 5)
      }

      if (minPrice !== undefined) {
        products = products.filter(product => product.price >= minPrice - 5)
      }
    }

    if (productSortDto) {
      const { price, name } = productSortDto

      if (price) {
        products = products.sort((a, b) =>
          price === 'asc' ? a.price - b.price : b.price - a.price,
        )
      }

      if (name) {
        products = products.sort((a, b) =>
          name === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        )
      }
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        products = products.slice(offset || 0, limit + (offset || 0))
      }
    }

    // return
    const colors = []
    const images = []
    const results = []

    await Promise.all(
      await products.map(async product => {
        const imgs = await this.imageRepository.find({
          where: { productId: product.id },
        })
        for (const img of imgs) {
          images.push(img.path)
        }

        const color = await this.colorRepository.find({
          where: { productId: product.id },
        })

        await color.map(async c => {
          colors.push({ name: c.name, quantity: c.quantity })
        })

        const company = await this.companyService.findById(product.companyId)

        results.push({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          colors,
          images,
          company: company.name,
        })
      }),
    )
    return results
  }

  async update (
    id: number,
    companyId: number,
    updateProductDto?: UpdateProductDto,
    imgs?: CreateImagDto[],
    color?: CreateColorDto[],
  ): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
    })
    if (!product) {
      throw new NotFoundException(ProductNotFound)
    }
    if (companyId !== product.companyId) {
      throw new BadRequestException(ProductNotMatchCompany)
    }
    if (imgs.length === 0 && color.length === 0 && !updateProductDto) {
      throw new BadRequestException(UpdateProduct)
    }
    if (imgs.length > 5) {
      throw new BadRequestException(MaxImage)
    }

    const query = this.productRepository.manager.connection.createQueryRunner()
    await query.startTransaction()
    try {
      // updatae Product
      if (updateProductDto) {
        const p = Object.assign(product, updateProductDto)
        await this.productRepository.save(p)
      }

      // update Color
      const colors = []
      console.log('pppp')

      console.log(color)
      if (color.length !== 0) {
        const findColors = await this.colorService.findByProductId(product.id)
        console.log('pppp', findColors)
        for (const c of color) {
          console.log('pppp', c)
          await this.colorService.create(c.name, c.quantity, product.id)
          colors.push({ name: c.name, quantity: c.quantity })
        }
        await this.colorRepository.remove(findColors)
      }

      // Update Images
      const images = []
      if (imgs.length !== 0) {
        const oldPaths = await this.imageRepository.find({
          where: { productId: product.id },
        })

        const image = await this.uploadService.uploadImages(imgs, product.id)
        images.push(...image)

        oldPaths.map(async img => {
          await unlinkSync(
            join(process.cwd(), `src/images/products/${img.path}`),
          )
          await this.imageRepository.remove(img)
        })
      }

      // Get Images
      if (imgs.length === 0) {
        const image = await this.imageRepository.find({
          where: { productId: product.id },
        })
        for (const img of image) {
          images.push(img.path)
        }
      }

      // Get Colors
      if (color.length === 0) {
        const color = await this.colorService.findByProductId(product.id)
        await color.map(async c =>
          colors.push({ name: c.name, quantity: c.quantity }),
        )
      }

      const company = await this.companyService.findById(product.companyId)
      const result = { ...product, colors, images, company: company.name }

      const productCacheKey = `product:${product.id}`
      await this.redisService.set(productCacheKey, result, 3600)
      return result
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async delete (id: number, companyId: number) {
    const query = this.productRepository.manager.connection.createQueryRunner()
    await query.startTransaction()
    try {
      const product = await this.productRepository.findOne({ where: { id } })
      if (!product) {
        throw new NotFoundException(ProductNotFound)
      }
      if (companyId !== product.companyId) {
        throw new BadRequestException(ProductNotMatchCompany)
      }

      const images = await this.imageRepository.find({
        where: { productId: product.id },
      })

      await Promise.all(
        images.map(async img => {
          const imagePath = join(
            process.cwd(),
            `src/images/products/${img.path}`,
          )
          if (existsSync(imagePath)) {
            unlinkSync(imagePath)
            await this.imageRepository.remove(images)
          } else {
            throw new NotFoundException(`File not found: ${imagePath}`)
          }
        }),
      )

      await this.productRepository.remove(product)
      return `Product with id ${id} successfully deleted`
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }
}
