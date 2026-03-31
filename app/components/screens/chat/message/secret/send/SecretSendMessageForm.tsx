import { ImageIcon, Paperclip, SendHorizonal, X } from 'lucide-react-native'
import React, { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { SendFileType } from '@/types/send-file.type'

import ForwardedMessagesBar from './ForwardedMessagesBar'
import FileList from './file/FileList'

interface SecretSendMessageFormProps {
	chatId: string
	files: SendFileType[]
	filesEdited: SendFileType[]
	isSendingFiles: boolean
	pickAndSendFile: () => void
	pickAndSendImage?: () => void
	onDeleteFile: (id: string) => void
	clearMessageId: () => void
	handleClearForm: () => void
	forwardedMessages: ForwardedMessageType[]
	setForwardedMessages: (messages: ForwardedMessageType[]) => void
	setDraftText: (text: string) => void
	draftText: string
	editId: string | null
	setEditId: (id: string | null) => void
	setFilesEdited: (files: SendFileType[]) => void
	onSend: (text: string) => Promise<boolean>
}

interface FormValues {
	text: string
}

const SecretSendMessageForm: FC<SecretSendMessageFormProps> = ({
	setDraftText,
	files,
	filesEdited,
	isSendingFiles,
	pickAndSendFile,
	pickAndSendImage,
	onDeleteFile,
	clearMessageId,
	handleClearForm,
	forwardedMessages,
	setForwardedMessages,
	draftText,
	editId,
	setEditId,
	setFilesEdited,
	onSend
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { bottom } = useSafeAreaInsets()
	const isKeyboardVisible = useKeyboardVisible()
	const { control, handleSubmit, watch, reset } = useForm<FormValues>({
		defaultValues: { text: draftText ?? '' }
	})

	const allFilesReady =
		files.length === 0 ||
		files.every(f => f.status === 'uploaded' || !f.status)

	const canSendMessage =
		((watch('text')?.trim() ?? '') !== '' || files.length > 0) &&
		allFilesReady &&
		!isSendingFiles

	// синхронизация draftText с полем ввода
	useEffect(() => {
		reset({ text: draftText })
	}, [draftText])

	const handleSubmitMessage = async (data: FormValues) => {
		const text = data.text?.trim() ?? ''

		if (!text && files.length === 0 && forwardedMessages.length === 0) {
			return
		}

		const wasSent = await onSend(text)
		if (!wasSent) {
			return
		}

		reset({ text: '' })
		handleClearForm()
	}

	return (
		<View
			className='flex-col'
			style={{
				paddingBottom: isKeyboardVisible ? 4 : Math.max(bottom, 8)
			}}
		>
			{(files.length > 0 || filesEdited.length > 0) && (
				<FileList
					files={files}
					filesEdited={filesEdited}
					onDeleteFile={onDeleteFile}
					isLoadingSend={isSendingFiles}
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
				<TouchableOpacity
					onPress={pickAndSendFile}
					disabled={isSendingFiles}
					style={{
						width: 40,
						height: 40,
						borderRadius: 20,
						alignItems: 'center',
						justifyContent: 'center',
						opacity: isSendingFiles ? 0.6 : 1
					}}
				>
					<Paperclip size={22} color={colors.textSecondary} />
				</TouchableOpacity>

				{pickAndSendImage && (
					<TouchableOpacity
						onPress={pickAndSendImage}
						disabled={isSendingFiles}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							alignItems: 'center',
							justifyContent: 'center',
							opacity: isSendingFiles ? 0.6 : 1
						}}
					>
						<ImageIcon size={22} color={colors.textSecondary} />
					</TouchableOpacity>
				)}

				<Controller
					control={control}
					name='text'
					render={({ field }) => (
						<TextInput
							value={field.value}
							onChangeText={text => {
								field.onChange(text)
								setDraftText(text)
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
								void handleSubmit(handleSubmitMessage)()
							}}
							returnKeyType='send'
						/>
					)}
				/>

				{editId && (
					<TouchableOpacity
						onPress={() => setEditId(null)}
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

				<TouchableOpacity
					onPress={() => void handleSubmit(handleSubmitMessage)()}
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
					<SendHorizonal size={20} color='#fff' />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SecretSendMessageForm
