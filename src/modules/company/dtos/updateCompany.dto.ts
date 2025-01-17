import { InputType, Field } from '@nestjs/graphql'
import {
  IsEmail,
  IsLowercase,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

@InputType()
export class UpdateCompanyDto {
  @Field()
  @IsOptional()
  @IsString()
  name: string

  @Field()
  @IsOptional()
  @IsNumber()
  addressId: string

  @Field()
  @IsOptional()
  @IsEmail()
  @IsLowercase()
  email: string

  @Field()
  @IsOptional()
  @IsPhoneNumber()
  phone: string

  @Field()
  @IsOptional()
  @IsOptional()
  website: string
}
