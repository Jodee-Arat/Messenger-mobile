import {
	CheckCircle,
	Clipboard,
	Pencil,
	Pin,
	Trash2,
	X
} from 'lucide-react-native'
import React, { FC, useCallback, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

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
	isSelected: boolean
}

const SCREEN_HEIGHT = Dimensions.get('window').height

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
	isSelected
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [modalVisible, setModalVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

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

	const handlePinMessage = useCallback(() => {
		setPinnedMessage(messageInfo)
		Toast.show({
			type: 'success',
			text1: t('messagePinned')
		})
		closeSheet()
	}, [messageInfo, setPinnedMessage])

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
			onPress: () => {
				if (messageInfo.text) {
					Toast.show({
						type: 'info',
						text1: t('copied'),
						text2: messageInfo.text
					})
				}
				closeSheet()
			}
		},
		{
			icon: <Pencil size={20} color={colors.text} />,
			label: t('edit'),
			onPress: () => {
				startEdit(
					messageInfo,
					messageInfo?.repliedToLinks
						?.map(link => link?.repliedTo)
						.filter((msg): msg is ForwardedMessageType => !!msg) ??
						[]
				)
				closeSheet()
			}
		},
		{
			icon: <Pin size={20} color={colors.text} />,
			label: t('pin'),
			onPress: handlePinMessage
		},
		{
			icon: <Trash2 size={20} color={colors.destructive} />,
			label: isDeleting ? t('deleting') : t('delete'),
			destructive: true,
			disabled: isDeleting,
			onPress: handleRemoveMessage
		}
	]

	return (
		<>
			<Pressable onLongPress={openSheet} delayLongPress={300}>
				<View
					className='rounded-xl'
					style={{
						backgroundColor: isSelected
							? colors.accentMuted
							: 'transparent'
					}}
				>
					<ChatMessageItem
						chatId={chatId}
						handleChooseMessage={handleChooseMessage}
						messageId={messageId}
						messageIds={messageIds}
						messageInfo={messageInfo}
						userId={userId}
						isSelected={isSelected}
					/>
				</View>
			</Pressable>

			<Modal
				transparent
				visible={modalVisible}
				animationType='none'
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
			</Modal>
		</>
	)
}

export default SecretChatMessageDropdownTrigger
