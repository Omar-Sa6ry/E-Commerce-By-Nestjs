import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Order } from './entity/order.entity'
import { OrderService } from './order.service'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { Roles } from 'src/decerator/roles'
import { CurrentUser } from 'src/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/dtos/currentUser.dto'
import { CreateOrderDto } from './dtos/createOrder.dto'
import { RoleGuard } from 'src/guard/role.guard'
import { AuthGuard } from 'src/guard/auth.guard'
import { Role } from 'src/constant/enum.constant'
import { UpdateAddressDto } from '../address/dtos/updateAddress.dto'
import { OrderFilterDto } from './dtos/filter.dto'
import { OrderSortDto } from './dtos/sortdto'
import { PaginationDto } from 'src/dtos/pagination.dto'

@Resolver(of => Order)
export class OrderProductResolver {
  constructor (private orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  @Mutation(() => String)
  async createOrder (
    @CurrentUser() user: CurrentUserDto,
    @Args('createOrderDto') createOrderDto: CreateOrderDto,
    @Args('updateAddressDto', { nullable: true })
    updateAddressDto: UpdateAddressDto,
  ): Promise<String> {
    return await this.orderService.createOrder(
      user.id,
      user.addressId,
      user.email,
      createOrderDto,
      updateAddressDto,
    )
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => [Order])
  async findAllOrders (
    @Args('orderFilterDto', { nullable: true })
    orderFilterDto: OrderFilterDto,
    @Args('orderSortDto', { nullable: true }) orderSortDto: OrderSortDto,
    @Args('paginationDto', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return await this.orderService.findAll(
      orderFilterDto,
      orderSortDto,
      paginationDto,
    )
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => Order)
  async findOrder (
    @Args('userId', { type: () => Int }, ParseIntPipe) userId: number,
  ) {
    return await this.orderService.find(userId)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => Order)
  async updateStatus (
    @Args('userId', { type: () => Int }, ParseIntPipe) userId: number,
    @Args('status') status: string,
  ) {
    return await this.orderService.updateStatus(userId, status)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => String)
  async deleteOrder (
    @Args('userId', { type: () => Int }, ParseIntPipe) userId: number,
  ) {
    return await this.orderService.deleteOrder(userId)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => String)
  async deleteOrderItem (
    @Args('id', { type: () => Int }, ParseIntPipe) id: number,
  ) {
    return await this.orderService.deleteOrderItem(id)
  }
}
