import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { CurrentUserDto } from 'src/dtos/currentUser.dto'
import { CurrentUser } from 'src/decerator/currentUser.decerator'
import {
  Inject,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from 'src/guard/auth.guard'
import { RoleGuard } from 'src/guard/role.guard'
import { CheckEmail } from 'src/dtos/checkEmail.dto '
import { UpdateUserDto } from './dtos/updateUser.dto'
import { Roles } from 'src/decerator/roles'
import { Role } from 'src/constant/enum.constant'
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { serialize } from 'typeorm'

@Resolver(() => User)
export class UserResolver {
  constructor (
    private usersService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Query(returns => User)
  @UseGuards(AuthGuard, RoleGuard)
  async getUserById (@Args('id', ParseIntPipe) id: number) {
    const userCacheKey = `user:${id}`
    const cachedUser = await this.cacheManager.get(userCacheKey)
    if (cachedUser) {
      return { user: cachedUser, token: 'cached_token' }
    }

    return await this.usersService.findById(id)
  }

  @Query(returns => User)
  @UseGuards(RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  async getUserByEmail (@Args('checkEmail') checkEmail: CheckEmail) {
    const email: string = checkEmail.email
    const userCacheKey = `user:${email}`
    const cachedUser = await this.cacheManager.get(userCacheKey)
    if (cachedUser) {
      return { user: cachedUser, token: 'cached_token' }
    }

    return await this.usersService.findByEmail(email)
  }

  @Mutation(returns => User)
  @UseGuards(AuthGuard)
  async updateUser (
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return await this.usersService.updateUser(updateUserDto, user?.id)
  }

  @Query(returns => String)
  @UseGuards(AuthGuard)
  async deleteUser (@CurrentUser() user: CurrentUserDto) {
    return await this.usersService.deleteUser(user.email)
  }

  @Mutation(returns => String)
  @UseGuards(AuthGuard, RoleGuard)
  async UpdateUserRole (
    @Args('checkEmail') checkEmail: CheckEmail,
    @Args('companyId', ParseIntPipe) companyId: number,
  ) {
    const email = checkEmail.email
    return await this.usersService.editUserRole(email, companyId)
  }
}
