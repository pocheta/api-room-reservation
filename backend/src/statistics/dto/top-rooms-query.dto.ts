import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class TopRoomsQueryDto {
	@ApiPropertyOptional({ example: 3, minimum: 1, maximum: 10, default: 3 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(10)
	limit: number = 3
}
