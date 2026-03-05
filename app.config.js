import 'dotenv/config'

export default {
	expo: {
		name: 'messenger',
		slug: 'messenger',
		extra: {
			SERVER_URL: `http://${process.env.BASE_URL}:4000/graphql`,
			MEDIA_URL: process.env.EXPO_PUBLIC_MEDIA_URL,
			// TELEGRAM_BOT_NAME: process.env.EXPO_PUBLIC_TELEGRAM_BOT_NAME,
			WEBSOCKET_URL: `ws://${process.env.BASE_URL}:4000/graphql`
		}
	}
}
