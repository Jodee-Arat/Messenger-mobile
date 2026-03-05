import { Trash2, X } from 'lucide-react-native'
import React, { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

interface ChatToolbarProp {
	messageIds?: string[]
	handleRemoveMessages: () => void
	handleClearMessagesId: () => void
	chatId: string
}

const ChatToolbar: FC<ChatToolbarProp> = ({
	handleClearMessagesId,
	handleRemoveMessages,
	messageIds,
	chatId
}) => {
	const { colors } = useTheme()
	if (!messageIds || messageIds.length === 0) return null

	return (
		<View
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderTopWidth: 1,
				borderTopColor: colors.borderLight,
				paddingBottom: 28,
				paddingTop: 8,
				paddingHorizontal: 8
			}}
		>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center'>
					<TouchableOpacity
						onPress={handleClearMessagesId}
						activeOpacity={0.6}
						className='w-10 h-10 rounded-full items-center justify-center mr-2'
						style={{ backgroundColor: colors.cardHover }}
					>
						<X size={20} color={colors.textSecondary} />
					</TouchableOpacity>
					<View
						className='rounded-full px-3 py-1'
						style={{ backgroundColor: colors.accent }}
					>
						<Text
							className='text-xs font-bold'
							style={{ color: '#fff' }}
						>
							{messageIds.length}
						</Text>
					</View>
				</View>

				<View className='flex-row items-center space-x-1'>
					<TouchableOpacity
						onPress={handleRemoveMessages}
						activeOpacity={0.6}
						className='w-10 h-10 rounded-full items-center justify-center'
						style={{ backgroundColor: colors.destructiveMuted }}
					>
						<Trash2 size={20} color={colors.destructive} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export default ChatToolbar
