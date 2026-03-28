import { Pencil, Pin, PinOff, Reply, Trash2, X } from 'lucide-react-native'
import React, { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ForwardMessageModal from '../list/ForwardMessageModal'

import {
	usePinMessageMutation,
	useUnPinMessageMutation
} from '@/graphql/generated/output'

interface ChatToolbarProp {
	messageIds?: string[]
	selectedMessages?: MessageType[]
	handleRemoveMessages: () => void
	handleClearMessagesId: () => void
	handleAddForwarded?: (messageIds: string[], initialText?: string) => void
	chatId: string
	selectedMessage?: MessageType | null
	pinnedMessageId?: string | null
	setPinnedMessage?: (message: MessageType | null) => void
	startEdit?: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	userId?: string
	canEditMessages?: boolean
	canPinMessages?: boolean
	groupId?: string | null
}

const ChatToolbar: FC<ChatToolbarProp> = ({
	handleAddForwarded,
	handleClearMessagesId,
	handleRemoveMessages,
	messageIds,
	selectedMessages,
	chatId,
	selectedMessage,
	pinnedMessageId,
	setPinnedMessage,
	startEdit,
	userId,
	canEditMessages = true,
	canPinMessages = true,
	groupId
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { bottom } = useSafeAreaInsets()
	const canForward = !!handleAddForwarded
	const canEditSelectedMessage =
		!!selectedMessage &&
		!!startEdit &&
		!!userId &&
		canEditMessages &&
		selectedMessage.user.id === userId
	const canPinSelectedMessage = !!selectedMessage && canPinMessages
	const isPinnedSelectedMessage = selectedMessage?.id === pinnedMessageId

	const [pinMessage] = usePinMessageMutation({
		onCompleted() {
			if (!selectedMessage) return
			setPinnedMessage?.(selectedMessage)
			handleClearMessagesId()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('pinError'),
				text2: error.message
			})
		}
	})

	const [unPinMessage] = useUnPinMessageMutation({
		onCompleted() {
			setPinnedMessage?.(null)
			handleClearMessagesId()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('unpinError'),
				text2: error.message
			})
		}
	})

	if (!messageIds || messageIds.length === 0) return null

	const handleEditMessage = () => {
		if (!selectedMessage || !startEdit) return
		const forwardedMessages =
			selectedMessage.repliedToLinks
				?.map(link => link?.repliedTo)
				.filter((msg): msg is ForwardedMessageType => !!msg) ?? []
		startEdit(selectedMessage, forwardedMessages)
		handleClearMessagesId()
	}

	const handleTogglePin = () => {
		if (!selectedMessage) return

		if (isPinnedSelectedMessage) {
			unPinMessage({ variables: { chatId } })
			return
		}

		pinMessage({
			variables: {
				chatId,
				messageId: selectedMessage.id
			}
		})
	}

	return (
		<View
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderTopWidth: 1,
				borderTopColor: colors.borderLight,
				paddingBottom: Math.max(bottom, 8) + 12,
				paddingTop: 8,
				paddingHorizontal: 8
			}}
		>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center'>
					<TouchableOpacity
						onPress={handleClearMessagesId}
						activeOpacity={0.6}
						className='w-10 h-10 rounded-full items-center justify-center mr-2'
						style={{ backgroundColor: colors.cardHover }}
					>
						<X size={20} color={colors.textSecondary} />
					</TouchableOpacity>
					<View className='flex-row items-center'>
						<View
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: colors.accent,
								marginRight: 8
							}}
						/>
						<Text
							className='text-sm font-semibold'
							style={{ color: colors.text }}
						>
							{messageIds.length} {t('selected')}
						</Text>
					</View>
				</View>

				<View className='flex-row items-center space-x-1'>
					{canEditSelectedMessage && (
						<TouchableOpacity
							onPress={handleEditMessage}
							activeOpacity={0.6}
							className='w-10 h-10 rounded-full items-center justify-center'
							style={{ backgroundColor: colors.cardHover }}
						>
							<Pencil size={20} color={colors.text} />
						</TouchableOpacity>
					)}

					{canPinSelectedMessage && (
						<TouchableOpacity
							onPress={handleTogglePin}
							activeOpacity={0.6}
							className='w-10 h-10 rounded-full items-center justify-center'
							style={{ backgroundColor: colors.cardHover }}
						>
							{isPinnedSelectedMessage ? (
								<PinOff size={20} color={colors.text} />
							) : (
								<Pin size={20} color={colors.text} />
							)}
						</TouchableOpacity>
					)}

					{canForward && (
						<>
							<TouchableOpacity
								onPress={() => handleAddForwarded(messageIds)}
								activeOpacity={0.6}
								className='w-10 h-10 rounded-full items-center justify-center'
								style={{ backgroundColor: colors.cardHover }}
							>
								<Reply size={20} color={colors.text} />
							</TouchableOpacity>

							<ForwardMessageModal
								handleAddForwarded={handleAddForwarded}
								handleClearMessagesId={handleClearMessagesId}
								chatId={chatId}
								messageIds={messageIds}
								selectedMessages={selectedMessages}
							/>
						</>
					)}
					<TouchableOpacity
						onPress={handleRemoveMessages}
						activeOpacity={0.6}
						className='w-10 h-10 rounded-full items-center justify-center'
						style={{ backgroundColor: colors.destructiveMuted }}
					>
						<Trash2 size={20} color={colors.destructive} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export default ChatToolbar
