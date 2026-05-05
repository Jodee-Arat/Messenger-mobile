import { useCallback } from 'react'

import { ensureMobileSecretSession } from '@/services/secret/secret-session.service'

import {
	useRefreshSecretSessionMutation,
	useRegisterSecretSessionMutation
} from '@/graphql/generated/output'

export const useMobileSecretSessionBootstrap = () => {
	const [registerSecretSession] = useRegisterSecretSessionMutation()
	const [refreshSecretSession] = useRefreshSecretSessionMutation()

	const ensureSecretSession = useCallback(
		(forceNew = false) =>
			ensureMobileSecretSession({
				registerSecretSession,
				refreshSecretSession,
				forceNew
			}),
		[refreshSecretSession, registerSecretSession]
	)

	return { ensureSecretSession }
}
