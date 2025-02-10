import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/common/guard/role.guard'
import { Roles } from 'src/common/decerator/roles'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Address } from './entity/address.entity'
import { AddressService } from './address.service'
import { CreateAddressDto } from './dtos/createAddress.dto'
import { UpdateAddressDto } from './dtos/updateAddress.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Role } from 'src/common/constant/enum.constant'

@Resolver(of => Address)
export class AddressResolver {
  constructor (private addressService: AddressService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Address)
  async createAddress (
    @Args('createAddressDto')
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    return this.addressService.create(createAddressDto)
  }

  @Query(returns => Address, { nullable: true })
  getAddressById (@Args('id', ParseIntPipe) id: number) {
    return this.addressService.findById(id)
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Address)
  async updateAddress (
    @Args('id', ParseIntPipe) id: number,
    @Args('updateAddressDto') updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.addressService.update(id, updateAddressDto, user?.id)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => String)
  async deleteAddress (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.delete(id, user?.addressId)
  }
}
