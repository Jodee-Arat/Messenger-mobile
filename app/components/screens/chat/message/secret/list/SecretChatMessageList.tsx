import React, { FC, useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useEffect } from 'react'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatToolbar from '../toolbar/ChatToolbar'

import SecretChatMessageDropdownTrigger from './SecretChatMessageDropdownTrigger'

interface SecretChatMessageListProp {
	messages: MessageType[]
	chatId: string
	userId: string
	onDelete: (id: string[]) => Promise<void>
	canDeleteMessages?: boolean
	onRefresh?: () => Promise<void> | void
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
	canDeleteMessages = true,
	onRefresh,
	chatId,
	startEdit = () => {},
	handleAddForwardedMessage = () => {}
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [messageIds, setMessageIds] = useState<string[]>([])
	const [isDeleting, setIsDeleting] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)

	/** Удаление сообщений */
	const handleRemoveMessages = useCallback(async () => {
		if (messageIds.length === 0) return
		try {
			setIsDeleting(true)
			await onDelete(messageIds)
			setMessageIds([])
			Toast.show({
				type: 'success',
				text1: t('messagesDeletedSuccess')
			})
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: t('failedDeleteMessages'),
				text2: error?.message || t('somethingWentWrong')
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

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await Promise.resolve(onRefresh?.())
		} finally {
			setIsRefreshing(false)
		}
	}, [onRefresh])

	useEffect(() => {
		if (!canDeleteMessages && messageIds.length > 0) {
			setMessageIds([])
		}
	}, [canDeleteMessages, messageIds.length])

	if (isDeleting) {
		return (
			<View className='flex-1 justify-center items-center'>
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	const isSelectionMode = messageIds.length > 0

	return (
		<View className='flex-1'>
			{/* Список сообщений */}
			<FlatList
				data={messages}
				keyExtractor={item => item.id}
				contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
				refreshing={isRefreshing}
				onRefresh={handleRefresh}
				ListEmptyComponent={() => (
					<View className='py-4 items-center'>
						<Text style={{ color: colors.textSecondary }}>
							{t('empty')}
						</Text>
					</View>
				)}
				renderItem={({ item, index }) => {
					const isSelected = messageIds.includes(item.id)
					const prevItem = messages[index - 1] ?? null
					const nextItem = messages[index + 1] ?? null
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
							<SecretChatMessageDropdownTrigger
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
								isSelectionMode={isSelectionMode}
								onDelete={onDelete}
								isSelected={isSelected}
								isFirstInGroup={isFirstInGroup}
								isLastInGroup={isLastInGroup}
								canDeleteMessages={
									canDeleteMessages
								}
							/>
						</View>
					)
				}}
			/>

			{/* Панель управления сообщениями — снизу */}
			{canDeleteMessages && (
				<ChatToolbar
					chatId={chatId}
					messageIds={messageIds}
					handleRemoveMessages={handleRemoveMessages}
					handleClearMessagesId={handleClearMessagesId}
				/>
			)}
		</View>
	)
}

export default SecretChatMessageList
