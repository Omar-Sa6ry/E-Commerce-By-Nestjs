import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Address } from 'src/modules/address/entity/address.entity'
import { Cart } from 'src/modules/cart/entity/cart.entity'
import { CartItem } from 'src/modules/cart/entity/cartItem.enitty'
import { Color } from 'src/modules/color/entity/color.entity'
import { Company } from 'src/modules/company/entity/company.entity'
import { Coupon } from 'src/modules/coupon/entity/coupon.entity'
import { Order } from 'src/modules/order/entity/order.entity'
import { OrderItem } from 'src/modules/order/entity/orderItems.entity'
import { Images } from 'src/modules/product/entity/images.entity'
import { Product } from 'src/modules/product/entity/product.entity'
import { User } from 'src/modules/users/entity/user.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Product,
          Images,
          Color,
          Company,
          Cart,
          CartItem,
          Order,
          OrderItem,
          Address,
          Coupon,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DataBaseModule {}
