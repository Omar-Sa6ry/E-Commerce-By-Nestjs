import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ProductFilterDto {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  category?: string

  @Field({ nullable: true })
  company?: string

  @Field({ nullable: true })
  minPrice?: number

  @Field({ nullable: true })
  maxPrice?: number
}
