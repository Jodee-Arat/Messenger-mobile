import * as ExpoClipboard from 'expo-clipboard'
import {
	CheckCircle,
	Clipboard,
	Pin,
	PinOff,
	Trash2,
	X
} from 'lucide-react-native'
import React, { FC, useCallback, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import AppModal from '@/components/ui/AppModal'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { MessageType } from '@/types/message.type'

import ChatMessageItem from '../../default/list/ChatMessageItem'

import {
	usePinMessageMutation,
	useUnPinMessageMutation
} from '@/graphql/generated/output'

interface SecretChatMessageDropdownProp {
	messageInfo: MessageType
	setPinnedMessage?: (message: MessageType | null) => void
	userId: string
	messageId: string
	chatId: string
	messageIds: string[]
	isSelectionMode: boolean
	handleAddForwardedMessage?: (messages: MessageType[]) => void
	handleChooseMessage: (messageId: string) => void
	handleClearMessagesId: () => void
	onDelete: (id: string[]) => Promise<void>
	isSelected: boolean
	pinnedMessageId?: string | null
	isFirstInGroup: boolean
	isLastInGroup: boolean
}

const SCREEN_HEIGHT = Dimensions.get('window').height

const SecretChatMessageDropdownTrigger: FC<SecretChatMessageDropdownProp> = ({
	setPinnedMessage = () => {},
	chatId,
	handleAddForwardedMessage = () => {},
	handleClearMessagesId,
	handleChooseMessage,
	messageId,
	messageIds,
	isSelectionMode,
	messageInfo,
	userId,
	onDelete,
	isSelected,
	pinnedMessageId,
	isFirstInGroup,
	isLastInGroup
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [modalVisible, setModalVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const isPinnedMessage = pinnedMessageId === messageInfo.id

	const openSheet = () => {
		setModalVisible(true)
		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
			tension: 65,
			friction: 11
		}).start()
	}

	const closeSheet = (cb?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			setModalVisible(false)
			cb?.()
		})
	}

	const handleRemoveMessage = useCallback(async () => {
		try {
			setIsDeleting(true)
			await onDelete([messageId])
			Toast.show({
				type: 'success',
				text1: t('messageDeleted')
			})
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: t('deleteError'),
				text2: err.message || t('tryAgain')
			})
		} finally {
			setIsDeleting(false)
			closeSheet()
		}
	}, [onDelete, messageId])

	const handleAddMessage = useCallback(() => {
		handleAddForwardedMessage([messageInfo])
		handleClearMessagesId()
		closeSheet()
	}, [messageInfo, handleAddForwardedMessage, handleClearMessagesId])

	const [pinMessage] = usePinMessageMutation({
		onCompleted() {
			setPinnedMessage(messageInfo)
			Toast.show({
				type: 'success',
				text1: t('messagePinned')
			})
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
			setPinnedMessage(null)
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('unpinError'),
				text2: error.message
			})
		}
	})

	const actions = [
		{
			icon: <CheckCircle size={20} color={colors.text} />,
			label: isSelected ? t('deselect') : t('select'),
			onPress: () => {
				handleChooseMessage(messageId)
				closeSheet()
			}
		},
		{
			icon: <Clipboard size={20} color={colors.text} />,
			label: t('copy'),
			onPress: async () => {
				if (messageInfo.text) {
					await ExpoClipboard.setStringAsync(messageInfo.text)
					Toast.show({
						type: 'info',
						text1: t('copied')
					})
				}
				closeSheet()
			}
		},
		{
			icon: isPinnedMessage ? (
				<PinOff size={20} color={colors.text} />
			) : (
				<Pin size={20} color={colors.text} />
			),
			label: isPinnedMessage ? t('unpinChat') || 'Unpin' : t('pin'),
			onPress: () => {
				if (isPinnedMessage) {
					unPinMessage({ variables: { chatId } })
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
		},
		{
			icon: <Trash2 size={20} color={colors.destructive} />,
			label: isDeleting ? t('deleting') : t('delete'),
			destructive: true,
			disabled: isDeleting,
			onPress: handleRemoveMessage
		}
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
				<View
					className='rounded-xl'
					style={{
						backgroundColor: isSelected
							? colors.accentMuted
							: 'transparent'
					}}
				>
					<ChatMessageItem
						isSelectionMode={isSelectionMode}
						chatId={chatId}
						messageInfo={messageInfo}
						userId={userId}
						isSelected={isSelected}
						isFirstInGroup={isFirstInGroup}
						isLastInGroup={isLastInGroup}
					/>
				</View>
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
					{/* Dimmed backdrop */}
					<Pressable
						className='flex-1'
						style={{ backgroundColor: colors.overlay }}
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

						{/* Action buttons */}
						<View className='px-3'>
							{actions.map((action, i) => (
								<TouchableOpacity
									key={i}
									onPress={action.onPress}
									disabled={action.disabled}
									activeOpacity={0.6}
									className='flex-row items-center px-4 py-3 rounded-xl mb-1'
									style={{
										backgroundColor: 'transparent',
										opacity: action.disabled ? 0.4 : 1
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

export default SecretChatMessageDropdownTrigger
