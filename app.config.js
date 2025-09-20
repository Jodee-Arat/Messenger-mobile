import 'dotenv/config'

export default {
	expo: {
		name: 'messenger',
		slug: 'messenger',
		extra: {
			SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
			MEDIA_URL: process.env.EXPO_PUBLIC_MEDIA_URL,
			TELEGRAM_BOT_NAME: process.env.EXPO_PUBLIC_TELEGRAM_BOT_NAME,
			WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL
		}
	}
}
