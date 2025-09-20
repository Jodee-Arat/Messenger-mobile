import { FindAllMessagesByChatQuery } from '../graphql/generated/output'

export type MessageType =
	FindAllMessagesByChatQuery['findAllMessagesByChat'][number]
