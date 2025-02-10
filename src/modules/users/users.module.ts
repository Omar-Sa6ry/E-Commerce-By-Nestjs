import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { UserResolver } from './users.resolver'
import { RedisModule } from 'src/common/redis/redis.module'
import { UploadModule } from 'src/common/upload/upload.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisModule, UploadModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
