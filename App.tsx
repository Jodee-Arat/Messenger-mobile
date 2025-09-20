import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Toast from '@/components/ui/Toast'

import { ApolloClientProvider } from '@/providers/ApolloClientProvider'

import Navigation from '@/navigation/Navigation'

export default function App() {
	return (
		<ApolloClientProvider>
			<SafeAreaProvider>
				<Navigation />
			</SafeAreaProvider>
			<StatusBar style='auto' />
			<Toast />
		</ApolloClientProvider>
	)
}
