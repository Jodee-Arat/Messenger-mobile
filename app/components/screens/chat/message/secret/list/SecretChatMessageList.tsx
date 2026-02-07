import React, { FC, useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatToolbar from '../toolbar/ChatToolbar'

import PinnedMessage from './PinnedMessage'
import ChatMessageDropdownTrigger from './SecretChatMessageDropdownTrigger'
import SecretChatMessageDropdownTrigger from './SecretChatMessageDropdownTrigger'
import MessageFileList from './file/MessageFileList'

interface SecretChatMessageListProp {
	messages: MessageType[]
	chatId: string
	userId: string
	onDelete: (id: string[]) => Promise<void>
	pinnedMessage?: MessageType | null
	setPinnedMessage?: (message: MessageType | null) => void
	startEdit?: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	handleAddForwardedMessage?: (messages: MessageType[]) => void
}

const SecretChatMessageList: FC<SecretChatMessageListProp> = ({
	messages,
	userId,
	onDelete,
	chatId,
	pinnedMessage = null,
	setPinnedMessage = () => {},
	startEdit = () => {},
	handleAddForwardedMessage = () => {}
}) => {
	const [messageIds, setMessageIds] = useState<string[]>([])
	const [isDeleting, setIsDeleting] = useState(false)

	/** Удаление сообщений */
	const handleRemoveMessages = useCallback(async () => {
		if (messageIds.length === 0) return
		try {
			setIsDeleting(true)
				await onDelete(messageIds)
			setMessageIds([])
			Toast.show({
				type: 'success',
				text1: 'Сообщения удалены успешно'
			})
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Ошибка при удалении сообщений',
				text2: error?.message || 'Что-то пошло не так'
			})
		} finally {
			setIsDeleting(false)
		}
	}, [messageIds, onDelete])

	/** Очистка выбранных сообщений */
	const handleClearMessagesId = useCallback(() => {
		setMessageIds([])
	}, [])

	/** Выбор сообщений */
	const handleChooseMessage = useCallback((messageId: string) => {
		setMessageIds(prev =>
			prev.includes(messageId)
				? prev.filter(id => id !== messageId)
				: [...prev, messageId]
		)
	}, [])

	/** Добавление пересланных сообщений */
	const handleAddForwarded = useCallback(
		(ids: string[]) => {
			const selectedMessages = messages.filter(m => ids.includes(m.id))
			handleAddForwardedMessage(selectedMessages)
			setMessageIds([])
		},
		[messages, handleAddForwardedMessage]
	)

	if (isDeleting) {
		return (
			<View className='flex-1 justify-center items-center'>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	return (
		<View className='flex-1'>
			{/* Панель управления сообщениями */}
			<ChatToolbar
				chatId={chatId}
				messageIds={messageIds}
				handleRemoveMessages={handleRemoveMessages}
				handleClearMessagesId={handleClearMessagesId}
				handleAddForwarded={handleAddForwarded}
			/>

			{/* Прикреплённое сообщение */}
			{pinnedMessage && (
				<PinnedMessage
					chatId={chatId}
					pinnedMessage={pinnedMessage}
					setPinnedMessage={setPinnedMessage}
				/>
			)}

			{/* Список сообщений */}
			<FlatList
				data={messages}
				keyExtractor={item => item.id}
				contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
				ListEmptyComponent={() => (
					<View className='py-4 items-center'>
						<Text>Пусто</Text>
					</View>
				)}
				renderItem={({ item }) => {
					const isSelected = messageIds.includes(item.id)
					return (
						<View className='mb-2'>
							<SecretChatMessageDropdownTrigger
								startEdit={startEdit}
								handleAddForwardedMessage={
									handleAddForwardedMessage
								}
								handleClearMessagesId={handleClearMessagesId}
								handleChooseMessage={handleChooseMessage}
								messageInfo={item}
								userId={userId}
								key={item.id}
								chatId={chatId}
								messageId={item.id}
								messageIds={messageIds}
								setPinnedMessage={setPinnedMessage}
								onDelete={onDelete}
								isSelected={isSelected}
							/>
							{item.files && item.files.length > 0 && (
								<MessageFileList
									files={item.files}
									chatId={chatId}
									isSelected={isSelected}
								/>
							)}
						</View>
					)
				}}
			/>
		</View>
	)
}

export default SecretChatMessageList
