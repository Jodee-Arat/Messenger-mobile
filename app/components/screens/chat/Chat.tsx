import { useRoute } from '@react-navigation/native'
import { Settings2 } from 'lucide-react-native'
import React from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	Text,
	View
} from 'react-native'

import { Button } from '@/components/ui/button/Button'

import { useChat } from '@/hooks/useChat'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import ChatMessageList from './message/list/ChatMessageList'
import MessageFileList from './message/list/file/MessageFileList'
import SendMessageForm from './message/send/SendMessageForm'

type RouteParams = {
	chatId: string
	chatName: string
}

const Chat = () => {
	const route = useRoute()
	const { chatId, chatName } = route.params as RouteParams
	const { isLoadingProfile, user } = useCurrentUser()

	const navigation = useTypedNavigation()

	const {
		filesEdited,
		setFilesEdited,
		pinnedMessage,
		setPinnedMessage,
		isLoadingFindChat,
		startEdit,
		handleAddForwardedMessage,
		handleClearForm,
		setForwardedMessages,
		draftText,
		pickAndSendFile,
		forwardedMessages,
		handleDelete,
		files,
		isLoadingSendFile,
		handleClearMessageId,
		editId,
		setEditId,
		chat
	} = useChat(chatId)

	if (isLoadingFindChat || isLoadingProfile || !user || !chat) {
		return (
			<SafeAreaView className='flex-1 justify-center items-center bg-white'>
				<ActivityIndicator size='large' />
			</SafeAreaView>
		)
	}

	const goToSettings = () => {
		navigation.navigate('ChatSettings', { chatId })
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

				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					className='flex-1'
					keyboardVerticalOffset={Platform.select({
						ios: 90,
						android: 80
					})}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						<ChatMessageList
							pinnedMessage={pinnedMessage}
							setPinnedMessage={setPinnedMessage}
							chatId={chatId}
							startEdit={startEdit}
							userId={user!.id}
							handleAddForwardedMessage={
								handleAddForwardedMessage
							}
						/>

						<SendMessageForm
							pickAndSendFile={pickAndSendFile}
							handleClearForm={handleClearForm}
							setForwardedMessages={setForwardedMessages}
							draftText={draftText}
							forwardedMessages={forwardedMessages}
							onDeleteFile={handleDelete}
							files={files}
							isLoadingSendFiles={isLoadingSendFile}
							chatId={chatId}
							clearMessageId={handleClearMessageId}
							editId={editId}
							setEditId={setEditId}
							filesEdited={filesEdited}
							setFilesEdited={setFilesEdited}
						/>
					</View>
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}

export default Chat
