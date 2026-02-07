import React, { FC, useState } from 'react'
import { Text } from 'react-native'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { Button } from '@/components/ui/button/Button'

import ChatsItem from './ChatsItem'
import { FindAllChatsByGroupQuery } from '@/graphql/generated/output'

interface ChatDropdownTrigger {
	chat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
	deleteChat: (chatId: string) => void
	groupId: string
}

const ChatDropdownTrigger: FC<ChatDropdownTrigger> = ({
	deleteChat,
	chat,
	groupId
}) => {
	const [modalVisible, setModalVisible] = useState(false)

	const handleLongPress = () => setModalVisible(true)
	const handleDelete = () => {
		deleteChat(chat.id)
		setModalVisible(false)
	}

	return (
		<View>
			<ChatsItem
				groupId={groupId}
				chat={chat}
				handleLongPress={handleLongPress}
			/>

			<Modal
				transparent
				visible={modalVisible}
				animationType='fade'
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable
					className='flex-1 bg-foreground/30 justify-center items-center'
					onPress={() => setModalVisible(false)}
				>
					<View className='w-64 bg-foreground-dark rounded-xl p-4 shadow-lg'>
						<Text className='text-lg font-bold mb-3'>
							{chat.chatName}
						</Text>

						<Button
							variant='destructive'
							size='default'
							onPress={handleDelete}
							className='mb-2'
						>
							Удалить чат
						</Button>

						<Button
							variant='default'
							onPress={() => setModalVisible(false)}
						>
							Отмена
						</Button>
					</View>
				</Pressable>
			</Modal>
		</View>
	)
}

export default ChatDropdownTrigger
