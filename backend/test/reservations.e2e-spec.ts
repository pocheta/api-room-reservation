const BASE_URL: string = 'http://room-reservation.localhost/api'

async function post(path: string, body: unknown, token?: string): Promise<Response> {
	return fetch(`${BASE_URL}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify(body),
	})
}

async function get(path: string, token: string): Promise<Response> {
	return fetch(`${BASE_URL}${path}`, {
		headers: { Authorization: `Bearer ${token}` },
	})
}

async function patch(path: string, body: unknown, token: string): Promise<Response> {
	return fetch(`${BASE_URL}${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify(body),
	})
}

async function del(path: string, token: string): Promise<Response> {
	return fetch(`${BASE_URL}${path}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	})
}

describe('Reservations flow', () => {
	let token: string
	let roomName: string
	let reservationId: string

	it('POST /auth/register — registers a new user and returns an access token', async () => {
		const res: Response = await post('/auth/register', {
			email: `e2e-${Date.now()}@test.com`,
			password: 'password123',
			firstname: 'E2E',
			lastname: 'Test',
		})
		const body: { access_token?: string } = (await res.json()) as { access_token?: string }

		expect(res.status).toBe(201)
		expect(body.access_token).toBeDefined()
		token = body.access_token!
	})

	it('GET /rooms — returns a non-empty list of rooms', async () => {
		const res: Response = await get('/rooms', token)
		const body: { name: string }[] = (await res.json()) as { name: string }[]

		expect(res.status).toBe(200)
		expect(Array.isArray(body)).toBe(true)
		expect(body.length).toBeGreaterThan(0)
		roomName = body[0].name
		expect(roomName).toBeTruthy()
	})

	it('POST /reservations — creates a reservation', async () => {
		const start: Date = new Date(Date.now() + 1000 * 60 * 60 * 48)
		const end: Date = new Date(start.getTime() + 1000 * 60 * 90)

		const res: Response = await post(
			'/reservations',
			{ title: 'E2E Meeting', startTime: start.toISOString(), endTime: end.toISOString(), roomName },
			token,
		)
		const body: { id?: string; title?: string } = (await res.json()) as { id?: string; title?: string }

		expect(res.status).toBe(201)
		expect(body.title).toBe('E2E Meeting')
		reservationId = body.id!
	})

	it('PATCH /reservations/:id — updates the reservation title', async () => {
		const res: Response = await patch(`/reservations/${reservationId}`, { title: 'E2E Meeting Updated' }, token)
		const body: { title?: string } = (await res.json()) as { title?: string }

		expect(res.status).toBe(200)
		expect(body.title).toBe('E2E Meeting Updated')
	})

	it('DELETE /reservations/:id — cancels the reservation', async () => {
		const res: Response = await del(`/reservations/${reservationId}`, token)
		expect(res.status).toBe(204)
	})

	it('DELETE /reservations/:id — returns 422 when already cancelled', async () => {
		const res: Response = await del(`/reservations/${reservationId}`, token)
		expect(res.status).toBe(422)
	})
})
