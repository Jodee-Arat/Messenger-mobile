import { zodResolver } from '@hookform/resolvers/zod'
import * as DocumentPicker from 'expo-document-picker'
import type {
	DocumentPickerAsset,
	DocumentPickerResult
} from 'expo-document-picker'
import {
	Check,
	ImageIcon,
	Paperclip,
	Pencil,
	SendHorizonal,
	X
} from 'lucide-react-native'
import React, { FC, useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	Keyboard,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import { isDirectContactBlockedError } from '@/hooks/useBlockedUsers'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
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
	pickAndSendImage?: () => void
	handleClearForm: () => void
	chatId: string
	files: SendFileType[]
	editId?: string | null
	setEditId: (editId: string | null) => void
	setForwardedMessages: (messages: ForwardedMessageType[]) => void
	hasPendingUploads: boolean
	isLoadingSendFiles: boolean
	forwardedMessages?: ForwardedMessageType[]
	onDeleteFile: (id: string) => void
	clearMessageId: () => void
	draftText: string
	filesEdited: SendFileType[]
	setFilesEdited: (files: SendFileType[]) => void
	canSendMessages?: boolean
	blockedStateMessage?: string | null
	onBlockedError?: () => void
	onTyping?: () => void
}

const SendMessageForm: FC<SendMessageFormProp> = ({
	pickAndSendFile,
	pickAndSendImage,
	handleClearForm,
	chatId,
	files,
	hasPendingUploads,
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
	blockedStateMessage,
	onBlockedError,
	onTyping
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { bottom } = useSafeAreaInsets()
	const isKeyboardVisible = useKeyboardVisible()
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
			if (isDirectContactBlockedError(error)) {
				onBlockedError?.()
				return
			}
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
			if (isDirectContactBlockedError(error)) {
				onBlockedError?.()
				return
			}
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
		((watch('text')?.trim() ?? '') !== '' || files.length > 0) &&
		!hasPendingUploads
	const isComposerBlocked = !!blockedStateMessage

	const handleCancelEdit = () => {
		setEditId(null)
		clearMessageId()
		handleClearForm()
		reset({ text: '' })
		removeDraftMessage({ variables: { chatId } })
	}

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

	if (!canSendMessages || isComposerBlocked) {
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
						{blockedStateMessage ||
							t('noSendPermission') ||
							'У вас нет разрешения отправлять сообщения'}
					</Text>
				</View>
			</View>
		)
	}

	return (
		<View
			className='flex-col'
			style={{
				paddingBottom: isKeyboardVisible
					? Platform.OS === 'ios'
						? 4
						: 4
					: Math.max(bottom, 8)
			}}
		>
			{editId && (
				<View
					className='mb-3 px-3 py-2 rounded-xl flex-row items-center justify-between'
					style={{
						backgroundColor: colors.cardHover,
						borderWidth: 1,
						borderColor: colors.accent
					}}
				>
					<View className='flex-row items-center flex-1 pr-3'>
						<View
							className='w-8 h-8 rounded-full items-center justify-center mr-2'
							style={{ backgroundColor: colors.accentMuted }}
						>
							<Pencil size={16} color={colors.accent} />
						</View>
						<View className='flex-1'>
							<Text
								className='text-sm font-semibold'
								style={{ color: colors.accent }}
							>
								{t('edit')}
							</Text>
							<Text
								numberOfLines={1}
								className='text-xs'
								style={{ color: colors.textSecondary }}
							>
								{watch('text')?.trim() ||
									(files.length > 0
										? `${files.length} ${t('files')}`
										: t('empty'))}
							</Text>
						</View>
					</View>

					<TouchableOpacity
						onPress={handleCancelEdit}
						className='p-1'
						activeOpacity={0.7}
					>
						<X size={18} color={colors.textSecondary} />
					</TouchableOpacity>
				</View>
			)}

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

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 8,
					paddingVertical: 6,
					borderTopWidth: 1,
					borderTopColor: colors.borderLight,
					gap: 6
				}}
			>
				{/* File button */}
				<TouchableOpacity
					onPress={pickAndSendFile}
					style={{
						width: 40,
						height: 40,
						borderRadius: 20,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Paperclip size={22} color={colors.textSecondary} />
				</TouchableOpacity>
				{/* Image button */}
				{pickAndSendImage && (
					<TouchableOpacity
						onPress={pickAndSendImage}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<ImageIcon size={22} color={colors.textSecondary} />
					</TouchableOpacity>
				)}
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
								paddingHorizontal: 16,
								paddingVertical: 8,
								backgroundColor: colors.inputBg,
								color: colors.text,
								borderRadius: 24
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
						onPress={handleCancelEdit}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: colors.cardHover
						}}
					>
						<X size={20} color={colors.textSecondary} />
					</TouchableOpacity>
				)}

				{/* Send button */}
				<TouchableOpacity
					onPress={handleSubmit(data => onSubmit(data))}
					disabled={!canSendMessage}
					style={{
						width: 40,
						height: 40,
						borderRadius: 20,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: canSendMessage
							? colors.accent
							: colors.cardHover
					}}
				>
					{editId ? (
						<Check size={20} color='#fff' />
					) : (
						<SendHorizonal size={20} color='#fff' />
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SendMessageForm
