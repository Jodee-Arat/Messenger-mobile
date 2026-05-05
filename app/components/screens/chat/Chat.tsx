import { useRoute } from '@react-navigation/native'
import React from 'react'

import DefaultChat from './DefaultChat'
import SecretChat from './SecretChat'

type RouteParams = {
	chatId: string
	chatName: string
	isSecret: boolean
	groupId?: string
	isSaved?: boolean
}

const Chat = () => {
	const route = useRoute()
	const { chatId, chatName, isSecret, groupId, isSaved } =
		route.params as RouteParams

	if (isSecret) {
		return (
			<SecretChat
				groupId={groupId}
				chatId={chatId}
				chatName={chatName}
				isSecret={isSecret}
				isSaved={isSaved}
			/>
		)
	}

	return (
		<DefaultChat
			groupId={groupId}
			chatId={chatId}
			chatName={chatName}
			isSecret={isSecret}
		/>
	)
}

export default Chat
