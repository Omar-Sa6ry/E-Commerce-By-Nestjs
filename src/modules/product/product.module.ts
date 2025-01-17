import { Module } from '@nestjs/common'
import { Product } from './entity/product.entity'
import { ProductResolver } from './product.resolver'
import { ProductService } from './produt.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CompanyModule } from '../company/company.module'
import { ColorModule } from '../color/color.module'
import { Color } from '../color/entity/color.entity'
import { UserModule } from '../users/users.module'
import { Images } from './entity/images.entity'
import { UploadModule } from '../upload/upload.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Images, Color]),
    CompanyModule,
    UploadModule,
    UserModule,
    ColorModule,
  ],
  providers: [ProductResolver, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
