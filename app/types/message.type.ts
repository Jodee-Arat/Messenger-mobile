import { FindAllMessagesByChatQuery } from '../graphql/generated/output'

import { MessageFileType } from './message-file.type'

type BaseMessageType = FindAllMessagesByChatQuery['findAllMessagesByChat'][number]

export type MessageType = Omit<BaseMessageType, 'files'> & {
	files?: MessageFileType[] | null
}
