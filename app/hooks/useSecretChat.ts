import { useCallback, useEffect, useRef, useState } from 'react'

import {
	getGraphQLErrorMessage,
	isDirectContactBlockedError
} from '@/hooks/useBlockedUsers'

import {
	addMessages,
	createSecretChat,
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
	useChatUpdatedSubscription,
	useDiscardSecretAttachmentMutation,
	useFindChatByChatIdQuery,
	useGetPreKeysLazyQuery,
	useGetSecretMessageLazyQuery,
	useGetSharedSecretKeyLazyQuery,
	useSecretKeyRotationSubscription,
	useSendSecretMessageMutation,
	useSendSharedSecretKeyMutation,
	useUploadSecretAttachmentMutation
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
		isCreator?: boolean | null
		user: {
			id: string
			username: string
			avatarUrl?: string | null
		}
	}[]
	lastMessage: MessageType
}

type GroupChatShape = {
	members?: Array<{
		isCreator?: boolean | null
		user?: {
			id?: string | null
		} | null
	}> | null
} | null

const getGroupKeyInitiatorId = (
	chat: GroupChatShape,
	fallbackUserId: string
) => {
	const members = chat?.members ?? []
	const creatorId = members.find(member => member.isCreator)?.user?.id
	if (creatorId) return creatorId

	const memberIds = members
		.map(member => member.user?.id)
		.filter((id): id is string => Boolean(id))
	if (memberIds.length === 0) return fallbackUserId

	return [...memberIds].sort((a, b) => a.localeCompare(b))[0] ?? fallbackUserId
}

