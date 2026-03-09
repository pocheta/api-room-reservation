import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import type { UserSummary } from '@/types'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@ApiOperation({ summary: 'List all users' })
	@ApiResponse({ status: 200, description: 'Returns the list of all users' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	findAll(): Promise<UserSummary[]> {
		return this.usersService.findAll()
	}
}
