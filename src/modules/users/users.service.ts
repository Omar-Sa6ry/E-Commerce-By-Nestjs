import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entity/user.entity'
import { UpdateUserDto } from './dtos/updateUser.dto'
import { unlinkSync } from 'fs'
import { EmailIsWrong, EmailUsed } from 'src/common/constant/messages.constant'
import { Role } from 'src/common/constant/enum.constant'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as fs from 'fs'
import { UploadService } from 'src/common/upload/upload.service'
import { RedisService } from 'src/common/redis/redis.service'

@Injectable()
export class UserService {
  constructor (
    private uploadService: UploadService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findById (id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      return new NotFoundException(`User with this ${id} not found`)
    }

    const userCacheKey = `user:${user.id}`
    await this.redisService.set(userCacheKey, user, 3600)

    return user
  }

  async findByEmail (email: string) {
    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) {
      return new NotFoundException(`User with ${email} not found`)
    }
    const userCacheKey = `user:${user.email}`
    await this.redisService.set(userCacheKey, user, 3600)

    return user
  }

  async updateUser (updateUserDto: UpdateUserDto, id: number) {
    const query = this.userRepository.manager.connection.createQueryRunner()
    await query.startTransaction()
    try {
      const user = await this.userRepository.findOne({ where: { id } })
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`)
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        })
        if (existingUser) {
          throw new BadRequestException(EmailUsed)
        }
      }

      Object.assign(user, updateUserDto)

      if (updateUserDto.avatar) {
        const oldPath = user.avatar
        const filename = await this.uploadService.uploadImage(
          updateUserDto.avatar,
        )
        if (typeof filename === 'string') {
          user.avatar = filename

          if (oldPath && fs.existsSync(oldPath)) {
            unlinkSync(oldPath)
          }
        }
      }

      const userCacheKey = `user:${user.email}`
      await this.redisService.set(userCacheKey, user)

      await this.userRepository.save(user)
      await query.commitTransaction()
      return user
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async deleteUser (email: string) {
    const user = await this.findByEmail(email)
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    await this.userRepository.remove(user)
    return `User with email : ${email} deleted Successfully`
  }

  async editUserRole (email: string, companyId?: number) {
    const user = await this.findByEmail(email)
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    user.role = Role.ADMIN
    if (companyId !== undefined) {
      user.companyId = companyId
    }
    await this.userRepository.save(user)
    return `User with email : ${user.email} updated Successfully`
  }
}
