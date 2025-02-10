import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import Stripe from 'stripe'
import { PaginationDto } from '../../common/dtos/pagination.dto'
import { OrderSortDto } from './dtos/sortdto'
import { MoreThan, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Order } from './entity/order.entity'
import { OrderItem } from './entity/orderItems.entity'
import { ProductService } from '../product/produt.service'
import { CouponService } from '../coupon/coupon.service'
import { CreateOrderDto } from './dtos/createOrder.dto'
import { AddressService } from '../address/address.service'
import { TypeCoupon } from 'src/common/constant/enum.constant'
import { OrderFilterDto } from './dtos/filter.dto'
import { UpdateAddressDto } from '../address/dtos/updateAddress.dto'
import { Address } from '../address/entity/address.entity'
import { ColorService } from '../color/color.service'
import { Color } from '../color/entity/color.entity'
import { Product } from '../product/entity/product.entity'
import {
  AddressError,
  CouponIsExpired,
  CouponNotFound,
  DeleteOrder,
  DeleteOrderItem,
  OrderItemNotFound,
  OrderNotFound,
  OrdersNotFound,
} from 'src/common/constant/messages.constant'

@Injectable()
export class OrderService {
  private stripe: Stripe
  constructor (
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Color) private colorRepository: Repository<Color>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private couponService: CouponService,
    private addressService: AddressService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async createOrder (
    userId: number,
    addressId: number,
    email: string,
    createOrderDto: CreateOrderDto,
    updateAddressDto?: UpdateAddressDto,
  ): Promise<String> {
    const { item } = createOrderDto

    const query = this.orderRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      if (updateAddressDto) {
        const address = await this.addressService.update(
          addressId,
          updateAddressDto,
          addressId,
        )
        if (!(address instanceof Address)) {
          throw new BadRequestException(AddressError)
        }
      }

      const order = await this.orderRepository.create({ userId, addressId })
      let totalPrice: number = 20

      const lineItems = []
      for (const product of item) {
        const findProduct = await query.manager.findOne(Color, {
          where: {
            productId: product.productId,
            name: product.color,
            quantity: MoreThan(product.quantity - 1),
          },
        })

        if (!findProduct) {
          throw new NotFoundException(
            `product with id ${product.productId} , color${product.color} quantity ${product.quantity}`,
          )
        }

        let productQuantity: number = findProduct.quantity
        const checkProduct = await this.productRepository.findOne({
          where: { id: product.productId },
        })

        totalPrice += checkProduct.price * product.quantity
        order.totalPrice = totalPrice
        await this.orderRepository.save(order)

        const orderItem = this.orderItemRepository.create({
          totalPrice,
          color: product.color,
          productId: product.productId,
          quantity: product.quantity,
          orderId: order.id,
        })
        await this.orderItemRepository.save(orderItem)

        if (product.quantity === productQuantity) {
          findProduct.quantity = 0
          await this.colorRepository.save(findProduct)
        }

        if (product.quantity !== productQuantity) {
          findProduct.quantity -= product.quantity
          await this.colorRepository.save(findProduct)
        }

        lineItems.push({
          price_data: {
            currency: 'egp',
            product_data: {
              name: checkProduct.name,
            },
            unit_amount: checkProduct.price * 100,
          },
          quantity: product.quantity,
        })
      }

      let discount: number
      if (createOrderDto.coupon) {
        const coupon = await this.couponService.find(createOrderDto.coupon)
        if (!coupon) {
          throw new NotFoundException(CouponNotFound)
        }
        const total = await this.checkCoupon(coupon.id, totalPrice)
        if (typeof total === 'number') {
          discount = total
        }
      } else {
        discount = totalPrice
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: process.env.SUCCESSURL,
        cancel_url: process.env.FAILURL,
        client_reference_id: `${userId}`,
        customer_email: email,
        metadata: {
          discountedTotalPrice: `${discount}`,
        },
      })

      order.totalPrice = totalPrice
      order.discount = discount
      await this.orderRepository.save(order)
      return session.url
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findAll (
    orderFilterDto?: OrderFilterDto,
    orderSortDto?: OrderSortDto,
    paginationDto?: PaginationDto,
  ): Promise<Order[]> {
    let orders = await this.orderRepository.find()
    if (orders.length === 0) {
      throw new NotFoundException(OrdersNotFound)
    }

    if (orderFilterDto) {
      const { minPrice, maxPrice, orderStatus, paymentStatus } = orderFilterDto

      if (orderStatus) {
        orders = orders.filter(order => order.orderStatus === orderStatus)
      }

      if (paymentStatus) {
        orders = orders.filter(order => order.paymentStatus === paymentStatus)
      }

      if (maxPrice !== undefined) {
        orders = orders.filter(order => order.totalPrice <= maxPrice + 5)
      }

      if (minPrice !== undefined) {
        orders = orders.filter(order => order.totalPrice >= minPrice - 5)
      }
    }

    if (orderSortDto) {
      const { totalPrice, orderId } = orderSortDto

      if (totalPrice) {
        orders = orders.sort((a, b) =>
          totalPrice === 'asc'
            ? a.totalPrice - b.totalPrice
            : b.totalPrice - a.totalPrice,
        )
      }

      if (orderId) {
        orders = orders.sort((a, b) =>
          totalPrice === 'asc'
            ? a.totalPrice - b.totalPrice
            : b.totalPrice - a.totalPrice,
        )
      }
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto

      if (limit == undefined) {
        orders.slice(offset || 0, limit + (offset || 0))
      }
    }

    return orders
  }

  async find (userId: number) {
    const order = await this.orderRepository.findOne({ where: { userId } })
    if (!order) {
      throw new NotFoundException(OrderNotFound)
    }
    return order
  }

  async updateStatus (userId: number, orderStatus: string) {
    const query = this.orderRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const order = await this.find(userId)
      if (!order) {
        throw new NotFoundException(OrderNotFound)
      }

      order.orderStatus = orderStatus
      await this.orderRepository.save(order)
      return order
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async deleteOrder (userId: number) {
    const order = await this.find(userId)
    if (!order) {
      throw new NotFoundException(OrderNotFound)
    }
    await this.orderRepository.remove(order)
    return DeleteOrder
  }

  async deleteOrderItem (id: number) {
    const order = await this.orderItemRepository.findOne({ where: { id } })
    if (!order) {
      throw new NotFoundException(OrderItemNotFound)
    }
    await this.orderItemRepository.remove(order)
    return DeleteOrderItem
  }

  async checkCoupon (couponId: number, totalPrice: number): Promise<number> {
    if (couponId) {
      const coupon = await this.couponService.findById(couponId)
      if (!coupon) {
        throw new NotFoundException(CouponNotFound)
      }

      if (new Date(coupon.expiryDate).getTime() < Date.now()) {
        throw new BadRequestException(CouponIsExpired)
      }

      if (coupon.type === TypeCoupon.FIXED) {
        totalPrice -= coupon.discount
      } else {
        totalPrice =
          totalPrice - Math.round((totalPrice * coupon.discount) / 100)
      }
      return totalPrice
    }
  }
}
