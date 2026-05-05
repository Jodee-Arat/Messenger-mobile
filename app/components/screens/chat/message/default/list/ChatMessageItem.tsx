import { Check } from 'lucide-react-native'
import React, { FC, useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import MessageForm from './MessageForm'
import ForwardMessageList from './forward/ForwardMessageList'

interface ChatMessageItemProp {
	messageInfo: MessageType
	userId: string
	chatId: string
	isSelectionMode: boolean
	isSelected: boolean
	isFirstInGroup: boolean
	isLastInGroup: boolean
	showSenderName?: boolean
}

const ChatMessageItem: FC<ChatMessageItemProp> = ({
	messageInfo,
	userId,
	isSelectionMode,
	isSelected,
	chatId,
	isFirstInGroup,
	isLastInGroup,
	showSenderName = true
}) => {
	const { colors } = useTheme()
	const { text, user, files, isEdited } = messageInfo

	const selectionModeAnim = useRef(new Animated.Value(0)).current
	const selectedAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current

	useEffect(() => {
		return () => {
			selectionModeAnim.stopAnimation()
			selectedAnim.stopAnimation()
		}
	}, [])

	useEffect(() => {
		Animated.timing(selectionModeAnim, {
			toValue: isSelectionMode ? 1 : 0,
			duration: 190,
			easing: Easing.out(Easing.ease),
			useNativeDriver: false
		}).start()
	}, [isSelectionMode, selectionModeAnim])

	useEffect(() => {
		Animated.timing(selectedAnim, {
			toValue: isSelected ? 1 : 0,
			duration: 180,
			easing: Easing.out(Easing.ease),
			useNativeDriver: false
		}).start()
	}, [isSelected, selectedAnim])

	const forwardedMessages: ForwardedMessageType[] =
		messageInfo.repliedToLinks
			?.filter(
				(link): link is NonNullable<typeof link> =>
					!!link && !!link.repliedTo
			)
			.map(link => ({
				id: link.repliedTo!.id,
				text: link.repliedTo!.text ?? null,
				files:
					link.repliedTo!.files?.map(f => ({
						id: f.id,
						fileName: f.fileName,
						fileFormat: f.fileFormat,
						fileSize: f.fileSize
					})) ?? null,
				user: {
					id: link.repliedTo!.user.id,
					username: link.repliedTo!.user.username,
					avatarUrl: link.repliedTo!.user.avatarUrl ?? null
				}
			})) ?? []

	const isOwnMessage = user.id === userId
	const shift = selectionModeAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 12]
	})
	const selectionBackground = selectedAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['transparent', colors.accentMuted]
	})
	const checkboxBorder = selectedAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [colors.borderLight, colors.accent]
	})

	const checkboxWidth = selectionModeAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 24]
	})
	const checkboxMargin = selectionModeAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 10]
	})

	const bubbleTransform = isOwnMessage
		? [{ translateX: Animated.multiply(shift, -1) }]
		: [{ translateX: shift }]

	return (
		<Animated.View
			className={`flex w-full p-2 rounded-xl ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-center`}
			style={{ backgroundColor: selectionBackground }}
		>
			<Animated.View
				style={{
					opacity: selectionModeAnim,
					width: checkboxWidth,
					height: 24,
					borderRadius: 12,
					borderWidth: 2,
					borderColor: checkboxBorder,
					backgroundColor: isSelected ? colors.accent : 'transparent',
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: isOwnMessage ? 0 : checkboxMargin,
					marginLeft: isOwnMessage ? checkboxMargin : 0,
					overflow: 'hidden'
				}}
			>
				{isSelected && <Check size={14} color='#fff' />}
			</Animated.View>

			<Animated.View
				className={`flex max-w-[80%] flex-col gap-2 ${
					isOwnMessage
						? 'items-end text-right'
						: 'items-start text-left'
				}`}
				style={{ transform: bubbleTransform }}
			>
				<MessageForm
					chatId={chatId}
					isSelected={isSelected}
					user={user}
					userId={userId}
					files={files}
					text={text}
					isEdited={isEdited}
					isFirstInGroup={isFirstInGroup}
					isLastInGroup={isLastInGroup}
					showSenderName={showSenderName}
					createdAt={messageInfo.createdAt}
				/>

				{messageInfo.repliedToLinks &&
					messageInfo.repliedToLinks.length > 0 && (
						<View
							className={`rounded-lg p-3 space-y-3
								${isOwnMessage ? 'mr-10' : 'ml-10'}`}
							style={{
								backgroundColor: colors.cardHover,
								borderWidth: 1,
								borderColor: colors.borderLight
							}}
						>
							<ForwardMessageList
								chatId={chatId}
								forwardedMessagesInfo={forwardedMessages}
								isSelected={isSelected}
								userId={userId}
							/>
						</View>
					)}
			</Animated.View>
		</Animated.View>
	)
}

export default ChatMessageItem
