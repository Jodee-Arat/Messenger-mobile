import { useEffect, useState } from 'react'

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

	const handleFileSend = async (file: File) => {
		if (files.length >= 7) {
			return
		}

		if (files.some(fileState => fileState.name === file.name)) {
			return
		}

		setFiles(prevFiles => [
			...prevFiles,
			{ name: file.name, size: file.size.toString(), id: '' }
		])

		send({
			variables: {
				chatId,
				file,
				messageId: messageId ?? 'null'
			}
		})
	}

	const drop = async (e: React.DragEvent<HTMLDivElement>) => {
		const file = e.dataTransfer.files[0]

		if (files.length < 7) {
			if (files.some(fileState => fileState.name === file.name)) {
				return
			}

			setFiles(prevFiles => [
				...prevFiles,
				{ name: file.name, size: file.size.toString(), id: '' }
			])

			send({
				variables: {
					chatId,
					file,
					messageId: messageId ?? 'null'
				}
			})
		} else {
		}
	}

	return {
		files,
		messageId,
		isLoadingSendFile,
		handleDelete,
		handleClearMessageId,
		drop,
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
		handleFileSend
	}
}
