import * as FileSystem from 'expo-file-system'
import { MutableRefObject, useEffect, useRef, useState } from 'react'

import {
	FILE,
	addMessages,
	createMyKey,
	fileExist,
	loadAllSecretChats,
	loadChatData,
	loadMessages,
	loadMyKeys,
	loadMyPreKeyJSON,
	saveMessages
} from '@/utils/secret-chat/secretChat'

import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	clearFormAction,
	deleteMessagesAction,
	loadChatAction,
	pickFileAction,
	processSecretSubscriptionAction,
	pullSecretMessagesAction,
	sendSecretMessageAction
} from './useSecretChat.actions'
import {
	FindAllChatsByGroupQuery,
	FindAllUsersQuery,
	GetPreKeysQuery,
	useAddSecretMessageSubscription,
	useAddSharedSecretKeySubscription,
	useFindChatByChatIdQuery,
	useGetPreKeysLazyQuery,
	useGetSecretMessageLazyQuery,
	useGetSharedSecretKeyLazyQuery,
	useSendChatMessageMutation,
	useSendSecretMessageMutation,
	useSendSharedSecretKeyMutation
} from '@/graphql/generated/output'
import { PreKeyBundleClient } from '@/libs/e2ee/gost'

// Вспомогательные утилиты вынесены в отдельный модуль useSecretChat.actions.ts

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

// ===== Вспомогательные функции (будущие выносные утилиты) =====
// Каждая функция ниже задокументирована и не зависит от React-хуков напрямую.
// Хук будет только хранить состояния и вызывать эти функции.

// loadChatAction вынесен в ./useSecretChat.actions

// processSecretSubscriptionAction вынесен в ./useSecretChat.actions

// pullSecretMessagesAction вынесен в ./useSecretChat.actions

// sendSecretMessageAction вынесен в ./useSecretChat.actions

// deleteMessagesAction вынесен в ./useSecretChat.actions

// pickFileAction вынесен в ./useSecretChat.actions

// clearFormAction вынесен в ./useSecretChat.actions

export const useSecretChat = (
	groupId: string,
	chatId: string,
	userId: string
) => {
	const [chat, setChat] = useState<
		FindAllChatsByGroupQuery['findAllChatsByGroup'][0] | null
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

	// ref для отслеживания изменений
	const chatRef = useRef<SecretChatData | null>(null)

	// Держим актуальную копию сообщений в ref для корректного cleanup
	useEffect(() => {
		messagesRef.current = messages
	}, [messages])

	// Загружаем чат
	useEffect(() => {
		const runLoadMessages = async () => {
			const chatMessagesData = await loadMessages(chatId, groupId)
			setMessages(chatMessagesData || [])
		}

		runLoadMessages()
		loadChat()
		return () => {}
	}, [chatId])

	const [getPreKeys, { data: dataPreKeys, loading: loadGetPreKeys }] =
		useGetPreKeysLazyQuery({
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
	// const { data: subSharedSecretKey } = useAddSharedSecretKeySubscription({
	// 	variables: { userId }
	// })

	const [sendMessageToClients] = useSendSecretMessageMutation()
	const [sendSharedSecretKey] = useSendSharedSecretKeyMutation()

	// Глобальная дедупликация обработанных пакетов (iv+sig)
	const processedRef = useRef<Set<string>>(new Set())

	const loadChat = async () => {
		setLoadingMessage('Загрузка чата...')
		const res = await loadChatAction({
			chatId,
			groupId,
			userId,
			getPreKeys
		})
		if (res.errorMessage) setErrorMessage(res.errorMessage)
		if (res.chat !== undefined) setChat(res.chat)
		if (res.mySecretPreKey !== undefined)
			setMySecretPreKey(res.mySecretPreKey ?? null)
		if (res.preKeysPub !== undefined) setPreKeysPub(res.preKeysPub ?? [])
		if (res.sessionKey !== undefined) setSessionKey(res.sessionKey ?? null)
		setLoadingMessage('')
	}

	// Подписка на новые секретные сообщения
	useEffect(() => {
		const msg = subSecretMessage?.addSecretMessage
		console.log(msg)

		if (!msg) return
		;(async () => {
			const result = await processSecretSubscriptionAction({
				getSharedSecretKey,
				msg,
				chat,
				chatId,
				groupId,
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
				await createMyKey(chatId, groupId, userId, result.sessionKey)
			if (result.newMessage) {
				const nm = result.newMessage
				setMessages(prev => [...prev, nm])
				addMessages([nm], chatId, groupId)
			}
		})()
	}, [subSecretMessage, chat, sessionKey, preKeysPub, mySecretPreKey])

	// Получение секретных сообщений: при наличии сессионного ключа — просто расшифровываем;
	// если ключа нет — пытаемся восстановить из файла, затем из очереди sharedSecretKey
	useEffect(() => {
		;(async () => {
			const result = await pullSecretMessagesAction({
				chatId,
				groupId,
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
				await createMyKey(chatId, groupId, userId, result.sessionKey)
			if (result.newMessages.length) {
				setMessages(prev => [...prev, ...result.newMessages])
				addMessages(result.newMessages, chatId, groupId)
			}
		})()
	}, [chatId, chat, preKeysPub, mySecretPreKey])

	const sendMessage = async (
		text: string,
		user: FindAllUsersQuery['findAllUsers'][number]
	) => {
		const res = await sendSecretMessageAction({
			text,
			user,
			chat,
			chatId,
			groupId,
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
			addMessages([nm], chatId, groupId)
		}
		if (res.sessionKey !== undefined) setSessionKey(res.sessionKey ?? null)
		if (res.needPersistKey && res.sessionKey && chat)
			await createMyKey(chat.id, groupId, user.id, res.sessionKey)
	}

	const deleteMessage = async (messageIds: string[]) => {
		const { nextMessages } = await deleteMessagesAction({
			messageIds,
			messagesRef,
			chatId,
			groupId
		})
		setMessages(nextMessages)
		await saveMessages(nextMessages, chatId, groupId)
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
		reload: loadChat
	}
}
