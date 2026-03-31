import React, { FC, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatToolbar from '../toolbar/ChatToolbar'

import ChatMessageDropdownTrigger from './ChatMessageDropdownTrigger'
import PinnedMessage from './PinnedMessage'
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
	handleAddForwardedMessage: (
		messages: MessageType[],
		initialText?: string
	) => void
	canSendMessages?: boolean
	canEditMessages?: boolean
	canDeleteMessages?: boolean
	canPinMessages?: boolean
	groupId?: string | null
	onRefresh?: () => Promise<void> | void
}

const ChatMessageList: FC<ChatMessageListProp> = ({
	chatId,
	pinnedMessage,
	setPinnedMessage,
	startEdit,
	userId,
	handleAddForwardedMessage,
	canSendMessages = true,
	canEditMessages = true,
	canDeleteMessages = true,
	canPinMessages = true,
	groupId,
	onRefresh
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [messageIds, setMessageIds] = useState<string[]>([])
	const [messagesInfo, setMessagesInfo] = useState<MessageType[]>([])
	const [isRefreshingMessages, setIsRefreshingMessages] = useState(false)

	const {
		data: allMessagesData,
		loading: isLoadingFindAllMessages,
		refetch: refetchMessages
	} = useFindAllMessagesByChatQuery({
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
		(ids: string[], initialText?: string) => {
			const messages = messagesInfo.filter(m => ids.includes(m.id))
			handleAddForwardedMessage(messages, initialText)
			setMessageIds([])
		},
		[messagesInfo, handleAddForwardedMessage]
	)

	const handleRefreshMessages = useCallback(async () => {
		try {
			setIsRefreshingMessages(true)
			await Promise.allSettled([
				refetchMessages(),
				Promise.resolve(onRefresh?.())
			])
		} finally {
			setIsRefreshingMessages(false)
		}
	}, [onRefresh, refetchMessages])

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

	const selectedMessages = messagesInfo.filter(message =>
		messageIds.includes(message.id)
	)
	const isSelectionMode = messageIds.length > 0
	const selectedMessage =
		selectedMessages.length === 1 ? selectedMessages[0] : null

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
				refreshing={isRefreshingMessages}
				onRefresh={handleRefreshMessages}
				ListEmptyComponent={() => (
					<View className='py-4 items-center'>
						<Text style={{ color: colors.textSecondary }}>
							{t('empty')}
						</Text>
					</View>
				)}
				renderItem={({ item, index }) => {
					const isSelected = messageIds.includes(item.id)
					const prevItem = messagesInfo[index - 1] ?? null
					const nextItem = messagesInfo[index + 1] ?? null
					const isFirstInGroup =
						!prevItem || prevItem.user.id !== item.user.id
					const isLastInGroup =
						!nextItem || nextItem.user.id !== item.user.id

					if (item.isStarted) {
						return (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									paddingHorizontal: 24,
									paddingVertical: 10
								}}
							>
								<View
									style={{
										flex: 1,
										height: 1,
										backgroundColor: colors.border
									}}
								/>
								<Text
									style={{
										color: colors.textMuted,
										fontSize: 12,
										marginHorizontal: 12
									}}
								>
									{item.text}
								</Text>
								<View
									style={{
										flex: 1,
										height: 1,
										backgroundColor: colors.border
									}}
								/>
							</View>
						)
					}

					return (
						<View style={{ marginBottom: isLastInGroup ? 8 : 2 }}>
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
								isSelectionMode={isSelectionMode}
								chatId={chatId}
								isSelected={isSelected}
								setPinnedMessage={setPinnedMessage}
								pinnedMessageId={pinnedMessage?.id ?? null}
								canSendMessages={canSendMessages}
								canEditMessages={canEditMessages}
								canDeleteMessages={canDeleteMessages}
								canPinMessages={canPinMessages}
								isFirstInGroup={isFirstInGroup}
								isLastInGroup={isLastInGroup}
							/>
						</View>
					)
				}}
			/>

			<ChatToolbar
				chatId={chatId}
				messageIds={messageIds}
				selectedMessages={selectedMessages}
				handleRemoveMessages={handleRemoveMessages}
				handleClearMessagesId={handleClearMessagesId}
				handleAddForwarded={
					canSendMessages ? handleAddForwarded : undefined
				}
				selectedMessage={selectedMessage}
				pinnedMessageId={pinnedMessage?.id ?? null}
				setPinnedMessage={setPinnedMessage}
				startEdit={startEdit}
				userId={userId}
				groupId={groupId}
				canEditMessages={canEditMessages}
				canPinMessages={canPinMessages}
			/>
		</View>
	)
}

export default ChatMessageList
