import { handleLogout } from '@/services/auth/auth.service'

import { authStore } from '../store/auth/auth.store'

export const useAuth = () => {
	const isAuthenticated = authStore(state => state.isAuthenticated)
	const isAuthChecked = authStore(state => state.isAuthChecked)
	const hasHydrated = authStore(state => state._hasHydrated)
	const setIsAuthenticated = authStore(state => state.setIsAuthenticated)

	const auth = () => setIsAuthenticated(true)
	const exit = async () => {
		await handleLogout()
	}

	return {
		isAuthenticated,
		isAuthChecked,
		hasHydrated,
		auth,
		exit
	}
}
