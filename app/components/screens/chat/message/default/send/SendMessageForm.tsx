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

import { useTheme, useTranslation } from '@/hooks/useTheme'

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
	canSendMessages?: boolean
	onTyping?: () => void
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
	setFilesEdited,
	canSendMessages = true,
	onTyping
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
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
				text1: error.message || t('somethingWentWrong')
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

				text1: error.message || t('somethingWentWrong')
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

				text1: error.message || t('somethingWentWrong')
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

	if (!canSendMessages) {
		return (
			<View className='flex-col'>
				<View
					className='flex-row items-center mt-3 px-3 py-3 rounded-xl'
					style={{ backgroundColor: colors.cardHover }}
				>
					<Text
						style={{
							color: colors.textMuted,
							flex: 1,
							textAlign: 'center',
							fontSize: 14
						}}
					>
						{t('noSendPermission') ||
							'У вас нет разрешения отправлять сообщения'}
					</Text>
				</View>
			</View>
		)
	}

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
					className='p-2 rounded-lg'
					style={{ backgroundColor: colors.cardHover }}
				>
					<Paperclip size={24} color={colors.textSecondary} />
				</TouchableOpacity>
				{/* Text input */}
				<Controller
					control={control}
					name='text'
					render={({ field }) => (
						<TextInput
							value={field.value ?? ''}
							onChangeText={text => {
								field.onChange(text)
								onTyping?.()
							}}
							placeholder={t('writeMessage')}
							placeholderTextColor={colors.textMuted}
							multiline
							style={{
								flex: 1,
								minHeight: 40,
								maxHeight: 120,
								paddingHorizontal: 12,
								paddingVertical: 8,
								borderWidth: 1,
								borderColor: colors.borderLight,
								backgroundColor: colors.inputBg,
								color: colors.text,
								borderRadius: 12
							}}
							onSubmitEditing={() => {
								Keyboard.dismiss()
								handleSubmit(() =>
									onSubmit({ text: field.value ?? '' })
								)()
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
						className='p-2 rounded-lg'
						style={{ backgroundColor: colors.cardHover }}
					>
						<X size={20} color={colors.textSecondary} />
					</TouchableOpacity>
				)}

				{/* Send button */}
				<TouchableOpacity
					onPress={handleSubmit(data => onSubmit(data))}
					disabled={!canSendMessage}
					className='p-2 rounded-lg'
					style={{
						backgroundColor: canSendMessage
							? colors.accent
							: colors.cardHover
					}}
				>
					<SendHorizonal size={24} color='#fff' />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SendMessageForm
