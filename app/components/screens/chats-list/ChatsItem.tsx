import React, { FC } from 'react'

import ChatItemRow from '@/components/ui/ChatItemRow'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { createSecretChat } from '@/utils/secret-chat/secretChat'

import { FindAllChatsByGroupQuery } from '@/graphql/generated/output'

interface ChatsItemProps {
	chat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
	handleLongPress?: () => void
	onDrag?: () => void
	isActive?: boolean
	groupId: string
}

const ChatsItem: FC<ChatsItemProps> = ({
	chat,
	handleLongPress,
	onDrag,
	isActive,
	groupId
}) => {
	const navigation = useTypedNavigation()

	const handlePress = () => {
		navigation.navigate('Chat', {
			chatId: chat.id,
			chatName: chat.chatName!,
			isSecret: chat.isSecret,
			groupId: groupId
		})
	}

	if (chat.isSecret) {
		createSecretChat(chat)
	}

	return (
		<ChatItemRow
			chat={chat}
			onPress={handlePress}
			onLongPress={handleLongPress}
			onDrag={onDrag}
			isActive={isActive}
		/>
	)
}

export default ChatsItem
