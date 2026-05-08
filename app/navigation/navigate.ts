import {
	CommonActions,
	NavigationProp,
	createNavigationContainerRef
} from '@react-navigation/native'

import { TypeRootStackParamList } from './navigation.types'

export const navigationRef =
	createNavigationContainerRef<TypeRootStackParamList>()

export function navigate<RouteName extends keyof TypeRootStackParamList>(
	name: RouteName,
	params?: TypeRootStackParamList[RouteName]
) {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name as any, params as any)
	}
}

export function resetToAuth() {
	if (navigationRef.isReady() && navigationRef.current) {
		navigationRef.dispatch(
			CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
		)
	}
}

export function resetToHome() {
	if (navigationRef.isReady() && navigationRef.current) {
		navigationRef.dispatch(
			CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] })
		)
	}
}

export function goBackOrHome(
	navigation: NavigationProp<TypeRootStackParamList>
) {
	if (navigation.canGoBack()) {
		navigation.goBack()
		return
	}

	navigation.dispatch(
		CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] })
	)
}
