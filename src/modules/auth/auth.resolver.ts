import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { Inject, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from 'src/guard/auth.guard'
import { CurrentUserDto } from 'src/dtos/currentUser.dto'
import { CurrentUser } from 'src/decerator/currentUser.decerator'
import { AuthService } from './auth.service'
import { User } from '../users/entity/user.entity'
import { AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/createUserData.dto'
import { LoginDto } from './dtos/login.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { CheckEmail } from 'src/dtos/checkEmail.dto '
import { ChangePasswordDto } from './dtos/changePassword.dto'
import { NoToken } from 'src/constant/messages.constant'
import { Roles } from 'src/decerator/roles'
import { CreateAddressDto } from '../address/dtos/createAddress.dto'
import { Role } from 'src/constant/enum.constant'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { CreateImagDto } from '../upload/dtos/createImage.dto'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('createAddressDto') createAddressDto: CreateAddressDto,
    @Args('avatar') avatar: CreateImagDto,
  ) {
    const userCacheKey = `user:${createUserDto.email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.register(
      createUserDto,
      createAddressDto,
      avatar,
    )
  }

  @Mutation(returns => AuthResponse)
  async login (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.login(loginDto)
  }

  @Mutation(returns => String)
  async forgotPassword (@Args('checkEmail') checkEmail: CheckEmail) {
    await this.authService.forgotPassword(checkEmail)
  }

  @Mutation(returns => String)
  async resetPassword (
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(resetPasswordDto)
  }

  @Mutation(returns => String)
  @UseGuards(AuthGuard)
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user?.email, changePasswordDto)
  }

  @Mutation(returns => AuthResponse)
  async adminLogin (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.adminLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async managerLogin (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.managerLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async companyLogin (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.companyLogin(loginDto)
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @Roles(Role.USER, Role.COMPANY, Role.ADMIN, Role.MANAGER)
  async logout (@Context('req') req): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '')
    console.log(token)
    if (!token) {
      throw new Error(NoToken)
    }
    return true
  }
}
