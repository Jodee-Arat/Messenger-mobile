import 'dotenv/config'

export default {
	expo: {
		name: 'messenger mobile',
		slug: 'client',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './app/assets/icon.png',
		userInterfaceStyle: 'light',
		splash: {
			image: './app/assets/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#4fae5a'
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.vadimteacoder.client'
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './app/assets/adaptive-icon.png',
				backgroundColor: '#4fae5a'
			},
			softwareKeyboardLayoutMode: 'resize',
			package: 'com.vadim_teacoder.client'
		},
		androidStatusBar: {
			translucent: false
		},
		androidNavigationBar: {
			backgroundColor: '#161320',
			barStyle: 'light-content',
			enforceContrast: false
		},
		web: {
			bundler: 'metro',
			favicon: './app/assets/favicon.png'
		},
		plugins: ['expo-secure-store'],
		extra: {
			API_URL: `http://${process.env.BASE_URL}:4000`,
			GRAPHQL_URL: `http://${process.env.BASE_URL}:4000/graphql`,
			SERVER_URL: `http://${process.env.BASE_URL}:4000/graphql`,
			MEDIA_URL: process.env.EXPO_PUBLIC_MEDIA_URL,
			// TELEGRAM_BOT_NAME: process.env.EXPO_PUBLIC_TELEGRAM_BOT_NAME,
			WEBSOCKET_URL: `ws://${process.env.BASE_URL}:4000/graphql`,
			eas: {
				projectId: 'b89ba73b-ecb4-479a-b3f3-0e5cd33646f1'
			}
		}
	}
}
