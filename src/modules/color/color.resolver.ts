import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/guard/role.guard'
import { Roles } from 'src/decerator/roles'
import { AuthGuard } from 'src/guard/auth.guard'
import { Color } from './entity/color.entity'
import { ColorService } from './color.service'
import { Role } from 'src/constant/enum.constant'
import { CreateColorDto } from './dto/createColor.dto'

@Resolver(of => Color)
export class ColorResolver {
  constructor (private colorService: ColorService) {}

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COMPANY)
  @Mutation(() => Color)
  async createColor (@Args('createColorDto') createColorDto: CreateColorDto) {
    const { name, quantity, productId } = createColorDto
    return this.colorService.create(name, quantity, productId)
  }

  @Query(returns => Color, { nullable: true })
  getColorById (@Args('id', ParseIntPipe) id: number) {
    return this.colorService.findById(id)
  }

  @Query(returns => Color, { nullable: true })
  getColorByName (@Args('name') name: string) {
    return this.colorService.find(name)
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Color)
  async updateColor (
    @Args('id', ParseIntPipe) id: number,
    @Args('name') name: string,
  ) {
    return this.colorService.update(id, name)
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Query(() => String)
  async deleteColor (@Args('id', ParseIntPipe) id: number) {
    return this.colorService.delete(id)
  }
}
