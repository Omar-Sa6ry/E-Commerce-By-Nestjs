import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CompanyService } from './company.service'
import { Company } from './entity/company.entity'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/guard/role.guard'
import { Roles } from 'src/decerator/roles'
import { CurrentUser } from 'src/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/dtos/currentUser.dto'
import { CreateCompanyDto } from './dtos/createCompany.dto'
import { UpdateCompanyDto } from './dtos/updateCompany.dto'
import { Role } from 'src/constant/enum.constant'
import { CreateAddressDto } from '../address/dtos/createAddress.dto'

@Resolver(of => Company)
export class CompanyResolver {
  constructor (private companyService: CompanyService) {}

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => Company)
  async createCompany (
    @CurrentUser() user: CurrentUserDto,
    @Args('createCompanyDto')
    createCompanyDto: CreateCompanyDto,
    @Args('createAddressDto') createAddressDto: CreateAddressDto,
  ): Promise<Company> {
    return this.companyService.create(createCompanyDto, createAddressDto)
  }

  @Query(returns => Company, { nullable: true })
  getCompanyById (@Args('id', ParseIntPipe) id: number) {
    return this.companyService.findById(id)
  }

  @Query(returns => Company, { nullable: true })
  getCompanyByName (@Args('name') name: string) {
    return this.companyService.find(name)
  }

  @Query(returns => [Company], { nullable: true })
  getAllCompanys () {
    return this.companyService.findAll()
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => Company)
  async updateCompany (
    @Args('id', ParseIntPipe) id: number,
    @Args('updateCompanyDto') updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, updateCompanyDto)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => String)
  async deleteCompany (@Args('id', ParseIntPipe) id: number) {
    return this.companyService.delete(id)
  }
}
