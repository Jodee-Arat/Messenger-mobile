// Navigation.tsx
import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FC, useEffect, useState } from 'react'

import BottomMenu from '@/components/layout/bottom-menu/BottomMenu'

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

import { AppModalProvider } from '@/providers/AppModalProvider'

import { navigationRef } from './navigate'
import { TypeRootStackParamList } from './navigation.types'
import { routes } from './routes'

// <-- глобальный ref

const Stack = createNativeStackNavigator<TypeRootStackParamList>()

const Navigation: FC = () => {
	const { colors, isDark } = useTheme()
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

	const backgroundColor = colors.background
	const navigationTheme = {
		...(isDark ? DarkTheme : DefaultTheme),
		colors: {
			...(isDark ? DarkTheme.colors : DefaultTheme.colors),
			primary: colors.accent,
			background: colors.background,
			card: colors.background,
			text: colors.text,
			border: colors.border,
			notification: colors.accent
		}
	}

	const hideMenu = [
		'Chat',
		'Profile',
		'UserSettings',
		'ChatSettings',
		'GroupSettings'
	]

	return (
		<>
			<NavigationContainer
				ref={navigationRef}
				theme={navigationTheme}
			>
				<AppModalProvider>
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
				</AppModalProvider>
			</NavigationContainer>

			{/* {isAuthenticated &&
				navigationRef.isReady() &&
				!hideMenu.includes(currentRoute ?? '') && (
					<BottomMenu
						nav={screenName =>
							navigationRef.navigate(screenName as any)
						}
						currentRoute={currentRoute}
					/>
				)} */}
		</>
	)
}

export default Navigation
