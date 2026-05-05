import * as ExpoClipboard from 'expo-clipboard'
import {
	CheckCircle,
	Clipboard,
	Pencil,
	Pin,
	PinOff,
	Reply,
	Trash2,
	X
} from 'lucide-react-native'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import {
	Animated,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import AppModal from '@/components/ui/AppModal'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import ChatMessageItem from './ChatMessageItem'
import {
	usePinMessageMutation,
	useRemoveMessagesMutation,
	useUnPinMessageMutation
} from '@/graphql/generated/output'

interface ChatMessageDropdownProp {
	messageInfo: MessageType
	setPinnedMessage: (message: MessageType | null) => void
	userId: string
	chatId: string
	messageId: string
	messageIds: string[]
	isSelectionMode: boolean
	isSelected: boolean
	handleAddForwardedMessage: (messages: MessageType[]) => void
	handleChooseMessage: (messageId: string) => void
	handleClearMessagesId: () => void
	startEdit: (
		message: MessageType,
		forwardedMessages?: ForwardedMessageType[]
	) => void
	pinnedMessageId?: string | null
	canSendMessages?: boolean
	canEditMessages?: boolean
	canDeleteMessages?: boolean
	canPinMessages?: boolean
	isFirstInGroup: boolean
	isLastInGroup: boolean
	showSenderName?: boolean
}

const ChatMessageDropdownTrigger: FC<ChatMessageDropdownProp> = ({
	chatId,
	setPinnedMessage,
	startEdit,
	isSelectionMode,
	isSelected,
	handleAddForwardedMessage,
	handleClearMessagesId,
	handleChooseMessage,
	messageId,
	messageIds,
	messageInfo,
	pinnedMessageId,
	userId,
	canSendMessages = true,
	canEditMessages = true,
	canDeleteMessages = true,
	canPinMessages = true,
	isFirstInGroup,
	isLastInGroup,
	showSenderName = true
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [modalVisible, setModalVisible] = useState(false)
	const { height: windowHeight } = useWindowDimensions()
	const slideAnim = useRef(new Animated.Value(windowHeight)).current
	const backdropOpacity = useRef(new Animated.Value(0)).current

	useEffect(() => {
		return () => {
			slideAnim.stopAnimation()
			backdropOpacity.stopAnimation()
		}
	}, [])

	const isPinnedMessage = pinnedMessageId === messageInfo.id
	const canEditThisMessage = canEditMessages && messageInfo.user.id === userId

	const openSheet = () => {
		slideAnim.setValue(windowHeight)
		setModalVisible(true)
		Animated.parallel([
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}),
			Animated.timing(backdropOpacity, {
				toValue: 1,
				duration: 250,
				useNativeDriver: true
			})
		]).start()
	}

	const closeSheet = (cb?: () => void) => {
		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: windowHeight,
				duration: 200,
				useNativeDriver: true
			}),
			Animated.timing(backdropOpacity, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true
			})
		]).start(() => {
			setModalVisible(false)
			cb?.()
		})
	}

	const [removeMessage] = useRemoveMessagesMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: t('messageDeleted')
			})
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('deleteError'),
				text2: err.message
			})
		}
	})

	const [pinMessage] = usePinMessageMutation({
		onCompleted() {
			setPinnedMessage(messageInfo)
			Toast.show({
				type: 'success',
				text1: t('messagePinned')
			})
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('pinError'),
				text2: err.message
			})
		}
	})

	const [unPinMessage] = useUnPinMessageMutation({
		onCompleted() {
			setPinnedMessage(null)
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('unpinError'),
				text2: err.message
			})
		}
	})

	const handleRemoveMessage = useCallback(() => {
		removeMessage({
			variables: { chatId, data: { messageIds: [messageId] } }
		})
		closeSheet()
	}, [chatId, removeMessage, messageId])

	const handleAddMessage = useCallback(() => {
		handleAddForwardedMessage([messageInfo])
		handleClearMessagesId()
		closeSheet()
	}, [messageInfo, handleAddForwardedMessage, handleClearMessagesId])

	const actions = [
		{
			icon: <CheckCircle size={20} color={colors.text} />,
			label: isSelected ? t('deselect') : t('select'),
			onPress: () => {
				handleChooseMessage(messageId)
				closeSheet()
			}
		},
		...(canSendMessages
			? [
					{
						icon: <Reply size={20} color={colors.text} />,
						label: t('reply'),
						onPress: () => handleAddMessage()
					}
				]
			: []),
		{
			icon: <Clipboard size={20} color={colors.text} />,
			label: t('copy'),
			onPress: async () => {
				if (messageInfo.text) {
					await ExpoClipboard.setStringAsync(messageInfo.text)
					Toast.show({
						type: 'info',
						text1: t('textCopied')
					})
				}
				closeSheet()
			}
		},
		...(canEditThisMessage
			? [
					{
						icon: <Pencil size={20} color={colors.text} />,
						label: t('edit'),
						onPress: () => {
							startEdit(
								messageInfo,
								messageInfo?.repliedToLinks
									?.map(link => link?.repliedTo)
									.filter(
										(msg): msg is ForwardedMessageType =>
											!!msg
									) ?? []
							)
							closeSheet()
						}
					}
				]
			: []),
		...(canPinMessages
			? [
					{
						icon: isPinnedMessage ? (
							<PinOff size={20} color={colors.text} />
						) : (
							<Pin size={20} color={colors.text} />
						),
						label: isPinnedMessage
							? t('unpinChat') || 'Unpin'
							: t('pin'),
						onPress: () => {
							if (isPinnedMessage) {
								unPinMessage({
									variables: { chatId }
								})
							} else {
								pinMessage({
									variables: {
										chatId,
										messageId: messageInfo.id
									}
								})
							}
							closeSheet()
						}
					}
				]
			: []),
		...(canDeleteMessages
			? [
					{
						icon: <Trash2 size={20} color={colors.destructive} />,
						label: t('delete'),
						destructive: true,
						onPress: handleRemoveMessage
					}
				]
			: [])
	]

	const handlePressMessage = () => {
		if (isSelectionMode) {
			handleChooseMessage(messageId)
			return
		}
		openSheet()
	}

	const handleLongPressMessage = () => {
		handleChooseMessage(messageId)
	}

	return (
		<>
			<Pressable
				onPress={handlePressMessage}
				onLongPress={handleLongPressMessage}
				delayLongPress={300}
			>
				<ChatMessageItem
					isSelectionMode={isSelectionMode}
					isSelected={isSelected}
					chatId={chatId}
					messageInfo={messageInfo}
					userId={userId}
					isFirstInGroup={isFirstInGroup}
					isLastInGroup={isLastInGroup}
					showSenderName={showSenderName}
				/>
			</Pressable>

			<AppModal
				transparent
				visible={modalVisible}
				animationType='none'
				statusBarTranslucent
				navigationBarTranslucent
				onRequestClose={() => closeSheet()}
			>
				<View className='flex-1'>
					<Animated.View
						style={[
							{
								...StyleSheet.absoluteFillObject,
								backgroundColor: colors.overlay,
								opacity: backdropOpacity
							}
						]}
					/>
					<Pressable
						className='flex-1'
						onPress={() => closeSheet()}
					/>

					{/* Bottom sheet */}
					<Animated.View
						style={{
							transform: [{ translateY: slideAnim }],
							backgroundColor: colors.backgroundSecondary,
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							borderTopWidth: 1,
							borderColor: colors.borderLight,
							paddingBottom: 34,
							paddingTop: 8
						}}
					>
						{/* Handle bar */}
						<View className='items-center mb-2'>
							<View
								style={{
									width: 36,
									height: 4,
									borderRadius: 2,
									backgroundColor: colors.textMuted
								}}
							/>
						</View>

						{/* Preview: sender + text */}
						<View
							className='mx-4 mb-3 px-3 py-2 rounded-xl'
							style={{
								backgroundColor: colors.cardHover,
								borderLeftWidth: 3,
								borderLeftColor: colors.accent
							}}
						>
							<Text
								className='text-xs font-semibold mb-0.5'
								style={{ color: colors.accent }}
							>
								{messageInfo.user.username}
							</Text>
							{messageInfo.text && (
								<Text
									numberOfLines={2}
									className='text-xs'
									style={{ color: colors.textSecondary }}
								>
									{messageInfo.text}
								</Text>
							)}
						</View>

						{/* Action buttons grid */}
						<View className='px-3'>
							{actions.map((action, i) => (
								<TouchableOpacity
									key={i}
									onPress={action.onPress}
									activeOpacity={0.6}
									className='flex-row items-center px-4 py-3 rounded-xl mb-1'
									style={{
										backgroundColor: 'transparent'
									}}
								>
									<View
										className='w-9 h-9 rounded-full items-center justify-center mr-3'
										style={{
											backgroundColor: action.destructive
												? 'hsla(0, 80%, 50%, 0.15)'
												: colors.cardHover
										}}
									>
										{action.icon}
									</View>
									<Text
										className='text-sm font-medium'
										style={{
											color: action.destructive
												? colors.destructive
												: colors.text
										}}
									>
										{action.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</Animated.View>
				</View>
			</AppModal>
		</>
	)
}

export default ChatMessageDropdownTrigger
