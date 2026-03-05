import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Toast from '@/components/ui/Toast'

import { ApolloClientProvider } from '@/providers/ApolloClientProvider'
import AuthProvider from '@/providers/auth/AuthProvider'

import Navigation from '@/navigation/Navigation'

import { settingsStore } from '@/store/settings/settings.store'

// import './app/ErrorUtilsPolyfill'

export default function App() {
	const theme = settingsStore(state => state.theme)

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ApolloClientProvider>
				<AuthProvider>
					<SafeAreaProvider>
						<Navigation />
					</SafeAreaProvider>
				</AuthProvider>
				<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
				<Toast />
			</ApolloClientProvider>
		</GestureHandlerRootView>
	)
}
