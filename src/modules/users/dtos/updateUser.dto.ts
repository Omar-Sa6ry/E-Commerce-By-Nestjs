import { Field, InputType } from '@nestjs/graphql'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
} from 'class-validator'

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string

  @Field({ nullable: true })
  @IsOptional()
  avatar?: CreateImagDto

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  addressId?: number
}
