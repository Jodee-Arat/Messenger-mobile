import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Toast from '@/components/ui/Toast'

import { useTheme } from '@/hooks/useTheme'

import { ApolloClientProvider } from '@/providers/ApolloClientProvider'
import AuthProvider from '@/providers/auth/AuthProvider'

import Navigation from '@/navigation/Navigation'

import './global.css'

// import './app/ErrorUtilsPolyfill'

export default function App() {
	const { colors, theme } = useTheme()

	useEffect(() => {
		if (Platform.OS !== 'android') return

		void SystemUI.setBackgroundColorAsync(colors.background)
		void NavigationBar.setButtonStyleAsync(
			theme === 'dark' ? 'light' : 'dark'
		)
	}, [colors.background, theme])

	return (
		<GestureHandlerRootView
			style={{ flex: 1, backgroundColor: colors.background }}
		>
			<ApolloClientProvider>
				<AuthProvider>
					<SafeAreaProvider>
						<Navigation />
					</SafeAreaProvider>
				</AuthProvider>
				<StatusBar
					style={theme === 'dark' ? 'light' : 'dark'}
					backgroundColor={colors.backgroundSecondary}
					translucent={false}
				/>
				<Toast />
			</ApolloClientProvider>
		</GestureHandlerRootView>
	)
}
