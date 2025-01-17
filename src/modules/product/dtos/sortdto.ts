import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class ProductSortDto {
  @Field({ nullable: true })
  price?: 'asc' | 'desc'

  @Field({ nullable: true })
  name?: 'asc' | 'desc'
}
