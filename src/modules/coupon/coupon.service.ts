import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCouponDto } from './dtos/createCoupon.dto'
import { UpdateCouponDto } from './dtos/updateCoupon.dto'
import { Coupon } from './entity/coupon.entity'
import {
  CouponIsExisted,
  CouponNotFound,
} from 'src/common/constant/messages.constant'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class CouponService {
  constructor (
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
  ) {}

  async create (createCouponDto: CreateCouponDto) {
    const existedCoupon = await this.couponRepository.findOne({
      where: { name: createCouponDto.name },
    })

    if (existedCoupon) {
      throw new BadRequestException(CouponIsExisted)
    }
    const coupon = this.couponRepository.create(createCouponDto)
    await this.couponRepository.save(coupon)
    return coupon
  }

  async find (name: string) {
    const coupon = await this.couponRepository.findOne({ where: { name } })
    if (!coupon) {
      throw new NotFoundException(`Coupon with ${name} not found`)
    }
    return coupon
  }

  async findById (id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } })
    if (!coupon) {
      throw new NotFoundException(`Coupon with ${id} not found`)
    }
    return coupon
  }

  async update (id: number, updateCouponDto: UpdateCouponDto) {
    const existingCouponById = await this.couponRepository.findOne({
      where: { id },
    })
    if (!existingCouponById) {
      throw new BadRequestException(CouponNotFound)
    }

    Object.assign(existingCouponById, updateCouponDto)
    return this.couponRepository.save(existingCouponById)
  }

  async delete (id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } })
    if (!coupon) {
      throw new NotFoundException(CouponNotFound)
    }

    await this.couponRepository.remove(coupon)
    return `Coupon with id ${id} successfully deleted`
  }
}
