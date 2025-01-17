import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { Cart } from './entity/cart.entity'
import { CartService } from './cart.service'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/guard/auth.guard'
import { Roles } from 'src/decerator/roles'
import { CurrentUserDto } from 'src/dtos/currentUser.dto'
import { CurrentUser } from 'src/decerator/currentUser.decerator'
import { Role } from 'src/constant/enum.constant'
import { CartItemDto } from './dtos/cartItem.dto'
import { CartResponse } from './dtos/cartResponse'

@Resolver(of => Cart)
export class CartResolver {
  constructor (private cartService: CartService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN, Role.COMPANY, Role.MANAGER, Role.USER)
  @Mutation(() => [Cart])
  async findCart (@CurrentUser() user: CurrentUserDto) {
    return await this.cartService.find(user.id)
  }

  @Mutation(() => CartResponse)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async addToCart (
    @CurrentUser() user: CurrentUserDto,
    @Args('cartItemDto') cartItemDto: CartItemDto,
  ): Promise<CartResponse> {
    return await this.cartService.addToCart(user?.id, cartItemDto)
  }

  @Mutation(returns => String)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async emptyCart (@CurrentUser() user: CurrentUserDto) {
    return await this.cartService.emtyCart(user?.id)
  }

  @Mutation(returns => String)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async deleteProductFromCart (
    @CurrentUser() user: CurrentUserDto,
    @Args('productId', ParseIntPipe) productId: number,
  ) {
    return await this.cartService.deleteCart(user?.id, productId)
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async updateQuantity (
    @CurrentUser() user: CurrentUserDto,
    @Args('cartItemDto') cartItemDto: CartItemDto,
  ) {
    return await this.cartService.updateQuantity(user?.id, cartItemDto)
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async updateColor (
    @CurrentUser() user: CurrentUserDto,
    @Args('cartItemDto') cartItemDto: CartItemDto,
  ) {
    return await this.cartService.updateColor(user?.id, cartItemDto)
  }

  @Mutation(() => Int)
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async checkTotalCart (@CurrentUser() user: CurrentUserDto) {
    return await this.cartService.checkTotalCart(user?.id)
  }
}
