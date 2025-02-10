import { CreateAddressDto } from './../address/dtos/createAddress.dto'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Company } from './entity/company.entity'
import { CreateCompanyDto } from './dtos/createCompany.dto'
import { UpdateCompanyDto } from './dtos/updateCompany.dto'
import {
  AddressRequire,
  CompanyNotFound,
  CompanysNotFound,
  EndOfEmail,
} from 'src/common/constant/messages.constant'
import { AddressService } from '../address/address.service'

@Injectable()
export class CompanyService {
  constructor (
    private addressService: AddressService,

    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}

  async create (
    createCompanyDto: CreateCompanyDto,
    createAddressDto: CreateAddressDto,
  ): Promise<Company> {
    const { email } = createCompanyDto

    const queryRunner =
      this.companyRepository.manager.connection.createQueryRunner()
    await queryRunner.startTransaction()

    try {
      const exitedCompany = await queryRunner.manager.findOne(Company, {
        where: { name: createCompanyDto.name },
      })

      if (exitedCompany) {
        throw new BadRequestException(
          `Company with ${createCompanyDto.name} is found`,
        )
      }

      // Validate the email
      if (!email.endsWith('@gmail.com')) {
        throw new BadRequestException(EndOfEmail)
      }

      // Create the address within the transaction
      const address = await this.addressService.create(createAddressDto)

      const company = this.companyRepository.create({
        ...createCompanyDto,
        addressId: address.id,
      })

      await queryRunner.manager.save(company)
      await queryRunner.commitTransaction()

      return company
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error // Rethrow the error to handle it outside
    } finally {
      await queryRunner.release()
    }
  }

  async find (name: string) {
    const company = await this.companyRepository.findOne({ where: { name } })
    if (!company) {
      throw new NotFoundException(`Company with ${name} not found`)
    }
    return company
  }

  async findById (id: number) {
    const company = await this.companyRepository.findOne({ where: { id } })
    if (!company) {
      throw new NotFoundException(`Company with ${id} not found`)
    }
    return company
  }

  async findAll () {
    const companys = await this.companyRepository.find()
    if (companys.length === 0) {
      throw new NotFoundException(CompanysNotFound)
    }
    return companys
  }

  async update (id: number, updateCompanyDto: UpdateCompanyDto) {
    const { addressId } = updateCompanyDto
    const existingCompanyById = await this.companyRepository.findOne({
      where: { id },
    })
    if (!existingCompanyById) {
      throw new BadRequestException(CompanyNotFound)
    }

    if (!addressId) {
      throw new BadRequestException(AddressRequire)
    }

    Object.assign(existingCompanyById, updateCompanyDto)
    return this.companyRepository.save(existingCompanyById)
  }

  async delete (id: number) {
    const company = await this.companyRepository.findOne({ where: { id } })
    if (!company) {
      throw new NotFoundException(CompanyNotFound)
    }
    await this.companyRepository.remove(company)
    return `Company with id ${id} successfully deleted`
  }
}
