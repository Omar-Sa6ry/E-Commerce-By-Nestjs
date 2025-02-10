import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ColorNotFound } from 'src/common/constant/messages.constant'
import { Color } from './entity/color.entity'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class ColorService {
  constructor (
    @InjectRepository(Color) private colorRepository: Repository<Color>,
  ) {}

  async create (name: string, quantity: number, productId: number) {
    const color = await this.colorRepository.create({
      name,
      quantity,
      productId,
    })
    await this.colorRepository.save(color)
    return color
  }

  async find (name: string) {
    const color = await this.colorRepository.findOne({ where: { name } })
    if (!color) {
      throw new NotFoundException(`Color with ${name} not found`)
    }
    return color
  }

  async findById (id: number) {
    const color = await this.colorRepository.findOne({ where: { id } })
    if (!color) {
      throw new NotFoundException(`Color with ${id} not found`)
    }
    return color
  }

  async findByProductId (productId: number) {
    const color = await this.colorRepository.find({ where: { productId } })
    if (color.length === 0) {
      throw new NotFoundException(`Color with ${productId} not found`)
    }
    return color
  }

  async update (id: number, name: string) {
    const existingColorById = await this.colorRepository.findOne({
      where: { id },
    })
    if (!existingColorById) {
      throw new BadRequestException(ColorNotFound)
    }

    Object.assign(existingColorById, { name })
    return this.colorRepository.save(existingColorById)
  }

  async delete (id: number) {
    const color = await this.colorRepository.findOne({ where: { id } })
    if (!color) {
      throw new NotFoundException(ColorNotFound)
    }

    await this.colorRepository.remove(color)
    return `Color with id ${id} successfully deleted`
  }
}
