'use client'

import { useEffect } from 'react'

import { useAuth } from './useAuth'
import { useUser } from './useUser'
import { useFindProfileQuery } from '@/graphql/generated/output'

export function useCurrentUser() {
	const { isAuthenticated, exit } = useAuth()
	const { userId } = useUser()

	const { data, loading, refetch, error } = useFindProfileQuery({
		skip: !isAuthenticated
	})

	useEffect(() => {
		if (error) {
			exit()
		}
	}, [isAuthenticated, exit, userId])

	return {
		user: data?.findProfile,
		isLoadingProfile: loading,
		refetch
	}
}
