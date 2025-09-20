import Constants from 'expo-constants'

export const SERVER_URL = Constants.expoConfig?.extra?.SERVER_URL as string
export const MEDIA_URL = Constants.expoConfig?.extra?.MEDIA_URL as string
export const TELEGRAM_BOT_NAME = Constants.expoConfig?.extra
	?.TELEGRAM_BOT_NAME as string
export const WEBSOCKET_URL = Constants.expoConfig?.extra
	?.WEBSOCKET_URL as string
