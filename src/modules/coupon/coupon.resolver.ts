import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/common/guard/role.guard'
import { Roles } from 'src/common/decerator/roles'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Coupon } from './entity/coupon.entity'
import { CouponService } from './coupon.service'
import { CreateCouponDto } from './dtos/createCoupon.dto'
import { UpdateCouponDto } from './dtos/updateCoupon.dto'
import { Role } from 'src/common/constant/enum.constant'

@Resolver(of => Coupon)
export class CouponResolver {
  constructor (private couponService: CouponService) {}

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => Coupon)
  async createCoupon (
    @Args('createCouponDto') createCouponDto: CreateCouponDto,
  ) {
    return this.couponService.create(createCouponDto)
  }

  @Query(returns => Coupon, { nullable: true })
  getCouponById (@Args('id', ParseIntPipe) id: number) {
    return this.couponService.findById(id)
  }

  @Query(returns => Coupon, { nullable: true })
  getCouponByName (@Args('name') name: string) {
    return this.couponService.find(name)
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Coupon)
  async updateCoupon (
    @Args('id', ParseIntPipe) id: number,
    @Args('updateCouponDto') updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => String)
  async deleteCoupon (@Args('id', ParseIntPipe) id: number) {
    return this.couponService.delete(id)
  }
}
