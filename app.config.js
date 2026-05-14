import 'dotenv/config'

const trimTrailingSlash = value => value?.replace(/\/+$/, '')

const baseUrl = trimTrailingSlash(process.env.BASE_URL)
const devApiUrl = baseUrl ? `http://${baseUrl}:4000` : undefined
const apiUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL) ?? devApiUrl
const configuredGraphqlUrl =
	process.env.EXPO_PUBLIC_GRAPHQL_URL ?? process.env.EXPO_PUBLIC_SERVER_URL
const graphqlUrl =
	trimTrailingSlash(configuredGraphqlUrl) ??
	(apiUrl ? `${apiUrl}/graphql` : undefined)
const websocketUrl =
	trimTrailingSlash(process.env.EXPO_PUBLIC_WEBSOCKET_URL) ??
	(baseUrl ? `ws://${baseUrl}:4000/graphql` : undefined)

export default {
	expo: {
		name: 'МесАгат',
		slug: 'client',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './app/assets/icon.png',
		userInterfaceStyle: 'light',
		splash: {
			image: './app/assets/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#161320'
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.vadimteacoder.client'
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './app/assets/adaptive-icon.png',
				backgroundColor: '#00000000'
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
		plugins: [
			'expo-secure-store',
			[
				'expo-camera',
				{
					cameraPermission:
						'Разрешите приложению сканировать QR-код для привязки браузера к секретному Избранному.'
				}
			]
		],
		extra: {
			API_URL: apiUrl,
			GRAPHQL_URL: graphqlUrl,
			SERVER_URL: graphqlUrl,
			MEDIA_URL: process.env.EXPO_PUBLIC_MEDIA_URL,
			// TELEGRAM_BOT_NAME: process.env.EXPO_PUBLIC_TELEGRAM_BOT_NAME,
			WEBSOCKET_URL: websocketUrl,
			eas: {
				projectId: 'b89ba73b-ecb4-479a-b3f3-0e5cd33646f1'
			}
		}
	}
}
