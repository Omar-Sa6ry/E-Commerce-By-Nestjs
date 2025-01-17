import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { NoToken } from 'src/constant/messages.constant'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (private jwtService: JwtService) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext()
    const request = ctx.req

    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException(NoToken)
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })

      if (payload.id && payload.email) {
        request['user'] = {
          id: payload.id,
          email: payload.email,
          addressId: payload.addressId,
          companyId: payload.companyId,
        }
      } else {
        throw new UnauthorizedException('Invalid token payload')
      }
    } catch {
      throw new UnauthorizedException('Invalid token')
    }

    return true
  }

  extractTokenFromHeader (request: Request): string | null {
    const [type, token] = request.headers['authorization']?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
