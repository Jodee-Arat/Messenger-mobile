import { Paperclip, SendHorizonal, X } from 'lucide-react-native'
import React, { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native'

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
	onSend: (text: string) => void // получает текст и отправляет сообщение
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
	const { control, handleSubmit, watch, reset } = useForm<FormValues>({
		defaultValues: { text: draftText ?? '' }
	})

	const canSendMessage =
		(watch('text')?.trim() ?? '') !== '' || files.length > 0

	// синхронизация draftText с полем ввода
	useEffect(() => {
		reset({ text: draftText })
	}, [draftText])

	// функция отправки
	const handleSubmitMessage = (data: FormValues) => {
		const text = data.text?.trim() ?? ''

		if (!text && files.length === 0 && forwardedMessages.length === 0) {
			// ничего не отправлять
			return
		}

		onSend(text) // вызываем родительскую функцию с текстом
		reset({ text: '' }) // очищаем форму после отправки
		handleClearForm() // чистим файлы и пересланные сообщения
	}

	return (
		<View className='flex-col'>
			{/* Список файлов */}
			{(files.length > 0 || filesEdited.length > 0) && (
				<FileList
					files={files}
					filesEdited={filesEdited}
					onDeleteFile={onDeleteFile}
					isLoadingSend={false}
				/>
			)}

			{/* Пересланные сообщения */}
			{forwardedMessages && forwardedMessages.length > 0 && (
				<ForwardedMessagesBar
					forwardedMessages={forwardedMessages}
					setForwardedMessages={setForwardedMessages}
				/>
			)}

			{/* Поле ввода и кнопки */}
			<View className='flex-row items-center mt-3 space-x-2'>
				{/* Кнопка выбора файла */}
				<TouchableOpacity
					onPress={pickAndSendFile}
					className='p-2 bg-gray-200 rounded-md'
				>
					<Paperclip size={24} color='#000' />
				</TouchableOpacity>

				{/* Текстовое поле */}
				<Controller
					control={control}
					name='text'
					render={({ field }) => (
						<TextInput
							value={draftText}
							onChangeText={text => setDraftText(text)}
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
								handleSubmit(handleSubmitMessage)()
							}}
							returnKeyType='send'
						/>
					)}
				/>

				{/* Кнопка отмены редактирования */}
				{editId && (
					<TouchableOpacity
						onPress={() => setEditId(null)}
						className='p-2 bg-gray-300 rounded-md'
					>
						<X size={20} color='#000' />
					</TouchableOpacity>
				)}

				{/* Кнопка отправки */}
				<TouchableOpacity
					onPress={handleSubmit(handleSubmitMessage)}
					disabled={!canSendMessage}
					className={`p-2 rounded-md ${
						canSendMessage ? 'bg-blue-500' : 'bg-gray-300'
					}`}
				>
					<SendHorizonal size={24} color='#fff' />
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default SecretSendMessageForm
