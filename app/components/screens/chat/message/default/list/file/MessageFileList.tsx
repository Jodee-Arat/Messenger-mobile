import React, { FC } from 'react'
import { View } from 'react-native'

import { MessageFileType } from '@/types/message-file.type'

import MessageFileItem from './MessageFileItem'

interface MessageFileListProp {
	files: MessageFileType[]
	chatId: string
	isSelected: boolean
}

const MessageFileList: FC<MessageFileListProp> = ({
	files,
	chatId,
	isSelected
}) => {
	if (!files || files.length === 0) return null

	return (
		<View
			pointerEvents={'box-none'}
			className='flex flex-row flex-wrap gap-x-4 gap-y-1'
		>
			{files.map((file, index) => (
				<MessageFileItem
					key={index}
					isSelected={isSelected}
					file={file}
					chatId={chatId}
				/>
			))}
		</View>
	)
}

export default MessageFileList
