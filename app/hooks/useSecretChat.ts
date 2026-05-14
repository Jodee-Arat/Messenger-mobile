import { useCallback, useEffect, useRef, useState } from 'react'

import {
	getGraphQLErrorMessage,
	isDirectContactBlockedError
} from '@/hooks/useBlockedUsers'

import {
	addMessages,
	createMyKey,
	createSecretChat,
	deleteMyKeys,
	fileExist,
	FILE,
	loadGroupSenderKeys,
	loadMessages,
	loadMyKeys,
	resetLegacyDmSecretState,
	resetLegacyGroupSecretState,
	saveGroupSenderKeys,
	saveMessages
} from '@/utils/secret-chat/secretChat'

import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	DM_STORAGE_GROUP_ID,
	clearFormAction,
	deleteMessagesAction,
	encryptAndUploadFileAction,
	ensureDirectChatDirectory,
	initGroupSessionAction,
	loadChatAction,
	loadDMKeysAction,
	pickFileAction,
	pickImageAction,
	processSecretSubscriptionAction,
	pullSecretMessagesAction,
	receiveGroupKeyAction,
	sendGroupKeyToNewMemberAction,
	sendSecretMessageAction
} from './useSecretChat.actions'
import { getStoredSecretSessionId } from '@/services/secret/secret-session.service'
import {
	FindAllChatsByGroupQuery,
	FindAllUsersQuery,
	FindChatByChatIdQuery,
	GetSecretSessionPreKeysQuery,
	useAddSessionSecretMessageSubscription,
	useAddSessionSharedSecretKeySubscription,
	useAckSessionSecretMessagesMutation,
	useAckSessionSharedSecretKeysMutation,
	useChatUpdatedSubscription,
	useDiscardSecretAttachmentMutation,
	useFindChatByChatIdQuery,
	useGetSecretSessionPreKeysLazyQuery,
	useGetSessionSecretMessagesLazyQuery,
	useGetSessionSharedSecretKeysLazyQuery,
	useSecretKeyRotationSubscription,
	useSendSessionSecretMessageMutation,
	useSendSessionSharedSecretKeyMutation,
	useUploadSecretAttachmentMutation
} from '@/graphql/generated/output'
import { PreKeyBundleClient, createGroupSenderKeyState } from '@/libs/e2ee/gost'

const mergeUniqueMessages = (
	existing: MessageType[],
	incoming: MessageType[]
): MessageType[] => {
	const seenIds = new Set(existing.map(message => message.id))
	const uniqueIncoming = incoming.filter(message => {
		if (seenIds.has(message.id)) {
			return false
		}
		seenIds.add(message.id)
		return true
	})

	return sortMessagesByCreatedAt([...existing, ...uniqueIncoming])
}

const getMessageTime = (message: MessageType) => {
	const timestamp = new Date(message.createdAt).getTime()
	return Number.isFinite(timestamp) ? timestamp : 0
}

const sortMessagesByCreatedAt = (messages: MessageType[]) =>
	[...messages].sort((left, right) => {
		const timeDiff = getMessageTime(left) - getMessageTime(right)
		if (timeDiff !== 0) return timeDiff

		return left.id.localeCompare(right.id)
	})

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

	return (
		[...memberIds].sort((a, b) => a.localeCompare(b))[0] ?? fallbackUserId
	)
}

const hasCreatorMetadata = (chat: GroupChatShape) =>
	(chat?.members ?? []).some(member => typeof member.isCreator === 'boolean')

