import { Field, Int, InputType, ObjectType } from '@nestjs/graphql'

@InputType()
export class CreatePColorDto {
  @Field()
  name: string

  @Field(() => Int)
  quantity: number
}

@ObjectType()
 export class ColorResponse {
  @Field()
  name: string

  @Field(() => Int)
  quantity: number
}