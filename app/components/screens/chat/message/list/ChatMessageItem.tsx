import React, { FC } from 'react'
import { Pressable, View } from 'react-native'

import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'
import { MessageType } from '@/types/message.type'

import MessageForm from './MessageForm'
import ForwardMessageList from './forward/ForwardMessageList'

interface ChatMessageItemProp {
	messageInfo: MessageType
	userId: string
	chatId: string
	messageId: string
	messageIds: string[]
	handleChooseMessage: (messageId: string) => void
}

const ChatMessageItem: FC<ChatMessageItemProp> = ({
	messageInfo,
	handleChooseMessage,
	messageId,
	userId,
	messageIds,
	chatId
}) => {
	const { text, user, files, isEdited } = messageInfo
	const isSelected = messageIds.includes(messageId)

	const forwardedMessages: ForwardedMessageType[] =
		messageInfo.repliedToLinks
			?.filter(
				(link): link is NonNullable<typeof link> =>
					!!link && !!link.repliedTo
			)
			.map(link => ({
				id: link.repliedTo!.id,
				text: link.repliedTo!.text ?? null,
				files:
					link.repliedTo!.files?.map(f => ({
						id: f.id,
						fileName: f.fileName,
						fileFormat: f.fileFormat,
						fileSize: f.fileSize
					})) ?? null,
				user: {
					id: link.repliedTo!.user.id,
					username: link.repliedTo!.user.username,
					avatarUrl: link.repliedTo!.user.avatarUrl ?? null
				}
			})) ?? []

	const isOwnMessage = user.id === userId

	return (
		<Pressable
			onPress={() => handleChooseMessage(messageId)}
			className={`flex w-full p-2 rounded-lg transition-colors
				${isSelected ? 'bg-accent' : 'bg-transparent'}
				${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
		>
			<View
				className={`flex max-w-[80%] flex-col gap-2
					${isOwnMessage ? 'items-end text-right' : 'items-start text-left'}`}
			>
				<MessageForm
					chatId={chatId}
					isSelected={isSelected}
					user={user}
					userId={userId}
					files={files}
					text={text}
					isEdited={isEdited}
				/>

				{messageInfo.repliedToLinks &&
					messageInfo.repliedToLinks.length > 0 && (
						<View
							className={`bg-muted border border-muted/50 rounded-md p-3 space-y-3
								${isOwnMessage ? 'mr-10' : 'ml-10'}`}
						>
							<ForwardMessageList
								chatId={chatId}
								forwardedMessagesInfo={forwardedMessages}
								isSelected={isSelected}
								userId={userId}
							/>
						</View>
					)}
			</View>
		</Pressable>
	)
}

export default ChatMessageItem
