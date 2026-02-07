import { X } from 'lucide-react-native'
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
	const usernames = new Set<string>()
	forwardedMessages.forEach(msg => usernames.add(msg.user.username))

	return (
		<View className='flex-row justify-between items-center p-2 bg-gray-100 rounded-md'>
			<View className='flex-row items-center flex-1 space-x-2'>
				{forwardedMessages.length > 1 ? (
					<View className='flex-row items-center space-x-2'>
						<View className='w-[1.5px] bg-gray-400 h-6' />
						<View>
							<Text className='text-sm'>
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
							<Text className='text-xs'>
								{forwardedMessages.length} messages
							</Text>
						</View>
					</View>
				) : (
					<View className='flex-1'>
						<Text className='text-sm font-medium'>
							{forwardedMessages[0].user.username}
						</Text>
						<Text
							numberOfLines={1}
							className='text-xs text-gray-700 w-64'
						>
							{forwardedMessages[0].text ?? ''}
						</Text>
						{forwardedMessages[0].files &&
						forwardedMessages[0].files.length > 0 ? (
							<Text className='text-xs text-gray-500'>
								{forwardedMessages[0].files.length}{' '}
								{forwardedMessages[0].files.length > 1
									? 'files'
									: 'file'}
							</Text>
						) : null}
					</View>
				)}
			</View>

			<TouchableOpacity
				onPress={() => setForwardedMessages([])}
				className='p-1'
			>
				<X size={24} color='#000' />
			</TouchableOpacity>
		</View>
	)
}

export default ForwardedMessagesBar