const GROUP_COMMON_KEY_FLOW_ENABLED = false

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
	groupId?: string,
	options?: { isSaved?: boolean }
) => {
	const isSaved = Boolean(options?.isSaved)
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
	const [preKeysPub, setPreKeysPub] = useState<
		GetSecretSessionPreKeysQuery['getSecretSessionPreKeys']
	>([])
	const [secretSessionId, setSecretSessionId] = useState<string | null>(null)
	const [sessionKey, setSessionKey] =
		useState<Uint8Array<ArrayBufferLike> | null>(null)
	const [files, setFiles] = useState<SendFileType[]>([])
	const filesRef = useRef<SendFileType[]>(files)
	useEffect(() => {
		filesRef.current = files
	}, [files])
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
		let isCancelled = false

		void getStoredSecretSessionId().then(storedSessionId => {
			if (isCancelled) return
			setSecretSessionId(storedSessionId ?? null)
		})

		return () => {
			isCancelled = true
		}
	}, [userId])

	useEffect(() => {
		const serverChat = chatData?.findChatByChatId
		if (!serverChat) return

		setChat(serverChat)

		if (!isDM && serverChat.isSecret && serverChat.groupId) {
			void createSecretChat(serverChat, true)
		}
	}, [chatData, isDM])

	const [getPreKeys] = useGetSecretSessionPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [getSecretMessages] = useGetSessionSecretMessagesLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [getSharedSecretKey] = useGetSessionSharedSecretKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const { data: subSecretMessage } = useAddSessionSecretMessageSubscription({
		variables: {
			userId,
			secretSessionId: secretSessionId ?? ''
		},
		skip: !userId || !secretSessionId
	})
	const { data: subSharedSecretKey } = useAddSessionSharedSecretKeySubscription({
		variables: {
			userId,
			secretSessionId: secretSessionId ?? ''
		},
		skip: isDM || !userId || !secretSessionId
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

	const [sendMessageToClients] = useSendSessionSecretMessageMutation()
	const [sendSharedSecretKey] = useSendSessionSharedSecretKeyMutation()
	const [uploadSecretAttachment] = useUploadSecretAttachmentMutation()
	const [discardSecretAttachment] = useDiscardSecretAttachmentMutation()
	const [ackSecretMessages] = useAckSessionSecretMessagesMutation()
	const [ackSharedSecretKeys] = useAckSessionSharedSecretKeysMutation()

	const processedRef = useRef<Set<string>>(new Set())
	const groupKeyReceiveInFlightRef = useRef(false)

	const syncUnreadMessages = useCallback(
		async (
			currentChat:
				| FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
				| FindChatByChatIdQuery['findChatByChatId']
				| null,
			currentSessionKey: Uint8Array<ArrayBufferLike> | null
		) => {
			if (!currentChat || !secretSessionId) return

			const result = await pullSecretMessagesAction({
				chatId,
				groupId: effectiveGroupId,
				userId,
				secretSessionId,
				chat: currentChat,
				sessionKey: currentSessionKey,
				mySecretPreKey: mySecretPreKey!,
				preKeysPub,
				getSecretMessages,
				getSharedSecretKey,
				getPreKeys,
				processedRef
			})

			if (result.sessionKey !== undefined) {
				setSessionKey(result.sessionKey ?? null)
			}

			if (result.needPersistKey && result.sessionKey) {
				await createMyKey(
					chatId,
					effectiveGroupId,
					userId,
					result.sessionKey
				)

				if (result.ackSharedKeyIds?.length) {
					try {
						await ackSharedSecretKeys({
							variables: {
								chatId,
								secretSessionId,
								sharedKeyIds: result.ackSharedKeyIds
							}
						})
					} catch (error) {
						console.warn(
							'[SecretChat] Failed to ack shared secret keys:',
							error
						)
					}
				}
			}

			if (result.newMessages.length) {
				setMessages(prev => mergeUniqueMessages(prev, result.newMessages))
				await addMessages(result.newMessages, chatId, effectiveGroupId)
			}

			if (result.ackMessageIds?.length) {
				try {
					await ackSecretMessages({
						variables: {
							chatId,
							secretSessionId,
							messageIds: result.ackMessageIds
						}
					})
				} catch (error) {
					console.warn(
						'[SecretChat] Failed to ack unread secret messages:',
						error
					)
				}
			}
		},
		[
			ackSecretMessages,
			ackSharedSecretKeys,
			chatId,
			effectiveGroupId,
			getPreKeys,
			getSecretMessages,
			getSharedSecretKey,
			mySecretPreKey,
			preKeysPub,
			secretSessionId,
			userId
		]
	)

	const loadChat = useCallback(async () => {
		if (!secretSessionId) return
		setLoadingMessage('Загрузка чата...')

		if (isDM) {
			await ensureDirectChatDirectory(chatId)
			const res = await loadDMKeysAction({
				chatId,
				userId,
				secretSessionId,
				getPreKeys,
				isSaved
			})
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
				secretSessionId,
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
	}, [chatId, effectiveGroupId, getPreKeys, isDM, secretSessionId, userId])

	useEffect(() => {
		let isCancelled = false

		const bootstrapChatState = async () => {
			if (isDM) await ensureDirectChatDirectory(chatId)
			if (
				isDM &&
				!isSaved &&
				(await fileExist(chatId, effectiveGroupId, FILE.MY_KEYS))
			) {
				await resetLegacyDmSecretState(chatId, effectiveGroupId)
				setSessionKey(null)
				setMessages([])
			}
			if (!isDM && (await fileExist(chatId, effectiveGroupId, FILE.MY_KEYS))) {
				await resetLegacyGroupSecretState(chatId, effectiveGroupId)
				setSessionKey(null)
				setMessages([])
			}

			const chatMessagesData = await loadMessages(chatId, effectiveGroupId)
			if (isCancelled) return
			setMessages(sortMessagesByCreatedAt(chatMessagesData || []))

			await loadChat()
		}

		void bootstrapChatState()

		return () => {
			isCancelled = true
		}
	}, [chatId, effectiveGroupId, isDM, isSaved, loadChat])

	const receiveAndPersistGroupKey = useCallback(
		async (reason: 'bootstrap' | 'subscription' | 'poll') => {
			void reason
			return false
		},
		[]
	)

	// Подписка на новые секретные сообщения
	useEffect(() => {
		const msg = subSecretMessage?.addSessionSecretMessage
		if (!msg) return
		;(async () => {
			const result = await processSecretSubscriptionAction({
				getSharedSecretKey,
				msg,
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				secretSessionId: secretSessionId!,
				sessionKey,
				preKeysPub,
				mySecretPreKey: mySecretPreKey!,
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
			if (
				result.needPersistKey &&
				result.sessionKey &&
				result.ackSharedKeyIds?.length
			) {
				try {
					await ackSharedSecretKeys({
						variables: {
							chatId,
							secretSessionId: secretSessionId!,
							sharedKeyIds: result.ackSharedKeyIds
						}
					})
				} catch (error) {
					console.warn(
						'[SecretChat][Sub] Failed to ack shared secret keys:',
						error
					)
				}
			}
			if (result.newMessage) {
				const nm = result.newMessage
				setMessages(prev => mergeUniqueMessages(prev, [nm]))
				await addMessages([nm], chatId, effectiveGroupId)
			}
			if (result.ackMessageIds?.length) {
				try {
					await ackSecretMessages({
						variables: {
							chatId,
							secretSessionId: secretSessionId!,
							messageIds: result.ackMessageIds
						}
					})
				} catch (error) {
					console.warn(
						'[SecretChat][Sub] Failed to ack secret message:',
						error
					)
				}
			}
		})()
	}, [
		ackSecretMessages,
		ackSharedSecretKeys,
		chat,
		chatId,
		effectiveGroupId,
		mySecretPreKey,
		preKeysPub,
		secretSessionId,
		sessionKey,
		subSecretMessage
	])

	// Получение секретных сообщений при наличии сессионного ключа
	// Для DM разрешаем запуск без sessionKey - pullSecretMessagesAction
	// сам выполнит X3DH-финализацию по первому сообщению в очереди
	useEffect(() => {
		if (!sessionKey && !isDM && !chat?.isGroup) return
		;(async () => {
			await syncUnreadMessages(chat, sessionKey)
		})()
	}, [chat, sessionKey, syncUnreadMessages])

	// ─── Group-only: инициализация/получение группового ключа ───────
	useEffect(() => {
		if (isDM || !GROUP_COMMON_KEY_FLOW_ENABLED) return
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
				setLoadingMessage('Ожидание общего ключа от инициатора...')
				return
			}

			const initResult = await initGroupSessionAction({
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				secretSessionId: secretSessionId!,
				mySecretPreKey: mySecretPreKey!,
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
		secretSessionId,
		sendSharedSecretKey,
		sessionKey,
		userId
	])

	// ─── Group-only: подписка на получение общего ключа ──────────────
	useEffect(() => {
		if (isDM || !GROUP_COMMON_KEY_FLOW_ENABLED) return
		const sharedKeyData = subSharedSecretKey?.addSessionSharedSecretKey
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
		if (isDM || !GROUP_COMMON_KEY_FLOW_ENABLED) return
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
			try {
				const [chatResponse, preKeysResponse] = await Promise.all([
					refetchServerChat(),
					getPreKeys({
						variables: { chatId },
						fetchPolicy: 'network-only'
					})
				])

				if (chatResponse.data?.findChatByChatId) {
					setChat(chatResponse.data.findChatByChatId)
				}

				if (preKeysResponse.data?.getSecretSessionPreKeys) {
					setPreKeysPub(preKeysResponse.data.getSecretSessionPreKeys)
				}
			} catch (error) {
				console.warn('[SecretChat] Failed to refresh after key rotation:', error)
			}

			const current = await loadGroupSenderKeys(chatId, effectiveGroupId)
			const nextEpoch = (current?.activeEpoch ?? 0) + 1
			const next = await createGroupSenderKeyState({
				chatId,
				groupId: effectiveGroupId,
				epoch: nextEpoch
			})
			await saveGroupSenderKeys(chatId, effectiveGroupId, {
				...next,
				received: Object.fromEntries(
					Object.entries(current?.received ?? {}).map(([key, value]) => [
						key,
						{ ...value, readOnly: true }
					])
				)
			})
			setSessionKey(null)
		})()
	}, [subKeyRotation, chatId, effectiveGroupId, getPreKeys, isDM, refetchServerChat])

	// отправка сообщения
	const sendMessage = async (
		text: string,
		user: FindAllUsersQuery['findAllUsers'][number]
	) => {
		try {
			if (!secretSessionId) {
				setErrorMessage('Secret session is not initialized yet')
				return false
			}
			if (isDM) await ensureDirectChatDirectory(chatId)
			setIsSendingFiles(true)
			const res = await sendSecretMessageAction({
				text,
				user,
				chat,
				chatId,
				groupId: effectiveGroupId,
				userId,
				secretSessionId: secretSessionId!,
				isSaved,
				files: filesRef.current,
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
				setMessages(prev => mergeUniqueMessages(prev, [nm]))
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
		if (newFile) {
			setFiles(prev => [
				...prev,
				isSaved ? { ...newFile, status: undefined } : newFile
			])
			// Signal-style: шифруем и загружаем сразу при выборе файла
			if (isSaved) {
				return
			}
			void encryptAndUploadFileAction({
				chatId,
				file: newFile,
				setFiles,
				uploadSecretAttachment
			})
		}
	}

	const pickImage = async () => {
		const { newFile, errorMessage: err } = await pickImageAction()
		if (err) setErrorMessage(err)
		if (newFile) {
			setFiles(prev => [
				...prev,
				isSaved ? { ...newFile, status: undefined } : newFile
			])
			// Signal-style: шифруем и загружаем сразу при выборе файла
			if (isSaved) {
				return
			}
			void encryptAndUploadFileAction({
				chatId,
				file: newFile,
				setFiles,
				uploadSecretAttachment
			})
		}
	}

	const removeFile = (fileId: string) => {
		const file = files.find(f => f.id === fileId)
		if (file?.attachmentId) {
			void discardSecretAttachment({
				variables: { chatId, attachmentId: file.attachmentId }
			})
		}
		setFiles(prev => prev.filter(f => f.id !== fileId))
	}

	const clearForm = () => {
		const res = clearFormAction()
		setDraftText(res.draftText)
		setFiles(res.files)
	}

	const reload = useCallback(async () => {
		setErrorMessage('')
		if (!secretSessionId) return
		if (isDM) {
			await ensureDirectChatDirectory(chatId)
		}
		const storedMessages = await loadMessages(chatId, effectiveGroupId)
		setMessages(sortMessagesByCreatedAt(storedMessages || []))
		await loadChat()
	}, [chatId, effectiveGroupId, isDM, loadChat, secretSessionId])

	/**
	 * Отправить существующий групповой ключ новому участнику после приглашения.
	 */
	const sendKeyToNewMember = async (targetUserId: string) => {
		void targetUserId
		console.info(
			'[SecretChat] Group sender keys are distributed before the next message'
		)
		return
		if (!sessionKey || !mySecretPreKey || !secretSessionId) {
			console.warn(
				'[SecretChat] sendKeyToNewMember: нет sessionKey или mySecretPreKey'
			)
			return
		}
		const result = await sendGroupKeyToNewMemberAction({
			chatId,
			groupId: effectiveGroupId,
			userId,
			secretSessionId: secretSessionId!,
			targetUserId,
			sessionKey: sessionKey!,
			mySecretPreKey: mySecretPreKey!,
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
		pickImage,
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
		isKeyReady: isDM && isSaved ? sessionKey !== null : Boolean(secretSessionId)
	}
}
