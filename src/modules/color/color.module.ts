import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../users/users.module'
import { Color } from './entity/color.entity'
import { ColorService } from './color.service'
import { ColorResolver } from './color.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Color]), UserModule,ColorModule],
  providers: [ColorResolver, ColorService],
  exports: [ColorService],
})
export class ColorModule {}
