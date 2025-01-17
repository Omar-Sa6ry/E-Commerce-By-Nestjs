import { UserModule } from './../users/users.module'
import { Module } from '@nestjs/common'
import { OrderProductResolver } from './order.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './entity/order.entity'
import { OrderItem } from './entity/orderItems.entity'
import { OrderService } from './order.service'
import { CouponModule } from '../coupon/coupon.module'
import { Color } from '../color/entity/color.entity'
import { Product } from '../product/entity/product.entity'
import { AddressModule } from '../address/address.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Color, Product]),
    UserModule,
    CouponModule,
    AddressModule,
  ],
  providers: [OrderService, OrderProductResolver],
})
export class OrderModule {}
