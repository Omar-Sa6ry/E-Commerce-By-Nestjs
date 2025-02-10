import { Module } from '@nestjs/common'
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
import { ThrottlerModule } from './common/throttler/throttling.module'
import { GraphqlModule } from './common/graphql/graphql.module'
import { ConfigModule } from './common/config/config.module'
import { DataBaseModule } from './common/database/database'

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DataBaseModule,
    ThrottlerModule,
    
    UserModule,
    AuthModule,
    ProductModule,
    ColorModule,
    CartModule,
    OrderModule,
    CompanyModule,
    AddressModule,
    CouponModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}

