import React, { FC } from 'react'
import { Text, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { MessageFileType } from '@/types/message-file.type'

import MessageFileList from './file/MessageFileList'

interface MessageFormProp {
	chatId: string
	userId: string
	user: {
		id: string
		avatarUrl?: string | null
		username: string
	}
	isEdited?: boolean
	text?: string | null
	files?: MessageFileType[] | null | undefined
	isSelected: boolean
	isFirstInGroup: boolean
	isLastInGroup: boolean
	showSenderName?: boolean
	isUnifiedThread?: boolean
	createdAt: string
}

const MessageForm: FC<MessageFormProp> = ({
	chatId,
	user,
	userId,
	files,
	isSelected,
	text,
	isEdited,
	isFirstInGroup,
	isLastInGroup,
	showSenderName = true,
	isUnifiedThread = false,
	createdAt
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const isOwnMessage = user.id === userId
	const useOwnBubbleStyle = isOwnMessage || isUnifiedThread

	const timeString = (() => {
		try {
			const d = new Date(createdAt)
			return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
		} catch {
			return ''
		}
	})()

	const bubbleBg = useOwnBubbleStyle ? colors.accent : colors.backgroundSecondary
	const textColor = useOwnBubbleStyle ? '#fff' : colors.text
	const timeColor = useOwnBubbleStyle ? 'rgba(255,255,255,0.65)' : colors.textMuted

	return (
		<View
			style={{
				flexDirection: useOwnBubbleStyle ? 'row-reverse' : 'row',
				alignItems: 'flex-end',
				width: isUnifiedThread ? '100%' : undefined
			}}
		>
			{!isOwnMessage && !isUnifiedThread && (
				<View
					style={{
						width: 36,
						marginRight: 6,
						alignItems: 'center',
						justifyContent: 'flex-end'
					}}
				>
					{isLastInGroup ? (
						<EntityAvatar
							name={user.username}
							avatarUrl={user.avatarUrl}
							size='sm'
						/>
					) : (
						<View style={{ width: 28, height: 28 }} />
					)}
				</View>
			)}

			<View
				style={{
					backgroundColor: bubbleBg,
					borderRadius: 16,
					borderBottomRightRadius: isUnifiedThread
						? 16
						: useOwnBubbleStyle
							? 4
							: 16,
					borderBottomLeftRadius: isUnifiedThread
						? 16
						: useOwnBubbleStyle
							? 16
							: 4,
					paddingHorizontal: 12,
					paddingVertical: 8,
					maxWidth: isUnifiedThread ? '80%' : '100%'
				}}
			>
				{showSenderName && isFirstInGroup && !isOwnMessage && (
					<Text
						style={{
							fontSize: 12,
							fontWeight: '600',
							color: colors.accent,
							marginBottom: 2
						}}
					>
						{user.username}
					</Text>
				)}

				{text != null && text !== '' && text !== 'null' && (
					<Text
						style={{
							color: textColor,
							fontSize: 14,
							lineHeight: 20
						}}
					>
						{text}
					</Text>
				)}

				<MessageFileList
					isSelected={isSelected}
					files={files ?? []}
					chatId={chatId}
					isOwnMessage={isOwnMessage}
				/>

				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						justifyContent: 'flex-end',
						alignItems: 'center',
						marginTop: 4
					}}
				>
					{isEdited && (
						<Text
							style={{
								fontSize: 10,
								color: timeColor,
								marginRight: 4
							}}
						>
							{t('edited')} ·
						</Text>
					)}
					<Text style={{ fontSize: 10, color: timeColor }}>
						{timeString}
					</Text>
				</View>
			</View>
		</View>
	)
}

export default MessageForm
