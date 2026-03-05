import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { JwtPayload } from '@/types'

export const CurrentUser: (...args: unknown[]) => ParameterDecorator = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): JwtPayload => {
		const request: Request = ctx.switchToHttp().getRequest<Request>()
		return request.user as JwtPayload
	},
)
