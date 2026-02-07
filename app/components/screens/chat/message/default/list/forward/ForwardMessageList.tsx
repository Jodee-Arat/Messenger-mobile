import { FC } from 'react'
import { View } from 'react-native'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'

import MessageForm from '../MessageForm'

interface ForwardMessageListProp {
	forwardedMessagesInfo: ForwardedMessageType[]
	userId: string
	chatId: string
	isSelected: boolean
}
const ForwardMessageList: FC<ForwardMessageListProp> = ({
	chatId,
	forwardedMessagesInfo,
	userId,
	isSelected
}) => {
	return (
		<View>
			{forwardedMessagesInfo.map((message, index) => (
				<MessageForm
					key={index}
					chatId={chatId}
					isSelected={isSelected}
					user={message.user}
					userId={userId}
					files={message.files}
					text={message.text}
				/>
			))}
		</View>
	)
}

export default ForwardMessageList
