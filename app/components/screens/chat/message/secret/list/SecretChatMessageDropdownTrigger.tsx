import * as ExpoClipboard from 'expo-clipboard'
import { CheckCircle, Clipboard, Trash2, X } from 'lucide-react-native'
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

import { MessageType } from '@/types/message.type'

import MessageForm from './MessageForm'

interface SecretChatMessageDropdownProp {
	messageInfo: MessageType
	userId: string
	messageId: string
	chatId: string
	messageIds: string[]
	isSelectionMode: boolean
	handleAddForwardedMessage?: (messages: MessageType[]) => void
	handleChooseMessage: (messageId: string) => void
	handleClearMessagesId: () => void
	onDelete: (id: string[]) => Promise<void>
	canDeleteMessages?: boolean
	isSelected: boolean
	isFirstInGroup: boolean
	isLastInGroup: boolean
	showSenderName?: boolean
	isUnifiedThread?: boolean
}

const SecretChatMessageDropdownTrigger: FC<SecretChatMessageDropdownProp> = ({
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
	canDeleteMessages = true,
	isSelected,
	isFirstInGroup,
	isLastInGroup,
	showSenderName = true,
	isUnifiedThread = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [modalVisible, setModalVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const { height: windowHeight } = useWindowDimensions()
	const slideAnim = useRef(new Animated.Value(windowHeight)).current
	const backdropOpacity = useRef(new Animated.Value(0)).current

	useEffect(() => {
		return () => {
			slideAnim.stopAnimation()
			backdropOpacity.stopAnimation()
		}
	}, [backdropOpacity, slideAnim])

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
	}, [messageId, onDelete, t])

	const handleAddMessage = useCallback(() => {
		handleAddForwardedMessage([messageInfo])
		handleClearMessagesId()
		closeSheet()
	}, [handleAddForwardedMessage, handleClearMessagesId, messageInfo])

	const actions = [
		...(canDeleteMessages
			? [
					{
						icon: <CheckCircle size={20} color={colors.text} />,
						label: isSelected ? t('deselect') : t('select'),
						onPress: () => {
							handleChooseMessage(messageId)
							closeSheet()
						}
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
						text1: t('copied')
					})
				}
				closeSheet()
			}
		},
		...(canDeleteMessages
			? [
					{
						icon: <Trash2 size={20} color={colors.destructive} />,
						label: isDeleting ? t('deleting') : t('delete'),
						destructive: true,
						disabled: isDeleting,
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
		if (!canDeleteMessages) return
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
					<MessageForm
						chatId={chatId}
						userId={userId}
						user={messageInfo.user}
						text={messageInfo.text}
						files={messageInfo.files}
						isEdited={messageInfo.isEdited}
						isSelected={isSelected}
						isFirstInGroup={isFirstInGroup}
						isLastInGroup={isLastInGroup}
						showSenderName={showSenderName}
						isUnifiedThread={isUnifiedThread}
						createdAt={messageInfo.createdAt}
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
