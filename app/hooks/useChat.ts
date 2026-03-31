import { createId } from '@paralleldrive/cuid2'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { ReactNativeFile } from 'extract-files'
import { useEffect, useRef, useState } from 'react'
import Toast from 'react-native-toast-message'

import {
	useChatUpdatedSubscription,
	useFindChatByChatIdQuery,
	useRemoveFileMutation,
	useSendFileMutation
} from '../graphql/generated/output'
import { ForwardedMessageType } from '../types/forward/forwarded-message.type'
import { MessageFileType } from '../types/message-file.type'
import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'
import { consumePendingForward } from '../utils/pending-forward'

import { isDirectContactBlockedError } from './useBlockedUsers'
import { useUser } from './useUser'

type UseChatOptions = {
	onBlockedError?: () => void
}

const normalizePinnedMessage = (
	chat: NonNullable<
		ReturnType<typeof useFindChatByChatIdQuery>['data']
	>['findChatByChatId']
): MessageType | null => {
	if (!chat.pinnedMessage) return null

	return {
		...chat.pinnedMessage,
		isStarted: false,
		chat: {
			chatName: chat.chatName ?? null
		},
		files: chat.pinnedMessage.files ?? null
	}
}

export const useChat = (chatId: string, options?: UseChatOptions) => {
	const { userId } = useUser()
	const [messageId, setMessageId] = useState<string | null>(null)

	// Check for pending forwarded messages set before navigating here
	const pendingRef = useRef(consumePendingForward(chatId))

	const [forwardedMessages, setForwardedMessages] = useState<
		ForwardedMessageType[]
	>(pendingRef.current?.messages ?? [])
	const [files, setFiles] = useState<SendFileType[]>([])
	const [draftText, setDraftText] = useState<string>(
		pendingRef.current?.text ?? ''
	)
	const [editId, setEditId] = useState<string | null>(null)
	const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null)

	const [filesEdited, setFilesEdited] = useState<SendFileType[]>([])

	const {
		data: chatData,
		loading: isLoadingFindChat,
		error: findChatError,
		refetch: refetchChat
	} = useFindChatByChatIdQuery({
		variables: {
			chatId
		},
		fetchPolicy: 'network-only'
	})
	const chat = chatData?.findChatByChatId

	// Подписка на обновления чата (пин, название, аватар, драфты)
	const { data: chatUpdatedData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !userId
	})

	useEffect(() => {
		if (!chatUpdatedData?.chatUpdated) return
		const updated = chatUpdatedData.chatUpdated
		if (updated.id !== chatId) return

		const pinnedMessageChanged =
			updated.pinnedMessageId !== (chat?.pinnedMessage?.id ?? null)

		if (pinnedMessageChanged) {
			void refetchChat()
			return
		}

		// Рефетчим только при структурных изменениях (не при каждом новом сообщении)
		const nameChanged = chat && updated.chatName !== chat.chatName
		const avatarChanged = chat && updated.avatarUrl !== chat.avatarUrl
		const secretChanged = chat && updated.isSecret !== chat.isSecret
		const totpChanged = chat && updated.requireTotp !== chat.requireTotp
		const membersChanged =
			chat && updated.members.length !== chat.members.length

		if (
			nameChanged ||
			avatarChanged ||
			secretChanged ||
			totpChanged ||
			membersChanged
		) {
			void refetchChat()
		}
	}, [chat, chatId, chatUpdatedData, refetchChat])

	const draftRestoredRef = useRef(false)

	// Handle chatId change without remount (React Navigation reuses component)
	useEffect(() => {
		const pending = consumePendingForward(chatId)
		if (pending) {
			setForwardedMessages(pending.messages)
			setDraftText(pending.text)
			pendingRef.current = pending
			draftRestoredRef.current = false
		}
	}, [chatId])

	useEffect(() => {
		if (!chat) return

		setPinnedMessage(normalizePinnedMessage(chat))

		// Восстанавливаем черновик только при первой загрузке
		if (draftRestoredRef.current) return
		draftRestoredRef.current = true

		// If we navigated here from a forward action, we already seeded the state
		// from pendingForward — skip restoring from server draft to avoid overwrite
		if (pendingRef.current) {
			pendingRef.current = null
			return
		}

		const draft = chat.draftMessages?.[0]
		if (!draft) return
		setDraftText(draft.text ?? '')
		setEditId(draft?.editId ?? null)
		if (draft?.repliedToLinks) {
			const forwarded = draft.repliedToLinks
				.map(reply => reply?.repliedTo)
				.filter((msg): msg is MessageType => !!msg)
			setForwardedMessages(forwarded)
		}

		if (draft?.files) {
			const files = draft.files.map(file => ({
				name: file.fileName,
				size: file.fileSize.toString(),
				id: file.id
			}))
			setFiles(files)
		}
	}, [chat])

	const [send, { loading: isLoadingSendFile }] = useSendFileMutation()

	const handleBlockedRuntimeError = () => {
		options?.onBlockedError?.()
	}

	const reloadChat = async () => {
		await refetchChat()
	}

	const handleClearForm = () => {
		setDraftText('')
		setFiles([])
		setForwardedMessages([])
		setFilesEdited([])
		setEditId(null)
		setFilesEdited([])
	}

	const [removeFile] = useRemoveFileMutation({
		onError(err) {}
	})

	const handleAddForwardedMessage = (
		messages: ForwardedMessageType[],
		initialText?: string
	) => {
		setForwardedMessages(messages)
		if (typeof initialText === 'string') {
			setDraftText(initialText)
		}
	}

	const handleDelete = (id: string) => {
		setMessageId(null)
		const fileToDelete = files.find(file => file.id === id)
		setFiles(prev => prev.filter(file => file.id !== id))
		if (!fileToDelete || id.startsWith('temp:')) {
			return
		}

		removeFile({
			variables: { fileId: id, chatId }
		})
	}

	const handleClearMessageId = () => setMessageId(null)

	const startEdit = (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => {
		setEditId(message.id)
		setDraftText(message.text ?? '')
		setFiles(
			(message.files ?? []).map((file: MessageFileType) => ({
				name: file.fileName,
				size: file.fileSize.toString(),
				id: file.id
			}))
		)
		setForwardedMessages(forwardedMessages ?? [])
	}

	const pickAndSendFile = async () => {
		try {
			const res = await DocumentPicker.getDocumentAsync({
				type: '*/*',
				copyToCacheDirectory: true,
				multiple: false
			})

			let asset = undefined as any
			if (
				'assets' in res &&
				Array.isArray(res.assets) &&
				res.assets.length > 0
			) {
				asset = res.assets[0]
			} else {
				const anyRes = res as any
				if (anyRes && (anyRes.uri || anyRes.name)) {
					asset = {
						uri: anyRes.uri,
						name: anyRes.name ?? 'unknown',
						size: anyRes.size ?? undefined,
						mimeType:
							anyRes.mimeType ??
							anyRes.type ??
							'application/octet-stream'
					}
				}
			}

			if (!asset) {
				return
			}

			// Проверки лимитов/дубликатов
			const rawName = asset.name ?? 'unknown'
			const name = decodeURIComponent(rawName)
			const sizeStr = asset.size ? String(asset.size) : '0'
			const tempId = `temp:${createId()}`
			if (files.length >= 7) {
				Toast.show({ type: 'error', text1: 'Maximum files reached' })
				return
			}
			if (files.some(f => f.name === name)) {
				Toast.show({ type: 'info', text1: 'File already selected' })
				return
			}

			setFiles(prev => [...prev, { name, size: sizeStr, id: tempId }])

			// Создаём ReactNativeFile — apollo-upload-client понимает этот объект
			const reactFile = new ReactNativeFile({
				uri: asset.uri,
				name,
				type: asset.mimeType ?? 'application/octet-stream'
			})

			const result = await send({
				variables: {
					chatId,
					file: reactFile,
					messageId: messageId ?? 'null'
				}
			})

			const fileId = result.data?.sendFile.fileId
			const chatDraftMessageId = result.data?.sendFile.chatDraftMessageId

			if (!fileId || !chatDraftMessageId) {
				throw new Error('File upload did not return identifiers')
			}

			setMessageId(chatDraftMessageId)
			setFiles(prev =>
				prev.map(file =>
					file.id === tempId ? { ...file, id: fileId } : file
				)
			)
		} catch (err: any) {
			console.error('pickAndSend error', err)
			setFiles(prev => prev.filter(file => !file.id.startsWith('temp:')))
			if (isDirectContactBlockedError(err)) {
				handleBlockedRuntimeError()
				return
			}
			Toast.show({ type: 'error', text1: 'Failed to pick/send file' })
		}
	}

	const pickAndSendImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsMultipleSelection: false,
				quality: 0.8
			})

			if (result.canceled || !result.assets?.[0]) return

			const asset = result.assets[0]
			const rawName = asset.fileName ?? `image_${Date.now()}.jpg`
			const name = decodeURIComponent(rawName)
			const sizeStr = asset.fileSize ? String(asset.fileSize) : '0'
			const tempId = `temp:${createId()}`

			if (files.length >= 7) {
				Toast.show({ type: 'error', text1: 'Maximum files reached' })
				return
			}

			setFiles(prev => [...prev, { name, size: sizeStr, id: tempId }])

			const reactFile = new ReactNativeFile({
				uri: asset.uri,
				name,
				type: asset.mimeType ?? 'image/jpeg'
			})

			const uploadResult = await send({
				variables: {
					chatId,
					file: reactFile,
					messageId: messageId ?? 'null'
				}
			})

			const fileId = uploadResult.data?.sendFile.fileId
			const chatDraftMessageId =
				uploadResult.data?.sendFile.chatDraftMessageId

			if (!fileId || !chatDraftMessageId) {
				throw new Error('File upload did not return identifiers')
			}

			setMessageId(chatDraftMessageId)
			setFiles(prev =>
				prev.map(file =>
					file.id === tempId ? { ...file, id: fileId } : file
				)
			)
		} catch (err: any) {
			console.error('pickAndSendImage error', err)
			setFiles(prev => prev.filter(file => !file.id.startsWith('temp:')))
			if (isDirectContactBlockedError(err)) {
				handleBlockedRuntimeError()
				return
			}
			Toast.show({ type: 'error', text1: 'Failed to pick/send image' })
		}
	}

	const hasPendingUploads = files.some(file => file.id.startsWith('temp:'))

	return {
		files,
		hasPendingUploads,
		messageId,
		isLoadingSendFile,
		handleDelete,
		handleClearMessageId,
		forwardedMessages,
		setForwardedMessages,
		handleAddForwardedMessage,
		isLoadingFindChat,
		findChatError,
		draftText,
		chat,
		setEditId,
		editId,
		startEdit,
		handleClearForm,
		setFilesEdited,
		filesEdited,
		pinnedMessage,
		setPinnedMessage,
		pickAndSendFile,
		pickAndSendImage,
		reloadChat
	}
}
