export interface AuthStore {
	isAuthenticated: boolean
	isAuthChecked: boolean
	_hasHydrated: boolean
	setIsAuthenticated: (isAuthenticated: boolean) => void
	setIsAuthChecked: (isAuthChecked: boolean) => void
	setHasHydrated: (hasHydrated: boolean) => void
}
