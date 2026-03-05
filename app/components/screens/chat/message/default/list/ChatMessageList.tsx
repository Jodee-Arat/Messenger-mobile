import React, { FC, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

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
	groupId: string
	userId: string
	startEdit: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	handleAddForwardedMessage: (messages: MessageType[]) => void
	canEditMessages?: boolean
	canDeleteMessages?: boolean
	canPinMessages?: boolean
}

const ChatMessageList: FC<ChatMessageListProp> = ({
	chatId,
	groupId,
	pinnedMessage,
	setPinnedMessage,
	startEdit,
	userId,
	handleAddForwardedMessage,
	canEditMessages = true,
	canDeleteMessages = true,
	canPinMessages = true
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
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
				text1: t('messageDeleteSuccess')
			})
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('failedDeleteMessages'),
				text2: error.message || t('somethingWentWrong')
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
			// Дедупликация при переподключении WebSocket
			if (prev.some(m => m.id === newMessage.id)) return prev
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
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	return (
		<View className='flex-1'>
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
						<Text style={{ color: colors.textSecondary }}>
							{t('empty')}
						</Text>
					</View>
				)}
				renderItem={({ item, index }) => {
					const isSelected = messageIds.includes(item.id)
					return (
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
								isSelected={isSelected}
								setPinnedMessage={setPinnedMessage}
								canEditMessages={canEditMessages}
								canDeleteMessages={canDeleteMessages}
								canPinMessages={canPinMessages}
							/>
							{item.files && item.files.length > 0 && (
								<MessageFileList
									chatId={chatId}
									files={item.files}
									isSelected={isSelected}
								/>
							)}
						</View>
					)
				}}
			/>

			<ChatToolbar
				chatId={chatId}
				groupId={groupId}
				messageIds={messageIds}
				handleRemoveMessages={handleRemoveMessages}
				handleClearMessagesId={handleClearMessagesId}
				handleAddForwarded={handleAddForwarded}
			/>
		</View>
	)
}

export default ChatMessageList
