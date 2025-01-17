import { InputType, Field } from '@nestjs/graphql'
import {
  IsEmail,
  IsLowercase,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

@InputType()
export class CreateCompanyDto {
  @Field()
  @IsString()
  name: string

  @Field()
  @IsEmail()
  @IsLowercase()
  email: string

  @Field()
  @IsPhoneNumber()
  phone: string

  @Field()
  @IsOptional()
  website: string
}
