import { Module } from '@nestjs/common'
import { CompanyResolver } from './company.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CompanyService } from './company.service'
import { Company } from './entity/company.entity'
import { UserModule } from '../users/users.module'
import { AddressModule } from '../address/address.module'

@Module({
  imports: [TypeOrmModule.forFeature([Company]), UserModule, AddressModule],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
