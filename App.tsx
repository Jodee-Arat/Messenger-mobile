import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Toast from '@/components/ui/Toast'

import { ApolloClientProvider } from '@/providers/ApolloClientProvider'
import AuthProvider from '@/providers/auth/AuthProvider'

import Navigation from '@/navigation/Navigation'

// import './app/ErrorUtilsPolyfill'

export default function App() {
	return (
		<ApolloClientProvider>
			<AuthProvider>
				<SafeAreaProvider>
					<Navigation />
				</SafeAreaProvider>
			</AuthProvider>
			<StatusBar style='auto' />
			<Toast />
		</ApolloClientProvider>
	)
}
