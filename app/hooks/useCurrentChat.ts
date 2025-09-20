'use client'

import { useFindChatByChatIdQuery } from '../graphql/generated/output'

export function useCurrentChat(chatId: string) {
	const { data, loading, refetch, error } = useFindChatByChatIdQuery({
		variables: {
			chatId: chatId
		}
	})

	return {
		chat: data?.findChatByChatId,
		isLoadingChat: loading,
		refetch
	}
}
