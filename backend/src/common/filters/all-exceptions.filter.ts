import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger: Logger = new Logger(AllExceptionsFilter.name)

	catch(exception: unknown, host: ArgumentsHost): void {
		const response: Response = host.switchToHttp().getResponse<Response>()

		if (exception instanceof HttpException) {
			const status: number = exception.getStatus()
			const body: string | { message: string | string[] } = exception.getResponse() as
				| string
				| { message: string | string[] }

			response.status(status).json({
				statusCode: status,
				message: typeof body === 'string' ? body : body.message,
				timestamp: new Date().toISOString(),
			})
			return
		}

		this.logger.error(exception)

		response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Internal server error',
			timestamp: new Date().toISOString(),
		})
	}
}
