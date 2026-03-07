import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { ReservationResponse, RoomReservationCount } from '@/types'
import { Prisma, Reservation, ReservationStatus } from '@/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RoomsService } from '@/rooms/rooms.service'
import { ReservationMapper } from './reservation.mapper'
import { CreateReservationDto } from './dto/create-reservation.dto'
import { UpdateReservationDto } from './dto/update-reservation.dto'

@Injectable()
export class ReservationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly roomsService: RoomsService,
	) {}

	async create(userId: string, dto: CreateReservationDto): Promise<ReservationResponse> {
		const startTime: Date = new Date(dto.startTime)
		const endTime: Date = new Date(dto.endTime)
		this.validateStartAndEndTime(startTime, endTime)

		const roomId: string = await this.roomsService.resolveId(dto.roomId, dto.roomName)

		const reservation: Reservation = await this.prisma.$transaction(
			async (tx: Prisma.TransactionClient): Promise<Reservation> => {
				await this.assertRoomAvailable(tx, roomId, startTime, endTime)
				return tx.reservation.create({
					data: { title: dto.title, startTime, endTime, roomId, userId },
				})
			},
		)

		return ReservationMapper.toResponse(reservation)
	}

	async update(userId: string, id: string, dto: UpdateReservationDto): Promise<ReservationResponse> {
		const reservation: Reservation = await this.prisma.$transaction(
			async (tx: Prisma.TransactionClient): Promise<Reservation> => {
				const existing: Reservation = await this.validateMutation(tx, userId, id)

				const startTime: Date = dto.startTime ? new Date(dto.startTime) : existing.startTime
				const endTime: Date = dto.endTime ? new Date(dto.endTime) : existing.endTime

				this.validateStartAndEndTime(startTime, endTime)

				await this.assertRoomAvailable(tx, existing.roomId, startTime, endTime, id)

				return tx.reservation.update({
					where: { id },
					data: { ...dto, startTime, endTime },
				})
			},
		)

		return ReservationMapper.toResponse(reservation)
	}

	findConfirmedInPeriod(start: Date, end: Date): Promise<Reservation[]> {
		return this.prisma.reservation.findMany({
			where: {
				status: ReservationStatus.CONFIRMED,
				startTime: { lt: end },
				endTime: { gt: start },
			},
		})
	}

	findAllConfirmed(): Promise<Reservation[]> {
		return this.prisma.reservation.findMany({
			where: { status: ReservationStatus.CONFIRMED },
		})
	}

	async findConfirmedGroupedByRoom(limit: number): Promise<RoomReservationCount[]> {
		type GroupRow = { roomId: string; _count: { id: number } }

		return (
			await this.prisma.reservation.groupBy({
				by: ['roomId'],
				where: { status: ReservationStatus.CONFIRMED },
				_count: { id: true },
				orderBy: { _count: { id: 'desc' } },
				take: limit,
			})
		).map((g: GroupRow): RoomReservationCount => ({ roomId: g.roomId, reservationCount: g._count.id }))
	}

	async remove(userId: string, id: string): Promise<void> {
		await this.prisma.$transaction(async (tx: Prisma.TransactionClient): Promise<void> => {
			await this.validateMutation(tx, userId, id)
			await tx.reservation.update({
				where: { id },
				data: { status: ReservationStatus.CANCELLED },
			})
		})
	}

	private validateStartAndEndTime(startTime: Date, endTime: Date): void {
		this.assertDateInFuture(startTime, 'Start time must be in the future')
		this.assertEndAfterStart(startTime, endTime)
	}

	private async validateMutation(tx: Prisma.TransactionClient, userId: string, id: string): Promise<Reservation> {
		const reservation: Reservation = await this.getById(tx, id)
		this.assertOwnership(userId, reservation.userId)
		this.assertConfirmed(reservation.status)
		this.assertDateInFuture(reservation.endTime, 'Reservation has already ended')
		return reservation
	}

	private async getById(tx: Prisma.TransactionClient, id: string): Promise<Reservation> {
		const reservation: Reservation | null = await tx.reservation.findUnique({
			where: { id },
		})

		if (!reservation) throw new NotFoundException('Reservation not found')
		return reservation
	}

	private assertOwnership(userId: string, reservationUserId: string): void {
		if (reservationUserId !== userId) throw new ForbiddenException()
	}

	private assertConfirmed(status: ReservationStatus): void {
		if (status === ReservationStatus.CANCELLED)
			throw new UnprocessableEntityException('Reservation is already cancelled')
	}

	private assertDateInFuture(date: Date, message: string): void {
		if (date < new Date()) throw new UnprocessableEntityException(message)
	}

	private assertEndAfterStart(startTime: Date, endTime: Date): void {
		if (endTime <= startTime) throw new UnprocessableEntityException('End time must be after start time')
	}

	private async assertRoomAvailable(
		tx: Prisma.TransactionClient,
		roomId: string,
		startTime: Date,
		endTime: Date,
		excludeId?: string,
	): Promise<void> {
		const conflict: Reservation | null = await tx.reservation.findFirst({
			where: {
				roomId,
				status: ReservationStatus.CONFIRMED,
				startTime: { lt: endTime },
				endTime: { gt: startTime },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		})

		if (conflict) throw new UnprocessableEntityException('Room is not available for the requested time slot')
	}
}