const hasCreatorMetadata = (chat: GroupChatShape) =>
	(chat?.members ?? []).some(member => typeof member.isCreator === 'boolean')

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
	const {
		data: chatData,
		error: chatAccessError,
		refetch: refetchServerChat
	} = useFindChatByChatIdQuery({
		variables: { chatId },
		fetchPolicy: 'network-only'
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
	const [isSendingFiles, setIsSendingFiles] = useState(false)
	const [loadingMessage, setLoadingMessage] = useState<string>(
		'Происходит создание ключей...'
	)
	const [errorMessage, setErrorMessage] = useState<string>('')

	const chatRef = useRef<SecretChatData | null>(null)

	useEffect(() => {
		messagesRef.current = messages
	}, [messages])

	useEffect(() => {
		const serverChat = chatData?.findChatByChatId
		if (!serverChat) return

		setChat(serverChat)

		if (!isDM && serverChat.isSecret && serverChat.groupId) {
			void createSecretChat(serverChat, true)
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
	const { data: chatUpdatedData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !userId
	})

	useEffect(() => {
		const updated = chatUpdatedData?.chatUpdated
		if (!updated) return
		if (updated.id !== chatId) return

		const localPinnedMessageId =
			chat && 'pinnedMessage' in chat && chat.pinnedMessage
				? chat.pinnedMessage.id
				: null

		if (updated.pinnedMessageId === localPinnedMessageId) return

		void refetchServerChat()
	}, [chat, chatId, chatUpdatedData, refetchServerChat])

	const { data: subKeyRotation } = useSecretKeyRotationSubscription({
		variables: { userId },
		skip: isDM
	})

	const [sendMessageToClients] = useSendSecretMessageMutation()
	const [sendSharedSecretKey] = useSendSharedSecretKeyMutation()
	const [uploadSecretAttachment] = useUploadSecretAttachmentMutation()
	const [discardSecretAttachment] = useDiscardSecretAttachmentMutation()

	const processedRef = useRef<Set<string>>(new Set())
	const groupKeyReceiveInFlightRef = useRef(false)

	const loadChat = useCallback(async () => {
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
	}, [chatId, effectiveGroupId, getPreKeys, isDM, userId])

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
		void loadChat()
		return () => {}
	}, [chatId, effectiveGroupId, isDM, loadChat])

	const receiveAndPersistGroupKey = useCallback(
		async (reason: 'bootstrap' | 'subscription' | 'poll') => {
			if (!chat || !mySecretPreKey || preKeysPub.length === 0) return false
			if (groupKeyReceiveInFlightRef.current) return false

			groupKeyReceiveInFlightRef.current = true

			try {
				const fromDisk = await loadMyKeys(chatId, effectiveGroupId)
				if (fromDisk?.sessionKeyHex) {
					setSessionKey(fromDisk.sessionKeyHex)
					setLoadingMessage('')
					return true
				}

				const initiatorUserId = getGroupKeyInitiatorId(chat, userId)
				const receiveResult = await receiveGroupKeyAction({
					chatId,
					groupId: effectiveGroupId,
					userId,
					preferredFromUserId: initiatorUserId,
					mySecretPreKey,
					preKeysPub,
					getPreKeys,
					getSharedSecretKey
				})

				if (!receiveResult.groupKey) return false

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
					`[SecretChat] Group key received and saved via ${reason}`
				)
				setLoadingMessage('')
				return true
			} finally {
				groupKeyReceiveInFlightRef.current = false
			}
		},
		[
			chat,
			chatId,
			effectiveGroupId,
			getPreKeys,
			getSharedSecretKey,
			mySecretPreKey,
			preKeysPub,
			userId
		]
	)

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
		if (!hasCreatorMetadata(chat)) return
		let isCancelled = false
		;(async () => {
			const initiatorUserId = getGroupKeyInitiatorId(chat, userId)
			const didReceive = await receiveAndPersistGroupKey('bootstrap')
			if (isCancelled || didReceive) {
				return
			}

			setLoadingMessage('Получение ключа шифрования...')


			setLoadingMessage('Генерация ключа шифрования...')
			if (initiatorUserId !== userId) {
				console.log(
					`[SecretChat][InitGroup] Waiting for group key from initiator ${initiatorUserId}`
				)
				setLoadingMessage('Ожидание общего ключа от инициатора...')
				return
			}

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
			if (isCancelled) return

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
		return () => {
			isCancelled = true
		}
	}, [
		chatId,
		chat,
		effectiveGroupId,
		isDM,
		mySecretPreKey,
		preKeysPub,
		receiveAndPersistGroupKey,
		sendSharedSecretKey,
		sessionKey,
		userId
	])

	// ─── Group-only: подписка на получение общего ключа ──────────────
	useEffect(() => {
		if (isDM) return
		const sharedKeyData = subSharedSecretKey?.addSharedSecretKey
		if (!sharedKeyData || sessionKey || !mySecretPreKey) return
		;(async () => {
			await receiveAndPersistGroupKey('subscription')
		})()
	}, [
		chat,
		isDM,
		mySecretPreKey,
		receiveAndPersistGroupKey,
		sessionKey,
		subSharedSecretKey
	])

	useEffect(() => {
		if (isDM) return
		if (sessionKey || !chat || !mySecretPreKey || preKeysPub.length === 0)
			return
		if (!hasCreatorMetadata(chat)) return

		const initiatorUserId = getGroupKeyInitiatorId(chat, userId)
		if (initiatorUserId === userId) return

		let isCancelled = false
		let timeoutId: ReturnType<typeof setTimeout> | null = null

		const pollForGroupKey = async () => {
			if (isCancelled) return

			setLoadingMessage(
				'РћР¶РёРґР°РЅРёРµ РѕР±С‰РµРіРѕ РєР»СЋС‡Р° РѕС‚ РёРЅРёС†РёР°С‚РѕСЂР°...'
			)
			setLoadingMessage('Waiting for group key from initiator...')
			const didReceive = await receiveAndPersistGroupKey('poll')
			if (isCancelled || didReceive) return

			timeoutId = setTimeout(pollForGroupKey, 2500)
		}

		timeoutId = setTimeout(pollForGroupKey, 2500)

		return () => {
			isCancelled = true
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [
		chat,
		isDM,
		mySecretPreKey,
		preKeysPub,
		receiveAndPersistGroupKey,
		sessionKey,
		userId
	])

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

	// отправка сообщения
	const sendMessage = async (
		text: string,
		user: FindAllUsersQuery['findAllUsers'][number]
	) => {
		try {
			if (isDM) await ensureDirectChatDirectory(chatId)
			setIsSendingFiles(true)
			const res = await sendSecretMessageAction({
				text,
				user,
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				files,
				setFiles,
				sessionKey,
				mySecretPreKey,
				preKeysPub,
				getPreKeys,
				sendMessageToClients,
				sendSharedSecretKey,
				uploadSecretAttachment,
				discardSecretAttachment
			})
			if (res.errorMessage) {
				setErrorMessage(res.errorMessage)
				return false
			}
			if (res.newMessage) {
				const nm = res.newMessage
				setMessages(prev => [...prev, nm])
				addMessages([nm], chatId, effectiveGroupId)
			}
			if (res.sessionKey !== undefined)
				setSessionKey(res.sessionKey ?? null)
			if (res.needPersistKey && res.sessionKey && chat)
				await createMyKey(
					chatId,
					effectiveGroupId,
					userId,
					res.sessionKey
				)
			return true
		} catch (error) {
			if (isDirectContactBlockedError(error)) {
				setErrorMessage(
					'Direct contact is unavailable because one of the users has blocked the other.'
				)
				return false
			}
			setErrorMessage(
				getGraphQLErrorMessage(error) || 'Failed to send secret message'
			)
			return false
		} finally {
			setIsSendingFiles(false)
		}
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

	const removeFile = (fileId: string) => {
		setFiles(prev => prev.filter(file => file.id !== fileId))
	}

	const clearForm = () => {
		const res = clearFormAction()
		setDraftText(res.draftText)
		setFiles(res.files)
	}

	const reload = useCallback(async () => {
		setErrorMessage('')
		if (isDM) {
			await ensureDirectChatDirectory(chatId)
		}
		const storedMessages = await loadMessages(chatId, effectiveGroupId)
		setMessages(storedMessages || [])
		await loadChat()
	}, [chatId, effectiveGroupId, isDM, loadChat])

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
		removeFile,
		isSendingFiles,
		errorMessage,
		chatAccessError,
		sendMessage,
		deleteMessage,
		clearForm,
		reload,
		preKeysPub,
		sendKeyToNewMember,
		isKeyReady: sessionKey !== null
	}
}
