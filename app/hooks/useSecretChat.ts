import { useEffect, useRef, useState } from 'react'

import {
	addMessages,
	createMyKey,
	deleteMyKeys,
	loadMessages,
	loadMyKeys,
	saveMessages
} from '@/utils/secret-chat/secretChat'

import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	DM_STORAGE_GROUP_ID,
	clearFormAction,
	deleteMessagesAction,
	ensureDirectChatDirectory,
	initGroupSessionAction,
	loadChatAction,
	loadDMKeysAction,
	pickFileAction,
	processSecretSubscriptionAction,
	pullSecretMessagesAction,
	receiveGroupKeyAction,
	sendGroupKeyToNewMemberAction,
	sendSecretMessageAction
} from './useSecretChat.actions'
import {
	FindAllChatsByGroupQuery,
	FindAllUsersQuery,
	FindChatByChatIdQuery,
	GetPreKeysQuery,
	useAddSecretMessageSubscription,
	useAddSharedSecretKeySubscription,
	useFindChatByChatIdQuery,
	useGetPreKeysLazyQuery,
	useGetSecretMessageLazyQuery,
	useGetSharedSecretKeyLazyQuery,
	useSecretKeyRotationSubscription,
	useSendSecretMessageMutation,
	useSendSharedSecretKeyMutation
} from '@/graphql/generated/output'
import { PreKeyBundleClient } from '@/libs/e2ee/gost'

export interface SecretChatData {
	id: string
	chatName: string
	isGroup: boolean
	groupId: string
	updatedAt: string
	isSecret: boolean
	members: {
		user: {
			id: string
			username: string
			avatarUrl?: string | null
		}
	}[]
	lastMessage: MessageType
}

/**
 * hook for secret chats — both group and DM.
 *
 * @param chatId
 * @param userId
 * @param groupId
 */
