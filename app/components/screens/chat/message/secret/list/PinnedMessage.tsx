import { X } from 'lucide-react-native'
import React, { FC } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { MessageType } from '@/types/message.type'

import { useUnPinMessageMutation } from '@/graphql/generated/output'

interface PinnedMessageProps {
	pinnedMessage: MessageType | null
	setPinnedMessage: (message: MessageType | null) => void
	chatId: string
}

const PinnedMessage: FC<PinnedMessageProps> = ({
	pinnedMessage,
	setPinnedMessage,
	chatId
}) => {
	const [unpinMessage, { loading: isUnpinning }] = useUnPinMessageMutation({
		onCompleted() {
			setPinnedMessage(null)
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Failed to unpin message.',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	if (!pinnedMessage) return null

	return (
		<View className='bg-gray-100 dark:bg-neutral-800 px-3 py-2 flex-row items-center justify-between rounded-lg mx-3 mt-2'>
			<View className='flex-1'>
				<Text className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
					{pinnedMessage.user.username}
				</Text>

				{pinnedMessage.text ? (
					<Text
						className='text-xs text-gray-500 dark:text-gray-400'
						numberOfLines={1}
					>
						{pinnedMessage.text}
					</Text>
				) : pinnedMessage.files?.length ? (
					<Text className='text-xs text-blue-500'>
						{pinnedMessage.files.length} файл(ов)
					</Text>
				) : (
					<Text className='text-xs text-gray-400'>Пусто</Text>
				)}
			</View>

			<TouchableOpacity
				onPress={() => unpinMessage({ variables: { chatId } })}
				disabled={isUnpinning}
				className='ml-2 p-1'
			>
				{isUnpinning ? (
					<ActivityIndicator size='small' />
				) : (
					<X size={18} color='#666' />
				)}
			</TouchableOpacity>
		</View>
	)
}

export default PinnedMessage
