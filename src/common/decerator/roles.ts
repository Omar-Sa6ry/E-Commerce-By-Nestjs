import { SetMetadata } from '@nestjs/common'
import { Role } from 'src/common/constant/enum.constant'

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)
