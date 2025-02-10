import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql'
import { Inject, ParseIntPipe, UseGuards } from '@nestjs/common'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Product } from './entity/product.entity'
import { RoleGuard } from 'src/common/guard/role.guard'
import { Roles } from 'src/common/decerator/roles'
import { ProductService } from './produt.service'
import { ProductFilterDto } from './dtos/filter.dto'
import { ProductSortDto } from './dtos/sortdto'
import { PaginationDto } from '../../common/dtos/pagination.dto'
import { ProductResponse } from './dtos/productResoponse.dto'
import { CreateProductDto } from './dtos/CreateProduct.dto'
import { Role } from 'src/common/constant/enum.constant'
import { UpdateProductDto } from './dtos/UpdateProduct.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { CreateColorDto } from '../color/dto/createColor.dto'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'

@Resolver(of => Product)
export class ProductResolver {
  constructor (
    private productService: ProductService,
    private readonly redisService: RedisService,
  ) {}

  @UseGuards(RoleGuard)
  @Roles(Role.COMPANY)
  @Mutation(() => ProductResponse)
  async createProduct (
    @Args('createProductDto') createProductDto: CreateProductDto,
    @Args('imgs', { type: () => [CreateImagDto] }) imgs: CreateImagDto[],
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.productService.create(
      createProductDto,
      imgs,
      user.id,
      user.companyId,
    )
  }

  @Query(returns => ProductResponse, { nullable: true })
  async getProductById (@Args('id', ParseIntPipe) id: number) {
    const productCacheKey = `product:${+id}`
    const cachedProduct = await this.redisService.get(productCacheKey)
    if (cachedProduct) {
      return { result: cachedProduct }
    }

    return this.productService.findById(id)
  }

  @Mutation(returns => [ProductResponse], { nullable: true })
  async getAllProducts (
    @Args('productFilterDto', { nullable: true })
    productFilterDto: ProductFilterDto,
    @Args('productSortDto', { nullable: true }) productSortDto: ProductSortDto,
    @Args('paginationDto', { nullable: true }) paginationDto: PaginationDto,
  ): Promise<ProductResponse[]> {
    return await this.productService.findAll(
      productFilterDto,
      productSortDto,
      paginationDto,
    )
  }

  @UseGuards(RoleGuard)
  @Roles(Role.COMPANY)
  @Mutation(() => ProductResponse)
  async updateProduct (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }, ParseIntPipe) id: number,

    @Args('updateProductDto', { type: () => UpdateProductDto, nullable: true })
    updateProductDto: UpdateProductDto | null,

    @Args('imgs', { type: () => [CreateImagDto], nullable: true })
    imgs: CreateImagDto[] | null,

    @Args('createColorDto', { type: () => [CreateColorDto], nullable: true })
    createColorDto: CreateColorDto[] | null,
  ) {
    return this.productService.update(
      id,
      user?.companyId,
      updateProductDto,
      imgs || [],
      createColorDto || [],
    )
  }

  @UseGuards(RoleGuard)
  @Roles(Role.COMPANY)
  @Query(() => String)
  async deleteProduct (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', ParseIntPipe) id: number,
  ) {
    return this.productService.delete(id, user?.companyId)
  }
}
