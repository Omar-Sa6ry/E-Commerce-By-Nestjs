import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { Inject, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { AuthService } from './auth.service'
import { User } from '../users/entity/user.entity'
import { AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/createUserData.dto'
import { LoginDto } from './dtos/login.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { ChangePasswordDto } from './dtos/changePassword.dto'
import { NoToken } from 'src/common/constant/messages.constant'
import { Roles } from 'src/common/decerator/roles'
import { CreateAddressDto } from '../address/dtos/createAddress.dto'
import { Role } from 'src/common/constant/enum.constant'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import { RedisService } from 'src/common/redis/redis.service'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private authService: AuthService,
        private readonly redisService: RedisService
,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('createAddressDto') createAddressDto: CreateAddressDto,
    @Args('avatar') avatar: CreateImagDto,
  ) {
    const userCacheKey = `user:${createUserDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

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
    const cachedUser = await this.redisService.get(userCacheKey)

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
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.adminLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async managerLogin (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser) {
      return { result: cachedUser }
    }

    return await this.authService.managerLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async companyLogin (@Args('loginDto') loginDto: LoginDto) {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

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
