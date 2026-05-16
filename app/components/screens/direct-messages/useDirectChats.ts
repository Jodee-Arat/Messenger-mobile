import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Toast from 'react-native-toast-message'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'
import {
	forgetStartedDirectChat,
	loadStartedDirectChats,
	markDirectChatStarted
} from '@/utils/direct-chat-visibility'

import {
	ChatDeletedSubscription,
	FindAllChatsByUserQuery,
	useChatDeletedSubscription,
	useChatUpdatedSubscription,
	useDeleteChatMutation,
	useFindAllChatsByUserQuery,
	usePinChatMutation,
	useUnPinChatMutation,
	useUpdatePinnedChatsOrderMutation
} from '@/graphql/generated/output'

type ChatItem = FindAllChatsByUserQuery['findAllChatsByUser'][0]

function sortChatsWithPinned(chats: ChatItem[]): ChatItem[] {
	const pinned = chats
		.filter(chat => chat.isPinned)
		.sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0))
	const unpinned = chats.filter(chat => !chat.isPinned)
	return [...pinned, ...unpinned]
}

function cloneChat(chat: ChatItem): ChatItem {
	return {
		...chat,
		members:
			chat.members?.map(member => ({
				...member,
				user: { ...member.user }
			})) ?? []
	}
}

function normalizeDirectChat(chat: ChatItem, userId: string): ChatItem {
	const otherMember =
		chat.members.find(member => member.user.id !== userId)?.user ??
		chat.members[0]?.user

	if (!otherMember) {
		return chat
	}

	return {
		...chat,
		chatName: otherMember.username || chat.chatName,
		avatarUrl: otherMember.avatarUrl ?? chat.avatarUrl ?? null
	}
}

function upsertDirectChat(chats: ChatItem[], nextChat: ChatItem): ChatItem[] {
	const remainingPinned = chats
		.filter(chat => chat.isPinned && chat.id !== nextChat.id)
		.sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0))
	const remainingUnpinned = chats.filter(
		chat => !chat.isPinned && chat.id !== nextChat.id
	)

	if (nextChat.isPinned) {
		return sortChatsWithPinned([
			...remainingPinned,
			nextChat,
			...remainingUnpinned
		])
	}

	return [...remainingPinned, nextChat, ...remainingUnpinned]
}

function hasDirectChatActivity(chat: ChatItem) {
	return !!chat.lastMessage || !!chat.draftMessages?.length
}

