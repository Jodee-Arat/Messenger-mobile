import { FindAllUsersQuery } from '@/graphql/generated/output'

export interface IAuthFormData {
	login: string
	password: string
	email: string
}

export enum EnumSecureStore {
	REFRESH_TOKEN = 'refreshToken'
}

export enum EnumAsyncStorage {
	ACCESS_TOKEN = 'accessToken',
	USER_ID = 'userId',
	MY_PRE_KEYS = 'myPreKeys'
}

export interface ITokens {
	accessToken: string
	refreshToken: string
}

export interface IAuthResponse extends ITokens {
	user: FindAllUsersQuery['findAllUsers'][0]
}
