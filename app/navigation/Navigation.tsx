// Navigation.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FC, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

import BottomMenu from '@/components/layout/bottom-menu/BottomMenu'

import { useAuth } from '@/hooks/useAuth'

import { navigationRef } from './navigate'
import { TypeRootStackParamList } from './navigation.types'
import { routes } from './routes'

// <-- глобальный ref

const Stack = createNativeStackNavigator<TypeRootStackParamList>()

const Navigation: FC = () => {
	const scheme = useColorScheme()
	const { isAuthenticated } = useAuth()
	const [currentRoute, setCurrentRoute] = useState<string | undefined>(
		undefined
	)

	useEffect(() => {
		setCurrentRoute(navigationRef.getCurrentRoute()?.name)
		const listener = navigationRef.addListener('state', () =>
			setCurrentRoute(navigationRef.getCurrentRoute()?.name)
		)
		return () => {
			navigationRef.removeListener('state', listener)
		}
	}, [])

	const backgroundColor = scheme === 'dark' ? '#F6F7FB' : '#252136'

	return (
		<>
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor }
					}}
				>
					{routes.map(route => (
						<Stack.Screen key={route.name} {...route} />
					))}
				</Stack.Navigator>
			</NavigationContainer>

			{isAuthenticated &&
				navigationRef.isReady() &&
				currentRoute !== 'Chat' && (
					<BottomMenu
						nav={screenName =>
							navigationRef.navigate(screenName as any)
						}
						currentRoute={currentRoute}
					/>
				)}
		</>
	)
}

export default Navigation
