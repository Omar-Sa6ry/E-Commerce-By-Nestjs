import { Module } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { GenerateToken } from './config/jwt.service'
import { UserModule } from '../users/users.module'
import { User } from '../users/entity/user.entity'
import { AddressModule } from '../address/address.module'
import { QueueModule } from 'src/queue/queue.module'
import { SendEmailService } from 'src/queue/services/sendemail.service'
import { UploadModule } from 'src/common/upload/upload.module'
import { RedisModule } from 'src/common/redis/redis.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    UserModule,
    AddressModule,
    UploadModule,
    QueueModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'huigyufutftydty',
      signOptions: { expiresIn: process.env.JWT_EXPIRE },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    SendEmailService,
    GenerateToken,
    JwtService,
  ],
})
export class AuthModule {}
