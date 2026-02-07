import React, { FC } from 'react'
import { Text, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

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
}

const MessageForm: FC<MessageFormProp> = ({
	chatId,
	user,
	userId,
	files,
	isSelected,
	text,
	isEdited
}) => {
	const isOwnMessage = user.id === userId

	return (
		<View className='flex'>
			<View
				className={`flex items-start gap-3 ${
					isOwnMessage ? 'flex-row-reverse' : 'flex-row'
				}`}
			>
				<View className='mt-1'>
					<EntityAvatar
						name={user.username}
						avatarUrl={user.avatarUrl}
						size='default'
					/>
				</View>

				<View className='flex-2 flex-col'>
					<Text
						className={`font-semibold ${
							isOwnMessage ? 'text-right' : 'text-left'
						}`}
					>
						{user.username}
					</Text>

					{isEdited && (
						<Text className='text-xs text-gray-500'>Edited</Text>
					)}

					{text !== '' && text !== 'null' && (
						<Text
							className={`break-words text-sm ${
								isOwnMessage ? 'text-right' : 'text-left'
							}`}
						>
							{text}
						</Text>
					)}

					<MessageFileList
						isSelected={isSelected}
						files={files ?? []}
						chatId={chatId}
					/>
				</View>
			</View>
		</View>
	)
}

export default MessageForm
