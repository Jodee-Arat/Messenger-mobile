import { Paperclip, SendHorizonal, X } from 'lucide-react-native'
import React, { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { SendFileType } from '@/types/send-file.type'

import ForwardedMessagesBar from './ForwardedMessagesBar'
import FileList from './file/FileList'

interface SecretSendMessageFormProps {
	chatId: string
	files: SendFileType[]
	filesEdited: SendFileType[]
	pickAndSendFile: () => void
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
	onSend: (text: string) => void
}

interface FormValues {
	text: string
}

const SecretSendMessageForm: FC<SecretSendMessageFormProps> = ({
	setDraftText,
	files,
	filesEdited,
	pickAndSendFile,
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
	const { control, handleSubmit, watch, reset } = useForm<FormValues>({
		defaultValues: { text: draftText ?? '' }
	})

	const canSendMessage =
		(watch('text')?.trim() ?? '') !== '' || files.length > 0

	// синхронизация draftText с полем ввода
	useEffect(() => {
		reset({ text: draftText })
	}, [draftText])

	const handleSubmitMessage = (data: FormValues) => {
		const text = data.text?.trim() ?? ''

		if (!text && files.length === 0 && forwardedMessages.length === 0) {
			return
		}

		onSend(text)
		reset({ text: '' })
		handleClearForm()
	}

	return (
		<View className='flex-col'>
			{(files.length > 0 || filesEdited.length > 0) && (
				<FileList
					files={files}
					filesEdited={filesEdited}
					onDeleteFile={onDeleteFile}
					isLoadingSend={false}
				/>
			)}

			{forwardedMessages && forwardedMessages.length > 0 && (
				<ForwardedMessagesBar
					forwardedMessages={forwardedMessages}
					setForwardedMessages={setForwardedMessages}
				/>
			)}

			<View className='flex-row items-center mt-3 space-x-2'>
				<TouchableOpacity
					onPress={pickAndSendFile}
					className='p-2 rounded-lg'
					style={{ backgroundColor: colors.cardHover }}
				>
					<Paperclip size={24} color={colors.textSecondary} />
				</TouchableOpacity>

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
								handleSubmit(handleSubmitMessage)()
							}}
							returnKeyType='send'
						/>
					)}
				/>

				{editId && (
					<TouchableOpacity
						onPress={() => setEditId(null)}
						className='p-2 rounded-lg'
						style={{ backgroundColor: colors.cardHover }}
					>
						<X size={20} color={colors.textSecondary} />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={handleSubmit(handleSubmitMessage)}
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

export default SecretSendMessageForm
