import { InputType, Field } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'

@InputType()
export class CreateAddressDto {
  @Field()
  @IsString()
  city: string

  @Field()
  @IsString()
  street: string

  @Field()
  @IsString()
  government: string

  @Field()
  @IsString()
  country: string

  @Field()
  @IsInt()
  zipCode: number
}
