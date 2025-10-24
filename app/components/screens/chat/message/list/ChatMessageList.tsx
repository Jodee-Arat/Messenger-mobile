import React, { FC, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatToolbar from '../toolbar/ChatToolbar'

import ChatMessageDropdownTrigger from './ChatMessageDropdownTrigger'
import PinnedMessage from './PinnedMessage'
import MessageFileList from './file/MessageFileList'
import {
	useChatMessageAddedSubscription,
	useChatMessageRemovedSubscription,
	useFindAllMessagesByChatQuery,
	useRemoveMessagesMutation
} from '@/graphql/generated/output'

interface ChatMessageListProp {
	pinnedMessage: MessageType | null
	setPinnedMessage: (message: MessageType | null) => void
	chatId: string
	userId: string
	startEdit: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	handleAddForwardedMessage: (messages: MessageType[]) => void
}

const ChatMessageList: FC<ChatMessageListProp> = ({
	chatId,
	pinnedMessage,
	setPinnedMessage,
	startEdit,
	userId,
	handleAddForwardedMessage
}) => {
	const [messageIds, setMessageIds] = useState<string[]>([])
	const [messagesInfo, setMessagesInfo] = useState<MessageType[]>([])

	const { data: allMessagesData, loading: isLoadingFindAllMessages } =
		useFindAllMessagesByChatQuery({
			variables: {
				chatId,
				filters: {}
			},
			fetchPolicy: 'network-only'
		})

	const { data: newMessageData } = useChatMessageAddedSubscription({
		variables: {
			chatId,
			userId
		}
	})

	const { data: removedMessagesData } = useChatMessageRemovedSubscription({
		variables: {
			chatId,
			userId
		}
	})

	const [removeMessages] = useRemoveMessagesMutation({
		onCompleted() {
			setMessageIds([])
			Toast.show({
				type: 'success',
				text1: ' Message delete successfully.'
			})
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Failed to delete messages.',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const handleRemoveMessages = useCallback(() => {
		if (messageIds.length === 0) return
		removeMessages({
			variables: {
				chatId: chatId,
				data: {
					messageIds: messageIds
				}
			}
		})
	}, [messageIds, chatId, removeMessages])

	const handleClearMessagesId = useCallback(() => {
		setMessageIds([])
	}, [])

	const handleChooseMessage = useCallback((messageId: string) => {
		setMessageIds(prev =>
			prev.includes(messageId)
				? prev.filter(id => id !== messageId)
				: [...prev, messageId]
		)
	}, [])

	const handleAddForwarded = useCallback(
		(ids: string[], reply = true) => {
			const messages = messagesInfo.filter(m => ids.includes(m.id))
			handleAddForwardedMessage(messages)
			setMessageIds([])
		},
		[messagesInfo, handleAddForwardedMessage]
	)

	useEffect(() => {
		if (!allMessagesData || !allMessagesData.findAllMessagesByChat) return
		setMessagesInfo(allMessagesData.findAllMessagesByChat)
	}, [allMessagesData])

	useEffect(() => {
		if (!newMessageData || !newMessageData.chatMessageAdded) return
		const newMessage = newMessageData.chatMessageAdded

		setMessagesInfo(prev => {
			if (newMessage.isEdited) {
				return prev.map(message =>
					message.id === newMessage.id ? newMessage : message
				)
			}
			return [...prev, newMessage]
		})
	}, [newMessageData])

	useEffect(() => {
		if (!removedMessagesData || !removedMessagesData.chatMessageRemoved)
			return

		const removedMessagesId = removedMessagesData.chatMessageRemoved
		const removedIds = removedMessagesId.map(m => m.id)

		setMessagesInfo(prev =>
			prev
				.filter(message => !removedIds.includes(message.id))
				.map(message => {
					const cleanedLinks =
						message.repliedToLinks?.filter(link => {
							return (
								link?.repliedTo &&
								!removedIds.includes(link.repliedTo.id)
							)
						}) ?? []

					return {
						...message,
						repliedToLinks:
							cleanedLinks.length > 0 ? cleanedLinks : null
					}
				})
		)
	}, [removedMessagesData])

	if (isLoadingFindAllMessages) {
		return (
			<View className='flex-1 justify-center items-center'>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	// FlatList expects newest messages to be at the end if inverted={true}
	// messagesInfo is assumed chronological (oldest first).
	return (
		<View className='flex-1'>
			<ChatToolbar
				chatId={chatId}
				messageIds={messageIds}
				handleRemoveMessages={handleRemoveMessages}
				handleClearMessagesId={handleClearMessagesId}
				handleAddForwarded={handleAddForwarded}
			/>

			<PinnedMessage
				chatId={chatId}
				pinnedMessage={pinnedMessage}
				setPinnedMessage={setPinnedMessage}
			/>

			<FlatList
				data={messagesInfo}
				keyExtractor={item => item.id}
				inverted={false}
				contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
				ListEmptyComponent={() => (
					<View className='py-4 items-center'>
						<Text>Пусто</Text>
					</View>
				)}
				renderItem={({ item, index }) => (
					<View className='mb-2'>
						<ChatMessageDropdownTrigger
							startEdit={startEdit}
							handleAddForwardedMessage={
								handleAddForwardedMessage
							}
							handleClearMessagesId={handleClearMessagesId}
							handleChooseMessage={handleChooseMessage}
							messageInfo={item}
							userId={userId}
							key={item.id}
							messageId={item.id}
							messageIds={messageIds}
							chatId={chatId}
							setPinnedMessage={setPinnedMessage}
						/>
					</View>
				)}
			/>
		</View>
	)
}

export default ChatMessageList
