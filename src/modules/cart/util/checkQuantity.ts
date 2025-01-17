import { BadRequestException } from '@nestjs/common'
import { QuantityMsg } from 'src/constant/messages.constant'

export const CheckQuantity = (quantityOfProduct: number, quantity: number) => {
  if (quantityOfProduct < quantity) {
    throw new BadRequestException(QuantityMsg)
  }
}
