import { Module } from '@nestjs/common'
import { CartResolver } from './cart.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cart } from './entity/cart.entity'
import { CartService } from './cart.service'
import { Product } from '../product/entity/product.entity'
import { CompanyModule } from '../company/company.module'
import { ColorModule } from '../color/color.module'
import { Images } from '../product/entity/images.entity'
import { Color } from '../color/entity/color.entity'
import { CartItem } from './entity/cartItem.enitty'
import { ProductModule } from '../product/product.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, Color, Images]),
    CompanyModule,
    ColorModule,
    ProductModule
  ],
  providers: [CartService, CartResolver],
})
export class CartModule {}
