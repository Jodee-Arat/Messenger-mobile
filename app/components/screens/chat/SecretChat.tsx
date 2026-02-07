import { Settings2 } from 'lucide-react-native'
import React, { FC } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	Text,
	View
} from 'react-native'

import { Button } from '@/components/ui/button/Button'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useSecretChat } from '@/hooks/useSecretChat'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import SecretChatMessageList from './message/secret/list/SecretChatMessageList'
import SecretSendMessageForm from './message/secret/send/SecretSendMessageForm'

type SecretChatProps = {
	chatId: string
	chatName: string
	groupId: string
	isSecret: boolean
}

const SecretChat: FC<SecretChatProps> = ({
	chatId,
	chatName,
	groupId,
	isSecret
}) => {
	const { isLoadingProfile, user } = useCurrentUser()
	const { userId } = useUser()
	const navigation = useTypedNavigation()

	const {
		chat,
		clearForm,
		deleteMessage,
		draftText,
		files,
		messages,
		loadingMessage,
		pickFile,
		reload,
		sendMessage,
		errorMessage,
		setDraftText
	} = useSecretChat(groupId, chatId, userId)

	if (errorMessage !== '') {
		return (
			<SafeAreaView className='flex-1 justify-center items-center bg-white'>
				<Text className='text-black'>{errorMessage}</Text>
			</SafeAreaView>
		)
	}

	if (loadingMessage !== '' || isLoadingProfile || !user || !chat) {
		return (
			<SafeAreaView className='flex-1 justify-center items-center bg-white'>
				<Text className='text-black'>{loadingMessage}</Text>
				<ActivityIndicator size='large' />
			</SafeAreaView>
		)
	}

	const goToSettings = () => {
		navigation.navigate('ChatSettings', { chatId })
	}

	const handleSend = async () => {
		sendMessage(draftText, user)
	}

	return (
		<SafeAreaView className='flex-1 bg-white'>
			<View className='flex-1 m-3 rounded-2xl bg-white shadow-md overflow-hidden'>
				{/* Header */}
				<View className='h-14 border-b border-gray-200 px-4 flex-row items-center justify-between'>
					<Text className='text-lg font-semibold'>{chatName}</Text>
					<View className='flex-row items-center'>
						<Button size='icon' onPress={goToSettings}>
							<Settings2 className='text-black' />
						</Button>
					</View>
				</View>

				{/* Messages */}
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					className='flex-1'
					keyboardVerticalOffset={Platform.select({
						ios: 90,
						android: 80
					})}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						{/* Список сообщений */}
						<SecretChatMessageList
							messages={messages}
							userId={user.id}
							onDelete={deleteMessage}
							chatId={chatId}
						/>

						{/* Форма отправки */}
						<SecretSendMessageForm
							setDraftText={setDraftText}
							chatId={chatId}
							draftText={draftText}
							setEditId={() => {}} // пока редактирование не используется
							editId={null}
							files={files}
							filesEdited={[]} // если пока нет редактированных файлов
							setFilesEdited={() => {}}
							pickAndSendFile={pickFile}
							onDeleteFile={(id: string) => {
								// удаляем файл из массива
								clearForm() // или своя логика
								console.log('Deleted file', id)
							}}
							clearMessageId={clearForm}
							forwardedMessages={[]} // пока нет пересланных сообщений
							setForwardedMessages={() => {}}
							handleClearForm={clearForm}
							onSend={handleSend} // используем твою локальную функцию
						/>
					</View>
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}

export default SecretChat
