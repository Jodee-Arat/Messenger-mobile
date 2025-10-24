import {
	CommonActions,
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

// Пример reset
export function resetToAuth() {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: 'Auth' }]
			})
		)
	}
}
