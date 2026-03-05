export type JwtPayload = {
	sub: string
	email: string
}

export type AuthResponse = {
	access_token: string
}
