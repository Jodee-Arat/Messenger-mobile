import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'

import { resetToAuth } from '@/navigation/navigate'

import { useAuth } from './useAuth'
import { useUser } from './useUser'
import { useFindProfileQuery } from '@/graphql/generated/output'

export function useCurrentUser() {
	const { isAuthenticated, exit } = useAuth()

	const { data, loading, refetch, error } = useFindProfileQuery({
		skip: !isAuthenticated,
		fetchPolicy: 'network-only'
	})
	if (error) {
		resetToAuth()
	}

	return {
		user: data?.findProfile,
		isLoadingProfile: loading,
		refetch
	}
}