export function useDirectChats(searchQuery = '') {
	const [allChats, setAllChats] = useState<ChatItem[]>([])
	const [startedDirectChatIds, setStartedDirectChatIds] = useState<string[]>(
		[]
	)
	const [isRefreshingChats, setIsRefreshingChats] = useState(false)
	const { t } = useTranslation()
	const { userId } = useUser()

	const normalizedSearchTerm = searchQuery.trim()
	const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 1500)
	const chatFilters = useMemo(
		() =>
			debouncedSearchTerm
				? { searchTerm: debouncedSearchTerm, take: 10 }
				: { take: 10 },
		[debouncedSearchTerm]
	)

	const {
		data: allChatsData,
		loading: isLoadingChats,
		refetch: refetchChats
	} = useFindAllChatsByUserQuery({
		variables: { filters: chatFilters },
		skip: !userId,
		fetchPolicy: 'network-only'
	})

	const { data: updateChatData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !userId
	})
	const { data: deletedChatData } = useChatDeletedSubscription({
		variables: {
			groupId: '',
			userId
		},
		skip: !userId
	})

	const [deleteChatMutation] = useDeleteChatMutation({
		onCompleted() {
			Toast.show({ type: 'success', text1: t('chatDeleted') })
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: t('deleteError'),
				text2: error.message || t('somethingWentWrong')
			})
		}
	})

	const [pinChatMutation] = usePinChatMutation()
	const [unPinChatMutation] = useUnPinChatMutation()
	const [updatePinnedChatsOrderMutation] = useUpdatePinnedChatsOrderMutation()

	const handleDeleteChat = (chatId: string) => {
		deleteChatMutation({ variables: { chatId } })
		setAllChats(prev => prev.filter(chat => chat.id !== chatId))
		void forgetStartedDirectChat(userId, chatId)
	}

	const handlePinChat = async (chatId: string) => {
		try {
			await pinChatMutation({ variables: { chatId } })
			setAllChats(prev => {
				const updated = prev.map(chat =>
					chat.id === chatId
						? { ...chat, isPinned: true, pinnedOrder: 0 }
						: chat
				)
				return sortChatsWithPinned(updated)
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: t('pinChatError'),
				text2:
					error instanceof Error && error.message
						? error.message
						: t('somethingWentWrong')
			})
		}
	}

	const handleUnPinChat = async (chatId: string) => {
		try {
			await unPinChatMutation({ variables: { chatId } })
			setAllChats(prev => {
				const updated = prev.map(chat =>
					chat.id === chatId
						? { ...chat, isPinned: false, pinnedOrder: null }
						: chat
				)
				return sortChatsWithPinned(updated)
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: t('unpinChatError'),
				text2:
					error instanceof Error && error.message
						? error.message
						: t('somethingWentWrong')
			})
		}
	}

	const handleReorderPinnedChats = async (reorderedPinned: ChatItem[]) => {
		const unpinned = allChats.filter(chat => !chat.isPinned)
		const updatedPinned = reorderedPinned.map((chat, index) => ({
			...chat,
			pinnedOrder: index
		}))
		setAllChats([...updatedPinned, ...unpinned])

		try {
			await updatePinnedChatsOrderMutation({
				variables: {
					chatIds: reorderedPinned.map(chat => chat.id)
				}
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: t('reorderPinnedChatsError'),
				text2:
					error instanceof Error && error.message
						? error.message
						: t('somethingWentWrong')
			})
			refetchChats()
		}
	}

	const handleRefreshChats = useCallback(async () => {
		if (!userId) return
		setIsRefreshingChats(true)
		try {
			await Promise.all([
				refetchChats({ filters: chatFilters }),
				loadStartedDirectChats(userId).then(setStartedDirectChatIds)
			])
		} finally {
			setIsRefreshingChats(false)
		}
	}, [chatFilters, refetchChats, userId])

	useEffect(() => {
		setAllChats([])
		setStartedDirectChatIds([])
	}, [userId])

	useEffect(() => {
		if (!userId) return

		const loadStarted = async () => {
			setStartedDirectChatIds(await loadStartedDirectChats(userId))
		}

		void loadStarted()
	}, [userId])

	useEffect(() => {
		if (!allChatsData?.findAllChatsByUser) return

		const directChats = allChatsData.findAllChatsByUser
			.map(cloneChat)
			.filter(chat => !chat.isGroup)
			.filter(
				chat =>
					chat.isSecret ||
					hasDirectChatActivity(chat) ||
					startedDirectChatIds.includes(chat.id)
			)
			.map(chat => normalizeDirectChat(chat, userId))

		setAllChats(sortChatsWithPinned(directChats))
	}, [allChatsData, startedDirectChatIds, userId])

	useFocusEffect(
		useCallback(() => {
			void handleRefreshChats()
		}, [handleRefreshChats])
	)

	useEffect(() => {
		return chatEvents.onLeave(leftChatId => {
			setAllChats(prev => prev.filter(chat => chat.id !== leftChatId))
		})
	}, [])

	useEffect(() => {
		if (!updateChatData?.chatUpdated) return
		if (updateChatData.chatUpdated.isGroup) return

		const incomingChat = cloneChat(updateChatData.chatUpdated as ChatItem)

		if (userId) {
			setStartedDirectChatIds(prev =>
				prev.includes(incomingChat.id)
					? prev
					: [...prev, incomingChat.id]
			)
			void markDirectChatStarted(userId, incomingChat.id)
		}

		setAllChats(prev => {
			const previousChat = prev.find(chat => chat.id === incomingChat.id)

			if (!previousChat) {
				void refetchChats()
				return upsertDirectChat(
					prev,
					normalizeDirectChat(incomingChat, userId)
				)
			}

			return upsertDirectChat(
				prev,
				normalizeDirectChat(
					{
						...previousChat,
						...incomingChat,
						members: incomingChat.members?.length
							? incomingChat.members
							: previousChat.members
					},
					userId
				)
			)
		})
	}, [refetchChats, updateChatData, userId])

	useEffect(() => {
		const deletedChat = deletedChatData?.chatDeleted as
			| ChatDeletedSubscription['chatDeleted']
			| undefined
		if (!deletedChat) return

		setAllChats(prev => prev.filter(chat => chat.id !== deletedChat.id))

		if (userId) {
			setStartedDirectChatIds(prev =>
				prev.filter(chatId => chatId !== deletedChat.id)
			)
			void forgetStartedDirectChat(userId, deletedChat.id)
		}
	}, [deletedChatData, userId])

	const pinnedChats = allChats.filter(chat => chat.isPinned)
	const unpinnedChats = allChats.filter(chat => !chat.isPinned)

	return {
		allChats,
		pinnedChats,
		unpinnedChats,
		isLoadingChats,
		isRefreshingChats,
		handleRefreshChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	}
}
