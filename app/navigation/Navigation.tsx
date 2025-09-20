import {
	NavigationContainer,
	useNavigationContainerRef
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FC, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

import BottomMenu from '@/components/layout/bottom-menu/BottomMenu'

import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'

import { TypeRootStackParamList } from './navigation.types'
import { routes } from './routes'

const Stack = createNativeStackNavigator<TypeRootStackParamList>()

const Navigation: FC = () => {
	const scheme = useColorScheme()

	const { isAuthenticated } = useAuth()

	const [currentRoute, setCurrentRoute] = useState<string | undefined>(
		undefined
	)

	const navRef = useNavigationContainerRef()

	useEffect(() => {
		setCurrentRoute(navRef.getCurrentRoute()?.name)

		const listener = navRef.addListener('state', () =>
			setCurrentRoute(navRef.getCurrentRoute()?.name)
		)

		return () => {
			navRef.removeListener('state', listener)
		}
	}, [])

	const backgroundColor = scheme === 'dark' ? '#F6F7FB' : '#252136'

	return (
		<>
			<NavigationContainer ref={navRef}>
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
			{isAuthenticated && navRef.isReady() && (
				<BottomMenu nav={navRef.navigate} currentRoute={currentRoute} />
			)}
		</>
	)
}

export default Navigation
