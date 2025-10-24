import { zodResolver } from '@hookform/resolvers/zod'
import * as DocumentPicker from 'expo-document-picker'
import type {
	DocumentPickerAsset,
	DocumentPickerResult
} from 'expo-document-picker'
import { Paperclip, SendHorizonal, X } from 'lucide-react-native'
import React, { FC, useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { SendFileType } from '@/types/send-file.type'

import { haveItemsChangedById } from '@/utils/have-items-changedById'

import ForwardedMessagesBar from './ForwardedMessagesBar'
import FileList from './file/FileList'
import {
	useRemoveDraftMutation,
	useSendChatDraftMessageMutation,
	useSendChatMessageMutation
} from '@/graphql/generated/output'
import {
	SendMessageSchemaType,
	sendMessageSchema
} from '@/schemas/chat/send-message.schema'

interface SendMessageFormProp {
	pickAndSendFile: () => void
	handleClearForm: () => void
	chatId: string
	files: SendFileType[]
	editId?: string | null
	setEditId: (editId: string | null) => void
	setForwardedMessages: (messages: ForwardedMessageType[]) => void
	isLoadingSendFiles: boolean
	forwardedMessages?: ForwardedMessageType[]
	onDeleteFile: (id: string) => void
	clearMessageId: () => void
	draftText: string
	filesEdited: SendFileType[]
	setFilesEdited: (files: SendFileType[]) => void
}

const SendMessageForm: FC<SendMessageFormProp> = ({
	pickAndSendFile,
	handleClearForm,
	chatId,
	files,
	isLoadingSendFiles,
	onDeleteFile,
	clearMessageId,
	forwardedMessages,
	setForwardedMessages,
	draftText,
	editId,
	setEditId,
	filesEdited,
	setFilesEdited
}) => {
	const forwardedMessagesRef = useRef(forwardedMessages)
	const filesRef = useRef(files)
	const draftTextRef = useRef(draftText)
	const editIdRef = useRef(editId)
	const filesEditedRef = useRef(filesEdited)

	const { control, handleSubmit, watch, reset, getValues } =
		useForm<SendMessageSchemaType>({
			resolver: zodResolver(sendMessageSchema),
			defaultValues: { text: draftTextRef.current ?? '' }
		})

	const [sendMessage] = useSendChatMessageMutation({
		onCompleted() {
			forwardedMessagesRef.current = []
			filesRef.current = []
			draftTextRef.current = ''
			editIdRef.current = null
			filesEditedRef.current = []
			reset()
			handleClearForm()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: error.message || 'Something went wrong'
			})
		}
	})

	const [sendDraft] = useSendChatDraftMessageMutation({
		onCompleted() {
			forwardedMessagesRef.current = []
			filesRef.current = []
			draftTextRef.current = ''
			editIdRef.current = null
			filesEditedRef.current = []
			reset()
			handleClearForm()
		},
		onError(error) {
			Toast.show({
				type: 'error',

				text1: error.message || 'Something went wrong'
			})
		}
	})

	const [removeDraftMessage] = useRemoveDraftMutation({
		onCompleted() {
			forwardedMessagesRef.current = []
			filesRef.current = []
			draftTextRef.current = ''
			editIdRef.current = null
			filesEditedRef.current = []
			reset()
			handleClearForm()
		},
		onError(error) {
			Toast.show({
				type: 'error',

				text1: error.message || 'Something went wrong'
			})
		}
	})

	const canSendMessage =
		(watch('text')?.trim() ?? '') !== '' || files.length > 0

	const onSubmit = async (data: SendMessageSchemaType, isDraft = false) => {
		const trimmedText = data.text?.trim() ?? ''
		const forwardedMessageIds = forwardedMessages?.map(m => m.id) ?? []
		const filesId = files.map(f => f.id)

		if (isDraft) {
			if (
				!trimmedText &&
				filesId.length === 0 &&
				forwardedMessageIds.length === 0
			) {
				removeDraftMessage({ variables: { chatId } })
				return
			}
			sendDraft({
				variables: {
					chatId,
					data: {
						editId: editId ?? undefined,
						text: trimmedText || null,
						forwardedMessageIds:
							forwardedMessageIds.length > 0
								? forwardedMessageIds
								: undefined,
						fileIds: filesId,
						targetChatsId: [chatId]
					}
				}
			})
		} else {
			if (trimmedText || files.length > 0) {
				sendMessage({
					variables: {
						chatId,
						data: {
							editId: editId ?? undefined,
							text: trimmedText || null,
							forwardedMessageIds:
								forwardedMessageIds.length > 0
									? forwardedMessageIds
									: undefined,
							fileIds: filesId,
							targetChatsId: [chatId]
						}
					}
				})
			}
			setForwardedMessages([])
			clearMessageId()
		}
	}

	useEffect(() => {
		forwardedMessagesRef.current = forwardedMessages
		filesRef.current = files
		draftTextRef.current = draftText
		editIdRef.current = editId
		filesEditedRef.current = filesEdited
		reset({ text: draftText })
	}, [forwardedMessages, files, draftText, editId, filesEdited])

	useEffect(() => {
		return () => {
			const values = getValues()
			const isForwardedMessagesChanged = haveItemsChangedById(
				forwardedMessagesRef.current ?? [],
				forwardedMessages ?? []
			)
			const isFilesChanged = haveItemsChangedById(
				filesRef.current ?? [],
				files ?? []
			)
			const isTextChanged = values.text !== draftTextRef.current
			if (
				!isForwardedMessagesChanged &&
				!isFilesChanged &&
				!isTextChanged
			)
				return
			onSubmit(values, true)
		}
	}, [])

	return (
		<View className='flex-col'>
			{(files.length > 0 || filesEdited.length > 0) && (
				<FileList
					filesEdited={filesEdited}
					files={files}
					isLoadingSend={isLoadingSendFiles}
					onDeleteFile={onDeleteFile}
				/>
			)}

			{forwardedMessages && forwardedMessages.length > 0 && (
				<ForwardedMessagesBar
					forwardedMessages={forwardedMessages}
					setForwardedMessages={setForwardedMessages}
				/>
			)}

			<View className='flex-row items-center mt-3 space-x-2'>
				{/* File button */}
				<TouchableOpacity
					onPress={pickAndSendFile}
					className='p-2 bg-gray-200 rounded-md'
				>
					<Paperclip size={24} color='#000' />
				</TouchableOpacity>
				{/* Text input */}
				<Controller
					control={control}
					name='text'
					render={({ field }) => (
						<TextInput
							value={field.value ?? ''} // <-- вот тут
							onChangeText={field.onChange}
							placeholder='Send message'
							multiline
							style={{
								flex: 1,
								minHeight: 40,
								maxHeight: 120,
								paddingHorizontal: 8,
								paddingVertical: 6,
								borderWidth: 1,
								borderColor: '#ccc',
								borderRadius: 8
							}}
							onSubmitEditing={() => {
								Keyboard.dismiss()
								handleSubmit(() =>
									onSubmit({ text: field.value ?? '' })
								)() // <-- тоже на всякий случай
							}}
							returnKeyType='send'
						/>
					)}
				/>

				{/* Cancel edit button */}
				{editId && (
					<TouchableOpacity
						onPress={() =>
							removeDraftMessage({ variables: { chatId } })
						}
						disabled={!canSendMessage}
						className='p-2 bg-gray-300 rounded-md'
					>
						<X size={20} color='#000' />
					</TouchableOpacity>
				)}

				{/* Send button */}
				<TouchableOpacity
					onPress={handleSubmit(data => onSubmit(data))}
					disabled={!canSendMessage}
					className='p-2 bg-blue-500 rounded-md'
				>
					<SendHorizonal size={24} color='#fff' />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SendMessageForm
