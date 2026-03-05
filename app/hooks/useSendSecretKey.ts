import { useCallback, useEffect, useState } from 'react'

import {
	DM_STORAGE_GROUP_ID,
	loadChatAction,
	loadDMKeysAction,
	sendGroupKeyToNewMemberAction
} from './useSecretChat.actions'
import { ensureDirectChatDirectory } from './useSecretChat.actions'
import {
	GetPreKeysQuery,
	useGetPreKeysLazyQuery,
	useSendSharedSecretKeyMutation
} from '@/graphql/generated/output'
import { PreKeyBundleClient } from '@/libs/e2ee/gost'

/**
 * Lightweight hook that loads only the secret-chat keys
 * and exposes `sendKeyToNewMember` — without loading messages,
 * subscriptions, or any other heavy state from useSecretChat.
 *
 * @param chatId  Current chat ID
 * @param userId  Current user ID
 * @param groupId Group ID (undefined for DM)
 * @param enabled If false, the hook does nothing (use for non-secret chats)
 */
export function useSendSecretKey(
	chatId: string,
	userId: string,
	groupId?: string | null,
	enabled = true
) {
	const isDM = !groupId
	const effectiveGroupId = groupId || DM_STORAGE_GROUP_ID

	const [mySecretPreKey, setMySecretPreKey] =
		useState<PreKeyBundleClient | null>(null)
	const [preKeysPub, setPreKeysPub] = useState<GetPreKeysQuery['getPreKeys']>(
		[]
	)
	const [sessionKey, setSessionKey] =
		useState<Uint8Array<ArrayBufferLike> | null>(null)
	const [ready, setReady] = useState(false)

	const [getPreKeys] = useGetPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [sendSharedSecretKey] = useSendSharedSecretKeyMutation()

	// Load keys on mount (only if enabled)
	useEffect(() => {
		if (!enabled || !chatId || !userId) return
		;(async () => {
			try {
				if (isDM) {
					await ensureDirectChatDirectory(chatId)
					const res = await loadDMKeysAction({
						chatId,
						userId,
						getPreKeys
					})
					if (res.mySecretPreKey !== undefined)
						setMySecretPreKey(res.mySecretPreKey ?? null)
					if (res.preKeysPub !== undefined)
						setPreKeysPub(res.preKeysPub ?? [])
					if (res.sessionKey !== undefined)
						setSessionKey(res.sessionKey ?? null)
				} else {
					const res = await loadChatAction({
						chatId,
						groupId: effectiveGroupId,
						userId,
						getPreKeys
					})
					if (res.mySecretPreKey !== undefined)
						setMySecretPreKey(res.mySecretPreKey ?? null)
					if (res.preKeysPub !== undefined)
						setPreKeysPub(res.preKeysPub ?? [])
					if (res.sessionKey !== undefined)
						setSessionKey(res.sessionKey ?? null)
				}
				setReady(true)
			} catch (e) {
				console.error('[useSendSecretKey] Failed to load keys:', e)
			}
		})()
	}, [enabled, chatId, userId])

	const sendKeyToNewMember = useCallback(
		async (targetUserId: string) => {
			if (!sessionKey || !mySecretPreKey) {
				console.warn(
					'[useSendSecretKey] sendKeyToNewMember: нет sessionKey или mySecretPreKey'
				)
				return
			}
			const result = await sendGroupKeyToNewMemberAction({
				chatId,
				groupId: effectiveGroupId,
				userId,
				targetUserId,
				sessionKey,
				mySecretPreKey,
				preKeysPub,
				getPreKeys,
				sendSharedSecretKey
			})
			if (result.errorMessage) {
				console.error(
					'[useSendSecretKey] sendKeyToNewMember error:',
					result.errorMessage
				)
			}
		},
		[
			chatId,
			effectiveGroupId,
			userId,
			sessionKey,
			mySecretPreKey,
			preKeysPub,
			getPreKeys,
			sendSharedSecretKey
		]
	)

	return { sendKeyToNewMember, ready }
}
