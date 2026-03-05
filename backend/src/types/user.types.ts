export type UserSummary = {
	firstname: string
	lastname: string
	email: string
}

export type TokenUser = {
	id: string
	email: string
}

export type UserCredentials = TokenUser & {
	password: string
}

export type CreateUserData = {
	email: string
	password: string
	firstname: string
	lastname: string
}
