import { join } from 'path'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CacheModule, CacheStore } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProductModule } from './modules/product/product.module'
import { ColorModule } from './modules/color/color.module'
import { CartModule } from './modules/cart/cart.module'
import { OrderModule } from './modules/order/order.module'
import { CompanyModule } from './modules/company/company.module'
import { AddressModule } from './modules/address/address.module'
import { CouponModule } from './modules/coupon/coupon.module'
import { AppResolver } from './app.resolver'
import { AppService } from './app.service'
import { redisStore } from 'cache-manager-redis-yet'
import { Address } from './modules/address/entity/address.entity'
import { User } from './modules/users/entity/user.entity'
import { Product } from './modules/product/entity/product.entity'
import { Images } from './modules/product/entity/images.entity'
import { Color } from './modules/color/entity/color.entity'
import { Coupon } from './modules/coupon/entity/coupon.entity'
import { OrderItem } from './modules/order/entity/orderItems.entity'
import { Order } from './modules/order/entity/order.entity'
import { CartItem } from './modules/cart/entity/cartItem.enitty'
import { Cart } from './modules/cart/entity/cart.entity'
import { Company } from './modules/company/entity/company.entity'
import { UploadModule } from './modules/upload/upload.module'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        })

        return {
          store: store as unknown as CacheStore,
          ttl: 3 * 60000,
        }
      },
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      uploads: true,
      debug: true,
      playground: true,
    }),
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
        logging: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    UserModule,
    AuthModule,
    ProductModule,
    ColorModule,
    CartModule,
    OrderModule,
    CompanyModule,
    AddressModule,
    CouponModule,
    UploadModule,
  ],
  providers: [
    AppResolver,
    AppService,
  ],
})
export class AppModule {}
