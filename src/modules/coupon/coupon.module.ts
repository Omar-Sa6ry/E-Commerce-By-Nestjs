import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../users/users.module'
import { CouponService } from './coupon.service'
import { CouponResolver } from './coupon.resolver'
import { Coupon } from './entity/coupon.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Coupon]), UserModule],
  providers: [CouponResolver, CouponService],
  exports: [CouponService],
})
export class CouponModule {}
