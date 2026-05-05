import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

import { SERVER_URL } from '@/libs/constants/url.constant'
import {
	EnumAsyncStorage,
	EnumSecureStore
} from '@/types/interface/auth.interface'

import {
	loadMyPreKeyJSON,
	PreKeyBundle,
	upsertMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'

import {
	PreKeyInput,
	RefreshSecretSessionMutationFn,
	RegisterSecretSessionMutationFn,
	SecretSessionPlatform
} from '@/graphql/generated/output'
import { generatePreKey, PreKeyBundleServer } from '@/libs/e2ee/gost'

type PersistableServerPreKey = PreKeyBundleServer & {
	indexOpkPub?: number | null
}

type EnsureMobileSecretSessionParams = {
	registerSecretSession: RegisterSecretSessionMutationFn
	refreshSecretSession: RefreshSecretSessionMutationFn
	forceNew?: boolean
}

const REVOKE_SECRET_SESSION_MUTATION = `
	mutation RevokeSecretSession($secretSessionId: String!) {
		revokeSecretSession(secretSessionId: $secretSessionId)
	}
`

let ensureSecretSessionPromise: Promise<string> | null = null

const isRecoverableRefreshError = (error: unknown) => {
	const message =
		error instanceof Error
			? error.message
			: typeof error === 'string'
				? error
				: ''

	return (
		message.includes('secret session not found') ||
		message.includes('secret session is not active')
	)
}

export const toSecretSessionPreKeyInput = (
	preKey: PersistableServerPreKey
): PreKeyInput => ({
	ikPub: preKey.ikPub,
	spkPub: preKey.spkPub,
	spkSig: preKey.spkSig,
	opkPubs: preKey.opkPubs,
	indexOpkPub: preKey.indexOpkPub ?? 0
})

export const persistMobileSecretPreKey = async (preKey: PreKeyBundle) => {
	await AsyncStorage.setItem(
		EnumAsyncStorage.MY_PRE_KEYS,
		JSON.stringify(preKey.toStore)
	)
	await upsertMyPreKeyJSON(preKey)
}

export const createAndPersistMobileSecretPreKey = async () => {
	const generatedPreKey = await generatePreKey()
	await persistMobileSecretPreKey(generatedPreKey)
	return generatedPreKey
}

export const loadOrCreateMobileSecretPreKey = async () => {
	const storedPreKey = await loadMyPreKeyJSON()
	if (storedPreKey) {
		return storedPreKey
	}

	return createAndPersistMobileSecretPreKey()
}

export const getStoredSecretSessionId = async () =>
	SecureStore.getItemAsync(EnumSecureStore.SECRET_SESSION_ID)

const bestEffortRevokeSecretSession = async (secretSessionId: string) => {
	const accessToken = await AsyncStorage.getItem(EnumAsyncStorage.ACCESS_TOKEN)
	const sessionId = await AsyncStorage.getItem(EnumAsyncStorage.SESSION_ID)

	if (!accessToken || !secretSessionId) {
		return false
	}

	try {
		await fetch(SERVER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${accessToken}`,
				...(sessionId
					? {
							'x-session-id': sessionId
						}
					: {})
			},
			body: JSON.stringify({
				query: REVOKE_SECRET_SESSION_MUTATION,
				variables: { secretSessionId }
			})
		})

		return true
	} catch (error) {
		console.warn('[SecretSession] Failed to revoke secret session', error)
		return false
	}
}

export const revokeStoredSecretSession = async () => {
	const secretSessionId = await getStoredSecretSessionId()

	if (!secretSessionId) {
		return false
	}

	return bestEffortRevokeSecretSession(secretSessionId)
}

export const ensureMobileSecretSession = async ({
	registerSecretSession,
	refreshSecretSession,
	forceNew = false
}: EnsureMobileSecretSessionParams) => {
	if (ensureSecretSessionPromise) {
		return ensureSecretSessionPromise
	}

	const run = async () => {
		const preKey = forceNew
			? await createAndPersistMobileSecretPreKey()
			: await loadOrCreateMobileSecretPreKey()
		const publicPreKey = toSecretSessionPreKeyInput(preKey.toServer)
		const existingSecretSessionId = await SecureStore.getItemAsync(
			EnumSecureStore.SECRET_SESSION_ID
		)

		if (existingSecretSessionId && !forceNew) {
			try {
				const refreshed = await refreshSecretSession({
					variables: {
						secretSessionId: existingSecretSessionId,
						publicPreKey
					}
				})
				const refreshedSessionId = refreshed.data?.refreshSecretSession.id

				if (refreshedSessionId) {
					await SecureStore.setItemAsync(
						EnumSecureStore.SECRET_SESSION_ID,
						refreshedSessionId
					)
					return refreshedSessionId
				}
			} catch (error) {
				if (!isRecoverableRefreshError(error)) {
					console.warn(
						'[SecretSession] Failed to refresh session, creating a new one',
						error
					)
				}
				await SecureStore.deleteItemAsync(EnumSecureStore.SECRET_SESSION_ID)
			}
		}

		if (existingSecretSessionId && forceNew) {
			await bestEffortRevokeSecretSession(existingSecretSessionId)
			await SecureStore.deleteItemAsync(EnumSecureStore.SECRET_SESSION_ID)
		}

		const registered = await registerSecretSession({
			variables: {
				data: {
					platform: SecretSessionPlatform.Mobile,
					deviceName: Platform.OS,
					publicPreKey
				}
			}
		})
		const secretSessionId = registered.data?.registerSecretSession.id

		if (!secretSessionId) {
			throw new Error('Secret session registration returned no session id')
		}

		await SecureStore.setItemAsync(
			EnumSecureStore.SECRET_SESSION_ID,
			secretSessionId
		)

		return secretSessionId
	}

	ensureSecretSessionPromise = run()

	try {
		return await ensureSecretSessionPromise
	} finally {
		ensureSecretSessionPromise = null
	}
}
