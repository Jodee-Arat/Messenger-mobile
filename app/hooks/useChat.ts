import * as DocumentPicker from 'expo-document-picker'
import { ReactNativeFile } from 'extract-files'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

import {
	useFindChatByChatIdQuery,
	useRemoveFileMutation,
	useSendFileMutation
} from '../graphql/generated/output'
import { ForwardedMessageType } from '../types/forward/forwarded-message.type'
import { MessageFileType } from '../types/message-file.type'
import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

export const useChat = (chatId: string) => {
	const [messageId, setMessageId] = useState<string | null>(null)

	const [forwardedMessages, setForwardedMessages] = useState<
		ForwardedMessageType[]
	>([])
	const [files, setFiles] = useState<SendFileType[]>([])
	const [draftText, setDraftText] = useState<string>('')
	const [editId, setEditId] = useState<string | null>(null)
	const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null)

	const [filesEdited, setFilesEdited] = useState<SendFileType[]>([])

	const { data: chatData, loading: isLoadingFindChat } =
		useFindChatByChatIdQuery({
			variables: {
				chatId
			},
			fetchPolicy: 'network-only'
		})
	const chat = chatData?.findChatByChatId

	useEffect(() => {
		if (!chat) return

		if (chat.pinnedMessage) {
			setPinnedMessage(chat.pinnedMessage)
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

	const [send, { loading: isLoadingSendFile }] = useSendFileMutation({
		onCompleted(data) {
			setMessageId(data.sendFile.chatDraftMessageId)
			setFiles(prevFilesId => [
				...prevFilesId.slice(0, -1),
				{
					...prevFilesId[prevFilesId.length - 1],
					id: data.sendFile.fileId
				}
			])
		},
		onError(err) {}
	})

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

	const handleAddForwardedMessage = (messages: ForwardedMessageType[]) =>
		setForwardedMessages(messages)

	const handleDelete = (id: string) => {
		setMessageId(null)
		let isFileEdited = false
		setFiles(prev =>
			prev.filter(file => {
				if (file.id === id) {
					isFileEdited = true
				}
				return file.id !== id
			})
		)
		if (isFileEdited) {
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

			// новый формат: { assets: [ { uri, name, size, mimeType, ... } ] }
			// или старый: fallback через any
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
				// пользователь отменил или что-то не выбрал
				return
			}

			// Проверки лимитов/дубликатов
			const name = asset.name ?? 'unknown'
			const sizeStr = asset.size ? String(asset.size) : '0'
			if (files.length >= 7) {
				Toast.show({ type: 'error', text1: 'Maximum files reached' })
				return
			}
			if (files.some(f => f.name === name)) {
				Toast.show({ type: 'info', text1: 'File already selected' })
				return
			}

			// Добавляем временно в UI
			setFiles(prev => [...prev, { name, size: sizeStr, id: '' }])

			// Создаём ReactNativeFile — apollo-upload-client понимает этот объект
			const reactFile = new ReactNativeFile({
				uri: asset.uri,
				name,
				type: asset.mimeType ?? 'application/octet-stream'
			})

			// Вызываем GraphQL мутацию sendFile(chatId, file, messageId?)
			await send({
				variables: {
					chatId,
					file: reactFile,
					messageId: messageId ?? 'null'
				}
			})

			// в onCompleted мутации обнови UI (заполни id, удалить tmp-элемент и т.д.)
		} catch (err: any) {
			console.error('pickAndSend error', err)
			Toast.show({ type: 'error', text1: 'Failed to pick/send file' })
		}
	}

	return {
		files,
		messageId,
		isLoadingSendFile,
		handleDelete,
		handleClearMessageId,
		forwardedMessages,
		setForwardedMessages,
		handleAddForwardedMessage,
		isLoadingFindChat,
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
		pickAndSendFile
	}
}
