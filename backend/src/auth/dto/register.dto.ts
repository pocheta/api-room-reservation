import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
	@ApiProperty({ example: 'john.doe@example.com' })
	@IsEmail()
	email: string

	@ApiProperty({ example: 'password123', minLength: 8 })
	@IsString()
	@MinLength(8)
	password: string

	@ApiProperty({ example: 'John' })
	@IsString()
	@IsNotEmpty()
	firstname: string

	@ApiProperty({ example: 'Doe' })
	@IsString()
	@IsNotEmpty()
	lastname: string
}
