import { FindAllUsersQuery } from '@/graphql/generated/output'

export interface IAuthFormData {
	login: string
	password: string
	email: string
	pin?: string
}

export enum EnumSecureStore {
	REFRESH_TOKEN = 'refreshToken',
	SECRET_SESSION_ID = 'secretSessionId'
}

export enum EnumAsyncStorage {
	ACCESS_TOKEN = 'accessToken',
	USER_ID = 'userId',
	SESSION_ID = 'sessionId',
	MY_PRE_KEYS = 'myPreKeys'
}

export interface ITokens {
	accessToken: string
	refreshToken: string
}

export interface IAuthResponse extends ITokens {
	user: FindAllUsersQuery['findAllUsers'][0]
}
