import { FindAllUsersQuery } from '@/graphql/generated/output'

export interface IAuthFormData {
	login: string
	password: string
	email: string
}

export enum EnumSecureStore {
	ACCESS_TOKEN = 'accessToken',
	REFRESH_TOKEN = 'refreshToken'
}

export enum EnumAsyncStorage {
	USER_ID = 'userId'
}

export interface ITokens {
	accessToken: string
	refreshToken: string
}

export interface IAuthResponse extends ITokens {
	user: FindAllUsersQuery['findAllUsers'][0]
}
