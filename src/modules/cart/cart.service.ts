import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { MoreThan, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Cart } from './entity/cart.entity'
import { ProductService } from '../product/produt.service'
import { CheckQuantity } from './util/checkQuantity'
import { CartResponse } from './dtos/cartResponse'
import { Color } from '../color/entity/color.entity'
import { CartItem } from './entity/cartItem.enitty'
import { CartItemDto, CartItemResponse } from './dtos/cartItem.dto'
import { Product } from '../product/entity/product.entity'
import {
  CartIsEmpty,
  CartNotFound,
  ColorNotFound,
  DeleteProduct,
  EmptyCart,
  NoCart,
  NoProductsInCart,
  ProductColorQuantity,
  ProductNotFound,
  QuantityMsg,
} from 'src/constant/messages.constant'
import { Images } from '../product/entity/images.entity'

@Injectable()
export class CartService {
  constructor (
    private productService: ProductService,

    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Color) private colorRepository: Repository<Color>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Images) private imageRepository: Repository<Images>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async find (userId: number): Promise<Cart[]> {
    const cart = await this.cartRepository.find({ where: { userId: userId } })
    return cart.length ? cart : []
  }

  async findItems (cartId: number) {
    const cart = await this.cartItemRepository.find({ where: { cartId } })
    return cart || []
  }

  async create (userId: number, cartItemDto: CartItemDto, price: number) {
    const query = this.cartItemRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const totalPrice = price * cartItemDto.quantity

      const createCart = await this.cartRepository.create({
        userId,
        totalPrice,
      })
      await this.cartRepository.save(createCart)

      const createCartItem = await this.cartItemRepository.create({
        ...cartItemDto,
        totalPrice,
        cartId: createCart.id,
      })
      await this.cartItemRepository.save(createCartItem)

      const { color, quantity, id, productId } = createCartItem
      const product = await this.productService.findById(productId)
      const colors = await this.colorRepository.find({ where: { productId } })
      const imgs = await this.imageRepository.find({ where: { productId } })
      const images: string[] = []
      for (const img of imgs) {
        images.push(img.path)
      }

      const item: CartItemResponse = {
        id,
        color,
        quantity,
        product: { ...product, images, colors },
      }

      return { createCart, item }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async addToCart (
    userId: number,
    cartItemDto: CartItemDto,
  ): Promise<CartResponse> {
    const { productId, quantity } = cartItemDto

    const findColor = await this.colorRepository.findOne({
      where: {
        productId,
        name: cartItemDto.color,
        quantity: MoreThan(quantity - 1),
      },
    })

    if (!findColor) {
      throw new NotFoundException(ProductColorQuantity)
    }

    const price: number = (await this.productService.findById(productId)).price
    let productQuantity: number = findColor.quantity
    let color = findColor.name

    const query =
      await this.cartItemRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const findCart = await this.find(userId)
      // Create Cart
      if (findCart.length === 0) {
        const created = await this.create(userId, cartItemDto, price)
        await query.commitTransaction()
        return {
          id: created.createCart.id,
          totalPrice: created.createCart.totalPrice,
          userId,
          cartItems: [created.item],
        }
      }

      const productCart: Cart[] = []
      const productCartItem: CartItem[] = []
      await Promise.all(
        findCart.map(async cartItemExisted => {
          const findCartItems = await this.cartItemRepository.find({
            where: { cartId: cartItemExisted.id },
          })

          for (const item of findCartItems) {
            if (item.productId === productId && item.color === color) {
              if (productQuantity < quantity + item.quantity) {
                throw new BadRequestException(QuantityMsg)
              }

              if (color === item.color) {
                item.quantity += quantity
                const cartItem = await this.cartItemRepository.save(item)

                cartItemExisted.totalPrice = price * (quantity + item.quantity)
                const cart = await this.cartRepository.save(cartItemExisted)
                productCart.push(cart)
                productCartItem.push(cartItem)
              }
            }
          }
        }),
      )
      if (productCart.length !== 0 && productCartItem.length !== 0) {
        const product = await this.productService.findById(productId)
        const colors = await this.colorRepository.find({ where: { productId } })
        const imgs = await this.imageRepository.find({ where: { productId } })
        const images: string[] = []
        for (const img of imgs) {
          images.push(img.path)
        }

        const item: CartItemResponse = {
          id: productCartItem[0].id,
          color,
          quantity,
          product: { ...product, images, colors },
        }

        return {
          id: productCart[0].id,
          totalPrice: productCart[0].totalPrice,
          userId: productCart[0].userId,
          cartItems: [item],
        }
      }

      //Product not in Cart
      const created = await this.create(userId, cartItemDto, price)
      return {
        id: created.createCart.id,
        totalPrice: created.createCart.totalPrice,
        userId,
        cartItems: [created.item],
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async emtyCart (userId: number): Promise<String> {
    const cart = await this.find(userId)
    if (cart.length === 0) {
      throw new NotFoundException(NoCart)
    }
    await this.cartRepository.remove(cart)
    return EmptyCart
  }

  async deleteCart (userId: number, productId: number) {
    const carts = await this.find(userId)
    if (carts.length === 0) {
      throw new NotFoundException(NoCart)
    }
    for (const cart of carts) {
      const cartItem = await this.findItems(cart.id)
      if (cartItem.length === 0) {
        throw new NotFoundException(NoProductsInCart)
      }

      for (const item of cartItem) {
        if (productId === item.productId) {
          await this.cartRepository.remove(cart)
          return DeleteProduct
        }
      }
    }
  }

  async updateQuantity (
    userId: number,
    cartItemDto: CartItemDto,
  ): Promise<string> {
    const { productId, quantity, color } = cartItemDto

    const findColor = await this.colorRepository.findOne({
      where: {
        productId,
        name: color,
        quantity: MoreThan(quantity - 1),
      },
    })

    if (!findColor) {
      throw new NotFoundException(ProductColorQuantity)
    }

    const productQuantity = findColor.quantity
    const productColor = findColor.name
    const price = (await this.productService.findById(productId)).price

    const findCart = await this.find(userId)
    if (findCart.length === 0) {
      throw new NotFoundException(CartNotFound)
    }

    for (const cart of findCart) {
      const findCartItem = await this.findItems(cart.id)

      for (const item of findCartItem) {
        if (productId === item.productId && productColor === item.color) {
          if (productQuantity < quantity) {
            throw new BadRequestException(QuantityMsg)
          }

          item.quantity = quantity
          item.totalPrice = quantity * price
          await this.cartItemRepository.save(item)

          cart.totalPrice = quantity * price
          await this.cartRepository.save(cart)
        }
      }

      return `Quantity of product  update sucessfully to ${quantity}`
    }
  }

  async updateColor (userId: number, cartItemDto: CartItemDto): Promise<string> {
    const { productId, quantity, color } = cartItemDto

    const findColor = await this.colorRepository.findOne({
      where: {
        productId,
        name: color,
        quantity: MoreThan(quantity - 1),
      },
    })

    if (!findColor) {
      throw new NotFoundException(ProductColorQuantity)
    }

    const productQuantity = findColor.quantity
    const productColor = findColor.name
    const price = (await this.productService.findById(productId)).price

    const findCart = await this.find(userId)
    if (findCart.length === 0) {
      throw new NotFoundException(CartNotFound)
    }

    for (const cart of findCart) {
      const findCartItem = await this.findItems(cart.id)

      for (const item of findCartItem) {
        if (productId === item.productId && productQuantity === item.quantity) {
          if (productColor !== color) {
            throw new BadRequestException(ColorNotFound)
          }

          item.color = color
          await this.cartItemRepository.save(item)
          await this.cartRepository.save(cart)
        }
      }

      return `Color of product  update sucessfully to ${color}`
    }
  }

  async checkTotalCart (userId: number): Promise<number> {
    const findCart = await this.find(userId)
    if (findCart.length === 0) {
      throw new BadRequestException(NoCart)
    }

    let totalPrice: number = 0
    for (const cart of findCart) {
      totalPrice += cart.totalPrice
      return totalPrice
    }
  }
}
