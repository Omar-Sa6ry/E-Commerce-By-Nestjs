import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UploadService } from './upload.service'
import { Images } from 'src/modules/product/entity/images.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Images])],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
