import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { AuthService } from './auth.service'
import { User } from '../users/entity/user.entity'
import { AuthOutPut, AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/createUserData.dto'
import { LoginDto } from './dtos/login.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { ChangePasswordDto } from './dtos/changePassword.dto'
import { NoToken } from 'src/common/constant/messages.constant'
import { CreateAddressDto } from '../address/dtos/createAddress.dto'
import { Role } from 'src/common/constant/enum.constant'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { Auth } from 'src/common/decerator/auth.decerator'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('createAddressDto') createAddressDto: CreateAddressDto,
    @Args('avatar', { nullable: true }) avatar: CreateImagDto,
  ): Promise<AuthResponse> {
    return {
      statusCode: 201,
      message: 'You signup in app successfully',
      data: await this.authService.register(
        createUserDto,
        createAddressDto,
        avatar,
      ),
    }
  }

  @Mutation(returns => AuthResponse)
  async login (@Args('loginDto') loginDto: LoginDto): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.login(loginDto) }
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
  @Auth(Role.USER)
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user?.email, changePasswordDto)
  }

  @Mutation(returns => AuthResponse)
  async adiminLogin (
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.adminLogin(loginDto) }
  }

  @Mutation(returns => AuthResponse)
  async managerLogin (
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.managerLogin(loginDto) }
  }

  @Mutation(returns => AuthResponse)
  async companyLogin (
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.companyLogin(loginDto) }
  }

  @Mutation(() => Boolean)
  @Auth(Role.USER, Role.COMPANY, Role.ADMIN, Role.MANAGER)
  async logout (@Context('req') req): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error(NoToken)
    }
    return true
  }
}
