import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateAddressDto } from './dtos/createAddress.dto'
import { Address } from './entity/address.entity'
import { UpdateAddressDto } from './dtos/updateAddress.dto'
import {
  AddressNotFound,
  NotMatchAddress,
} from 'src/common/constant/messages.constant'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class AddressService {
  constructor (
    @InjectRepository(Address) private addressRepository: Repository<Address>,
  ) {}

  async create (createAddressDto: CreateAddressDto) {
    const address = this.addressRepository.create(createAddressDto)
    await this.addressRepository.save(address)
    return address
  }

  async findById (id: number) {
    const address = await this.addressRepository.findOne({ where: { id } })
    if (!address) {
      throw new NotFoundException(`Address with ${id} not found`)
    }
    return address
  }

  async update (
    id: number,
    updateAddressDto: UpdateAddressDto,
    addressId: number,
  ): Promise<Address> {
    const existingAddressById = await this.addressRepository.findOne({
      where: { id },
    })
    if (!existingAddressById) {
      throw new BadRequestException(AddressNotFound)
    }

    if (existingAddressById.id !== addressId) {
      throw new BadRequestException(NotMatchAddress)
    }
    Object.assign(existingAddressById, updateAddressDto)
    return this.addressRepository.save(existingAddressById)
  }

  async delete (id: number, addressId: number) {
    const address = await this.addressRepository.findOne({ where: { id } })
    if (!address) {
      throw new NotFoundException(AddressNotFound)
    }
    if (address.id !== addressId) {
      throw new BadRequestException(NotMatchAddress)
    }

    await this.addressRepository.remove(address)
    return `Address with id ${id} successfully deleted`
  }
}
