import React, { FC, useCallback, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button/Button'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatMessageItem from './ChatMessageItem'
import {
	usePinMessageMutation,
	useRemoveMessagesMutation
} from '@/graphql/generated/output'

interface ChatMessageDropdownProp {
	messageInfo: MessageType
	setPinnedMessage: (message: MessageType | null) => void
	userId: string
	chatId: string
	messageId: string
	messageIds: string[]
	isSelected: boolean
	handleAddForwardedMessage: (messages: MessageType[]) => void
	handleChooseMessage: (messageId: string) => void
	handleClearMessagesId: () => void
	startEdit: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
}

const ChatMessageDropdownTrigger: FC<ChatMessageDropdownProp> = ({
	chatId,
	setPinnedMessage,
	startEdit,
	isSelected,
	handleAddForwardedMessage,
	handleClearMessagesId,
	handleChooseMessage,
	messageId,
	messageIds,
	messageInfo,
	userId
}) => {
	const [modalVisible, setModalVisible] = useState(false)

	const [removeMessage] = useRemoveMessagesMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: 'Messages deleted successfully.'
			})
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: 'Failed to delete messages',
				text2: err.message
			})
		}
	})

	const [pinMessage] = usePinMessageMutation({
		onCompleted() {
			setPinnedMessage(messageInfo)
			Toast.show({
				type: 'success',
				text1: 'Message pinned successfully.'
			})
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: 'Failed to pin message',
				text2: err.message
			})
		}
	})

	const handleRemoveMessage = useCallback(() => {
		removeMessage({
			variables: { chatId, data: { messageIds: [messageId] } }
		})
		setModalVisible(false)
	}, [chatId, removeMessage])

	const handleAddMessage = useCallback(() => {
		handleAddForwardedMessage([messageInfo])
		handleClearMessagesId()
		setModalVisible(false)
	}, [chatId])

	return (
		<>
			<Pressable
				onLongPress={() => setModalVisible(true)}
				delayLongPress={300}
			>
				<ChatMessageItem
					isSelected={isSelected}
					chatId={chatId}
					handleChooseMessage={handleChooseMessage}
					messageId={messageId}
					messageIds={messageIds}
					messageInfo={messageInfo}
					userId={userId}
				/>
			</Pressable>

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
								Выбрать
							</Button>

							<Button
								onPress={() => {
									handleAddMessage()
								}}
							>
								Ответить
							</Button>

							<Button
								onPress={() => {
									if (messageInfo.text)
										Toast.show({
											type: 'info',
											text1: 'Copied text',
											text2: messageInfo.text
										})
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

							<Button
								onPress={() => {
									pinMessage({
										variables: {
											chatId,
											messageId: messageInfo.id
										}
									})
									setModalVisible(false)
								}}
							>
								Закрепить
							</Button>

							<Button
								variant='destructive'
								onPress={handleRemoveMessage}
							>
								Удалить
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

export default ChatMessageDropdownTrigger
