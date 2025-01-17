import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Address } from './entity/address.entity'
import { AddressResolver } from './address.resolver'
import { AddressService } from './address.service'
import { UserModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Address]), UserModule],
  providers: [AddressResolver, AddressService],
  exports: [AddressService],
})
export class AddressModule {}
