import { BadRequestException } from '@nestjs/common'
import { QuantityMsg } from 'src/common/constant/messages.constant'

export const CheckQuantity = (quantityOfProduct: number, quantity: number) => {
  if (quantityOfProduct < quantity) {
    throw new BadRequestException(QuantityMsg)
  }
}
