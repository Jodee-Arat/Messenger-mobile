import { X } from 'lucide-react-native'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import React, { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'

interface ForwardedMessagesBarProp {
	forwardedMessages: ForwardedMessageType[]
	setForwardedMessages: (messages: ForwardedMessageType[]) => void
}

const ForwardedMessagesBar: FC<ForwardedMessagesBarProp> = ({
	forwardedMessages,
	setForwardedMessages
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const usernames = new Set<string>()
	forwardedMessages.forEach(msg => usernames.add(msg.user.username))

	return (
		<View
			className='flex-row justify-between items-center p-2 rounded-xl'
			style={{
				backgroundColor: colors.cardHover,
				borderWidth: 1,
				borderColor: colors.borderLight
			}}
		>
			<View className='flex-row items-center flex-1 space-x-2'>
				{forwardedMessages.length > 1 ? (
					<View className='flex-row items-center space-x-2'>
						<View
							className='w-[1.5px] h-6'
							style={{ backgroundColor: colors.accent }}
						/>
						<View>
							<Text
								className='text-sm'
								style={{ color: colors.text }}
							>
								{Array.from(usernames.values()).map(
									(username, index) => (
										<Text key={username}>
											{username}
											{index < usernames.size - 1
												? ', '
												: ''}
										</Text>
									)
								)}
							</Text>
							<Text
								className='text-xs'
								style={{ color: colors.textSecondary }}
							>
								{forwardedMessages.length} {t('messagesCount')}
							</Text>
						</View>
					</View>
				) : (
					<View className='flex-1'>
						<Text
							className='text-sm font-medium'
							style={{ color: colors.accent }}
						>
							{forwardedMessages[0].user.username}
						</Text>
						<Text
							numberOfLines={1}
							className='text-xs w-64'
							style={{ color: colors.textSecondary }}
						>
							{forwardedMessages[0].text ?? ''}
						</Text>
						{forwardedMessages[0].files &&
						forwardedMessages[0].files.length > 0 ? (
							<Text
								className='text-xs'
								style={{ color: colors.textSecondary }}
							>
								{forwardedMessages[0].files.length}{' '}
								{forwardedMessages[0].files.length > 1
									? t('files')
									: t('files')}
							</Text>
						) : null}
					</View>
				)}
			</View>

			<TouchableOpacity
				onPress={() => setForwardedMessages([])}
				className='p-1'
			>
				<X size={24} color={colors.textSecondary} />
			</TouchableOpacity>
		</View>
	)
}

export default ForwardedMessagesBar