export const useSecretChat = (
	chatId: string,
	userId: string,
	groupId?: string
) => {
	const isDM = !groupId
	const effectiveGroupId = groupId || DM_STORAGE_GROUP_ID

	// Данные чата с сервера (только для DM)
	const { data: chatData } = useFindChatByChatIdQuery({
		variables: { chatId },
		fetchPolicy: 'network-only',
		skip: !isDM
	})

	const [chat, setChat] = useState<
		| FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
		| FindChatByChatIdQuery['findChatByChatId']
		| null
	>(null)
	const [messages, setMessages] = useState<MessageType[]>([])
	const messagesRef = useRef<MessageType[]>([])
	const [draftText, setDraftText] = useState<string>('')
	const [mySecretPreKey, setMySecretPreKey] =
		useState<PreKeyBundleClient | null>(null)
	const [preKeysPub, setPreKeysPub] = useState<GetPreKeysQuery['getPreKeys']>(
		[]
	)
	const [sessionKey, setSessionKey] =
		useState<Uint8Array<ArrayBufferLike> | null>(null)
	const [files, setFiles] = useState<SendFileType[]>([])
	const [loadingMessage, setLoadingMessage] = useState<string>(
		'Происходит создание ключей...'
	)
	const [errorMessage, setErrorMessage] = useState<string>('')

	const chatRef = useRef<SecretChatData | null>(null)

	useEffect(() => {
		messagesRef.current = messages
	}, [messages])

	useEffect(() => {
		if (isDM && chatData?.findChatByChatId) {
			setChat(chatData.findChatByChatId)
		}
	}, [chatData, isDM])

	const [getPreKeys] = useGetPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [getSecretMessage] = useGetSecretMessageLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [getSharedSecretKey] = useGetSharedSecretKeyLazyQuery({
		fetchPolicy: 'network-only'
	})
	const { data: subSecretMessage } = useAddSecretMessageSubscription({
		variables: { userId }
	})
	const { data: subSharedSecretKey } = useAddSharedSecretKeySubscription({
		variables: { userId },
		skip: isDM
	})

	const { data: subKeyRotation } = useSecretKeyRotationSubscription({
		variables: { userId },
		skip: isDM
	})

	const [sendMessageToClients] = useSendSecretMessageMutation()
	const [sendSharedSecretKey] = useSendSharedSecretKeyMutation()

	const processedRef = useRef<Set<string>>(new Set())

	const loadChat = async () => {
		setLoadingMessage('Загрузка чата...')

		if (isDM) {
			await ensureDirectChatDirectory(chatId)
			const res = await loadDMKeysAction({ chatId, userId, getPreKeys })
			if (res.errorMessage) setErrorMessage(res.errorMessage)
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
			if (res.errorMessage) setErrorMessage(res.errorMessage)
			if (res.chat !== undefined) setChat(res.chat)
			if (res.mySecretPreKey !== undefined)
				setMySecretPreKey(res.mySecretPreKey ?? null)
			if (res.preKeysPub !== undefined)
				setPreKeysPub(res.preKeysPub ?? [])
			if (res.sessionKey !== undefined)
				setSessionKey(res.sessionKey ?? null)
		}

		setLoadingMessage('')
	}

	useEffect(() => {
		const runLoadMessages = async () => {
			if (isDM) await ensureDirectChatDirectory(chatId)
			const chatMessagesData = await loadMessages(
				chatId,
				effectiveGroupId
			)
			setMessages(chatMessagesData || [])
		}

		runLoadMessages()
		loadChat()
		return () => {}
	}, [chatId])

	// Подписка на новые секретные сообщения
	useEffect(() => {
		const msg = subSecretMessage?.addSecretMessage
		if (!msg) return
		;(async () => {
			const result = await processSecretSubscriptionAction({
				getSharedSecretKey,
				msg,
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				sessionKey,
				preKeysPub,
				mySecretPreKey,
				getSecretMessage,
				getPreKeys,
				processedRef
			})
			if (result.sessionKey !== undefined)
				setSessionKey(result.sessionKey ?? null)
			if (result.needPersistKey && result.sessionKey)
				await createMyKey(
					chatId,
					effectiveGroupId,
					userId,
					result.sessionKey
				)
			if (result.newMessage) {
				const nm = result.newMessage
				setMessages(prev => [...prev, nm])
				addMessages([nm], chatId, effectiveGroupId)
			}
		})()
	}, [subSecretMessage, chat, sessionKey, preKeysPub, mySecretPreKey])

	// Получение секретных сообщений при наличии сессионного ключа
	// Для DM разрешаем запуск без sessionKey - pullSecretMessagesAction
	// сам выполнит X3DH-финализацию по первому сообщению в очереди
	useEffect(() => {
		if (!sessionKey && !isDM) return
		;(async () => {
			const result = await pullSecretMessagesAction({
				chatId,
				groupId: effectiveGroupId,
				userId,
				chat,
				sessionKey,
				mySecretPreKey,
				preKeysPub,
				getSecretMessage,
				getPreKeys,
				processedRef
			})
			if (result.sessionKey !== undefined)
				setSessionKey(result.sessionKey ?? null)
			if (result.needPersistKey && result.sessionKey)
				await createMyKey(
					chatId,
					effectiveGroupId,
					userId,
					result.sessionKey
				)
			if (result.newMessages.length) {
				setMessages(prev => [...prev, ...result.newMessages])
				addMessages(result.newMessages, chatId, effectiveGroupId)
			}
		})()
	}, [chatId, chat, preKeysPub, mySecretPreKey, sessionKey])

	// ─── Group-only: инициализация/получение группового ключа ───────
	useEffect(() => {
		if (isDM) return
		if (sessionKey || !chat || !mySecretPreKey || preKeysPub.length === 0)
			return
		;(async () => {
			const fromDisk = await loadMyKeys(chatId, effectiveGroupId)
			if (fromDisk?.sessionKeyHex) {
				setSessionKey(fromDisk.sessionKeyHex)
				return
			}

			setLoadingMessage('Получение ключа шифрования...')

			const receiveResult = await receiveGroupKeyAction({
				chatId,
				groupId: effectiveGroupId,
				userId,
				mySecretPreKey,
				preKeysPub,
				getPreKeys,
				getSharedSecretKey
			})

			if (receiveResult.groupKey) {
				setSessionKey(receiveResult.groupKey)
				if (receiveResult.needPersistKey) {
					await createMyKey(
						chatId,
						effectiveGroupId,
						userId,
						receiveResult.groupKey
					)
				}
				console.log(
					'[SecretChat] Group key received and saved from initiator'
				)
				setLoadingMessage('')
				return
			}

			setLoadingMessage('Генерация ключа шифрования...')
			const initResult = await initGroupSessionAction({
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				mySecretPreKey,
				preKeysPub,
				getPreKeys,
				sendSharedSecretKey
			})

			if (initResult.errorMessage) {
				setErrorMessage(initResult.errorMessage)
			} else if (initResult.groupKey) {
				setSessionKey(initResult.groupKey)
				if (initResult.needPersistKey) {
					await createMyKey(
						chatId,
						effectiveGroupId,
						userId,
						initResult.groupKey
					)
				}
				console.log('[SecretChat] Group key generated and distributed')
			}
			setLoadingMessage('')
		})()
	}, [chatId, chat, sessionKey, mySecretPreKey, preKeysPub])

	// ─── Group-only: подписка на получение общего ключа ──────────────
	useEffect(() => {
		if (isDM) return
		const sharedKeyData = subSharedSecretKey?.addSharedSecretKey
		if (!sharedKeyData || sessionKey || !mySecretPreKey) return
		;(async () => {
			const receiveResult = await receiveGroupKeyAction({
				chatId,
				groupId: effectiveGroupId,
				userId,
				mySecretPreKey,
				preKeysPub,
				getPreKeys,
				getSharedSecretKey
			})
			if (receiveResult.groupKey) {
				setSessionKey(receiveResult.groupKey)
				if (receiveResult.needPersistKey) {
					await createMyKey(
						chatId,
						effectiveGroupId,
						userId,
						receiveResult.groupKey
					)
				}
				console.log('[SecretChat] Group key received via subscription')
			}
		})()
	}, [subSharedSecretKey, sessionKey, mySecretPreKey, preKeysPub])

	// ─── Group-only: ротация ключей при leave/remove ────────────────
	useEffect(() => {
		if (isDM) return
		const rotationData = subKeyRotation?.secretKeyRotation
		if (!rotationData || rotationData.chatId !== chatId) return
		;(async () => {
			console.log('[SecretChat] Key rotation triggered for chat:', chatId)
			await deleteMyKeys(chatId, effectiveGroupId)
			setSessionKey(null)
		})()
	}, [subKeyRotation, chatId, effectiveGroupId])

	const sendMessage = async (
		text: string,
		user: FindAllUsersQuery['findAllUsers'][number]
	) => {
		if (isDM) await ensureDirectChatDirectory(chatId)
		const res = await sendSecretMessageAction({
			text,
			user,
			chat,
			chatId,
			groupId: effectiveGroupId,
			userId,
			files,
			sessionKey,
			mySecretPreKey,
			preKeysPub,
			getPreKeys,
			sendMessageToClients,
			sendSharedSecretKey
		})
		if (res.errorMessage) setErrorMessage(res.errorMessage)
		if (res.newMessage) {
			const nm = res.newMessage
			setMessages(prev => [...prev, nm])
			addMessages([nm], chatId, effectiveGroupId)
		}
		if (res.sessionKey !== undefined) setSessionKey(res.sessionKey ?? null)
		if (res.needPersistKey && res.sessionKey && chat)
			await createMyKey(chatId, effectiveGroupId, userId, res.sessionKey)
	}

	const deleteMessage = async (messageIds: string[]) => {
		const { nextMessages } = await deleteMessagesAction({
			messageIds,
			messagesRef,
			chatId,
			groupId: effectiveGroupId
		})
		setMessages(nextMessages)
		await saveMessages(nextMessages, chatId, effectiveGroupId)
	}

	const pickFile = async () => {
		const { newFile, errorMessage: err } = await pickFileAction()
		if (err) setErrorMessage(err)
		if (newFile) setFiles(prev => [...prev, newFile])
	}

	const clearForm = () => {
		const res = clearFormAction()
		setDraftText(res.draftText)
		setFiles(res.files)
	}

	/**
	 * Отправить существующий групповой ключ новому участнику после приглашения.
	 */
	const sendKeyToNewMember = async (targetUserId: string) => {
		if (!sessionKey || !mySecretPreKey) {
			console.warn(
				'[SecretChat] sendKeyToNewMember: нет sessionKey или mySecretPreKey'
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
				'[SecretChat] sendKeyToNewMember error:',
				result.errorMessage
			)
		}
	}

	return {
		chat,
		messages,
		loadingMessage,
		draftText,
		setDraftText,
		files,
		pickFile,
		errorMessage,
		sendMessage,
		deleteMessage,
		clearForm,
		reload: loadChat,
		preKeysPub,
		sendKeyToNewMember,
		isKeyReady: sessionKey !== null
	}
}
