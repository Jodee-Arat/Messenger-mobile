import React, { FC } from 'react'
import {
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { createSecretChat } from '@/utils/secret-chat/secretChat'

import { FindAllChatsByGroupQuery } from '@/graphql/generated/output'

interface ChatsItemProps {
	chat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
	handleLongPress?: () => void
	groupId: string
}

const ChatsItem: FC<ChatsItemProps> = ({ chat, handleLongPress, groupId }) => {
	const navigation = useTypedNavigation()
	const handlePress = () => {
		navigation.navigate('Chat', {
			chatId: chat.id,
			chatName: chat.chatName!,
			isSecret: chat.isSecret,
			groupId: groupId
		})
	}
	if (chat.isSecret) {
		createSecretChat(chat)
	}

	return (
		<Pressable
			onLongPress={handleLongPress}
			delayLongPress={300}
			className='w-full'
			onPress={handlePress}
		>
			<View className='w-full h-12 my-1.5 px-3 flex-row items-center rounded-sm shadow bg-white '>
				<EntityAvatar name={chat.chatName} avatarUrl={chat.avatarUrl} />
				<Text className='ml-3 text-lg font-medium text-foreground'>
					{chat.chatName}
				</Text>
				<View>
					{chat.draftMessages &&
					chat.draftMessages.length > 0 &&
					chat.draftMessages[0]?.text ? (
						<Text className='text-xs text-red-500'>
							{chat.draftMessages[0]?.text}
						</Text>
					) : chat.draftMessages &&
					  chat.draftMessages.length > 0 &&
					  chat.draftMessages[0].files?.length &&
					  chat.draftMessages[0].files.length > 0 ? (
						<Text className='text-xs text-blue-400'>
							{chat.draftMessages[0].files.length} файл(ов)
						</Text>
					) : chat.lastMessage && chat.lastMessage?.text ? (
						<View className='flex items-center space-x-2'>
							<Text className='text-primary-foreground/80'>
								{chat.lastMessage.user.username}
							</Text>
							<Text className='text-muted-foreground text-xs'>
								{chat.lastMessage?.text}
							</Text>
						</View>
					) : chat.lastMessage &&
					  chat.lastMessage.files?.length &&
					  chat.lastMessage.files.length > 0 ? (
						<View className='flex items-center space-x-2'>
							<Text className='text-primary-foreground/80'>
								{chat.lastMessage.user.username}
							</Text>
							<Text className='text-xs text-blue-400'>
								{chat.lastMessage.files.length} файл(ов)
							</Text>
						</View>
					) : (
						<Text className='text-muted-foreground text-xs'>
							Пусто
						</Text>
					)}
				</View>
			</View>
		</Pressable>
	)
}

export default ChatsItem
