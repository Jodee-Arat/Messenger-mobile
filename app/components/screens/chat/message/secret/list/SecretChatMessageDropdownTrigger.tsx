import React, { FC, useCallback, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button/Button'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatMessageItem from '../../default/list/ChatMessageItem'

interface SecretChatMessageDropdownProp {
	messageInfo: MessageType
	setPinnedMessage?: (message: MessageType | null) => void
	userId: string
	messageId: string
	chatId: string
	messageIds: string[]
	handleAddForwardedMessage?: (messages: MessageType[]) => void
	handleChooseMessage: (messageId: string) => void
	handleClearMessagesId: () => void
	startEdit?: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	onDelete: (id: string[]) => Promise<void>
	isSelected: boolean // 🔹 Новый проп
}

const SecretChatMessageDropdownTrigger: FC<SecretChatMessageDropdownProp> = ({
	setPinnedMessage = () => {},
	chatId,
	startEdit = () => {},
	handleAddForwardedMessage = () => {},
	handleClearMessagesId,
	handleChooseMessage,
	messageId,
	messageIds,
	messageInfo,
	userId,
	onDelete,
	isSelected // 🔹 Получаем новый проп
}) => {
	const [modalVisible, setModalVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	/** Удалить сообщение */
	const handleRemoveMessage = useCallback(async () => {
		try {
			setIsDeleting(true)
			await onDelete(messageIds)
			Toast.show({
				type: 'success',
				text1: 'Сообщение удалено'
			})
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: 'Ошибка при удалении сообщения',
				text2: err.message || 'Попробуйте снова'
			})
		} finally {
			setIsDeleting(false)
			setModalVisible(false)
		}
	}, [onDelete, messageIds])

	/** Добавить как ответ / переслать */
	const handleAddMessage = useCallback(() => {
		handleAddForwardedMessage([messageInfo])
		handleClearMessagesId()
		setModalVisible(false)
	}, [messageInfo, handleAddForwardedMessage, handleClearMessagesId])

	/** Закрепить сообщение */
	const handlePinMessage = useCallback(() => {
		setPinnedMessage(messageInfo)
		Toast.show({
			type: 'success',
			text1: 'Сообщение закреплено'
		})
		setModalVisible(false)
	}, [messageInfo, setPinnedMessage])

	return (
		<>
			<Pressable
				onLongPress={() => setModalVisible(true)}
				delayLongPress={300}
			>
				<View
					className={`rounded-xl ${
						isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''
					}`}
				>
					<ChatMessageItem
						chatId={chatId}
						handleChooseMessage={handleChooseMessage}
						messageId={messageId}
						messageIds={messageIds}
						messageInfo={messageInfo}
						userId={userId}
						isSelected={isSelected} // 🔹 передаём вниз
					/>
				</View>
			</Pressable>

			{/* Модалка действий */}
			<Modal
				transparent
				visible={modalVisible}
				animationType='fade'
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable
					className='flex-1 bg-black/30 justify-center items-center'
					onPress={() => setModalVisible(false)}
				>
					<View className='w-72 bg-white rounded-xl p-4 shadow-lg'>
						<Text className='text-lg font-bold mb-3 text-center'>
							Действия с сообщением
						</Text>

						<View className='space-y-2'>
							<Button
								onPress={() => {
									handleChooseMessage(messageId)
									setModalVisible(false)
								}}
							>
								{isSelected ? 'Отменить выбор' : 'Выбрать'}
							</Button>

							<Button onPress={handleAddMessage}>Ответить</Button>

							<Button
								onPress={() => {
									if (messageInfo.text) {
										Toast.show({
											type: 'info',
											text1: 'Скопировано',
											text2: messageInfo.text
										})
									}
									setModalVisible(false)
								}}
							>
								Копировать
							</Button>

							<Button
								onPress={() => {
									startEdit(
										messageInfo,
										messageInfo?.repliedToLinks
											?.map(link => link?.repliedTo)
											.filter(
												(
													msg
												): msg is ForwardedMessageType =>
													!!msg
											) ?? []
									)
									setModalVisible(false)
								}}
							>
								Редактировать
							</Button>

							<Button onPress={handlePinMessage}>
								Закрепить
							</Button>

							<Button
								variant='destructive'
								onPress={handleRemoveMessage}
								disabled={isDeleting}
							>
								{isDeleting ? 'Удаление...' : 'Удалить'}
							</Button>

							<Button
								variant='default'
								onPress={() => setModalVisible(false)}
							>
								Отмена
							</Button>
						</View>
					</View>
				</Pressable>
			</Modal>
		</>
	)
}

export default SecretChatMessageDropdownTrigger
