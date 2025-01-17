import { InputType, Field } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateAddressDto {
  @Field()
  @IsOptional()
  @IsString()
  city: string

  @Field()
  @IsOptional()
  @IsString()
  street: string

  @Field()
  @IsOptional()
  @IsString()
  government: string

  @Field()
  @IsOptional()
  @IsString()
  country: string

  @Field()
  @IsOptional()
  @IsInt()
  zipCode: number
}
