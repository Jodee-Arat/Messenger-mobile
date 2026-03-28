import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra ?? {}

export const API_URL = extra.API_URL as string
export const GRAPHQL_URL = (extra.GRAPHQL_URL ?? extra.SERVER_URL) as string
export const SERVER_URL = GRAPHQL_URL
export const MEDIA_URL = extra.MEDIA_URL as string
export const TELEGRAM_BOT_NAME = Constants.expoConfig?.extra
	?.TELEGRAM_BOT_NAME as string
export const WEBSOCKET_URL = extra.WEBSOCKET_URL as string
