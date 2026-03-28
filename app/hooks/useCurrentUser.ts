import { useEffect, useRef } from 'react'

import { handleLogout } from '@/services/auth/auth.service'

import { useAuth } from './useAuth'
import { useFindProfileQuery } from '@/graphql/generated/output'

export function useCurrentUser() {
	const { isAuthenticated } = useAuth()
	const hasHandledLogout = useRef(false)

	const { data, loading, refetch, error } = useFindProfileQuery({
		skip: !isAuthenticated,
		fetchPolicy: 'network-only'
	})

	useEffect(() => {
		if (!isAuthenticated) {
			hasHandledLogout.current = false
			return
		}

		// ещё загружается — ждём
		if (loading) return

		// всё хорошо — сбрасываем флаг
		if (!error && data?.findProfile) {
			hasHandledLogout.current = false
			return
		}

		// запрос завершился, но профиля нет (ошибка или null-ответ)
		if (hasHandledLogout.current) return
		hasHandledLogout.current = true

		// handleLogout сбрасывает isAuthenticated + навигирует на Auth
		handleLogout()
	}, [loading, error, data, isAuthenticated])

	return {
		user: data?.findProfile,
		isLoadingProfile: loading,
		refetch
	}
}
