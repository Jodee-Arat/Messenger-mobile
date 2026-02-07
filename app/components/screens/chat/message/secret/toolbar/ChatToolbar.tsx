import { X } from 'lucide-react-native'
import React, { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/button/Button'

import ForwardMessageModal from '../list/ForwardMessageModal'

interface ChatToolbarProp {
	messageIds?: string[]
	handleRemoveMessages: () => void
	handleClearMessagesId: () => void
	handleAddForwarded: (messageIds: string[]) => void
	chatId: string
}

const ChatToolbar: FC<ChatToolbarProp> = ({
	handleAddForwarded,
	handleClearMessagesId,
	handleRemoveMessages,
	messageIds,
	chatId
}) => {
	return (
		<View>
			{messageIds && !!messageIds.length && (
				<View className='flex items-center justify-end space-x-5 rounded-lg'>
					<Button onPress={() => handleAddForwarded(messageIds)}>
						<Text>Reply</Text>
					</Button>
					<ForwardMessageModal
						handleAddForwarded={handleAddForwarded}
						chatId={chatId}
						messageIds={messageIds}
						handleClearMessagesId={handleClearMessagesId}
					/>

					<Button onPress={handleRemoveMessages}>
						<Text>Remove selection</Text>
					</Button>
					<Text className='text-sm'>
						{`message(s) selected: ${messageIds.length}`}
					</Text>
					<Button
						onPress={handleClearMessagesId}
						className='p-0'
						variant='ghost'
						size='icon'
					>
						<X className='h-7 w-7 py-0.5 px-1' />
					</Button>
				</View>
			)}
		</View>
	)
}

export default ChatToolbar
