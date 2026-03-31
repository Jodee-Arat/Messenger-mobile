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
	createdAt
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const isOwnMessage = user.id === userId

	const timeString = (() => {
		try {
			const d = new Date(createdAt)
			return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
		} catch {
			return ''
		}
	})()

	const bubbleBg = isOwnMessage ? colors.accent : colors.backgroundSecondary
	const textColor = isOwnMessage ? '#fff' : colors.text
	const timeColor = isOwnMessage ? 'rgba(255,255,255,0.65)' : colors.textMuted

	return (
		<View
			style={{
				flexDirection: isOwnMessage ? 'row-reverse' : 'row',
				alignItems: 'flex-end'
			}}
		>
			{!isOwnMessage && (
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
					borderBottomRightRadius: isOwnMessage ? 4 : 16,
					borderBottomLeftRadius: isOwnMessage ? 16 : 4,
					paddingHorizontal: 12,
					paddingVertical: 8,
					maxWidth: '100%'
				}}
			>
				{isFirstInGroup && !isOwnMessage && (
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
						justifyContent: 'flex-end',
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
