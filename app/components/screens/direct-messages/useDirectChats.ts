import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'

import {
	FindAllChatsByUserQuery,
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
		.filter(c => c.isPinned)
		.sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0))
	const unpinned = chats.filter(c => !c.isPinned)
	return [...pinned, ...unpinned]
}

export function useDirectChats() {
	const [allChats, setAllChats] = useState<ChatItem[]>([])
	const { userId } = useUser()

	// ── Query ────────────────────────────────────────────────
	const {
		data: allChatsData,
		loading: isLoadingChats,
		refetch: refetchChats
	} = useFindAllChatsByUserQuery({
		variables: { filters: {} },
		fetchPolicy: 'network-only'
	})

	// ── Subscription ─────────────────────────────────────────
	const { data: updateChatData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !userId
	})

	// ── Mutations ────────────────────────────────────────────
	const [deleteChatMutation] = useDeleteChatMutation({
		onCompleted() {
			Toast.show({ type: 'success', text1: 'Chat deleted' })
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Delete error',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const [pinChatMutation] = usePinChatMutation()
	const [unPinChatMutation] = useUnPinChatMutation()
	const [updatePinnedChatsOrderMutation] = useUpdatePinnedChatsOrderMutation()

	// ── Handlers ─────────────────────────────────────────────
	const handleDeleteChat = (chatId: string) => {
		deleteChatMutation({ variables: { chatId } })
		setAllChats(prev => prev.filter(c => c.id !== chatId))
	}

	const handlePinChat = async (chatId: string) => {
		try {
			await pinChatMutation({ variables: { chatId } })
			setAllChats(prev => {
				const updated = prev.map(c =>
					c.id === chatId
						? { ...c, isPinned: true, pinnedOrder: 0 }
						: c
				)
				return sortChatsWithPinned(updated)
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Pin error',
				text2: String(error) || 'Something went wrong'
			})
		}
	}

	const handleUnPinChat = async (chatId: string) => {
		try {
			await unPinChatMutation({ variables: { chatId } })
			setAllChats(prev => {
				const updated = prev.map(c =>
					c.id === chatId
						? { ...c, isPinned: false, pinnedOrder: null }
						: c
				)
				return sortChatsWithPinned(updated)
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Unpin error',
				text2: String(error) || 'Something went wrong'
			})
		}
	}

	const handleReorderPinnedChats = async (reorderedPinned: ChatItem[]) => {
		const unpinned = allChats.filter(c => !c.isPinned)
		const updatedPinned = reorderedPinned.map((c, i) => ({
			...c,
			pinnedOrder: i
		}))
		setAllChats([...updatedPinned, ...unpinned])

		try {
			await updatePinnedChatsOrderMutation({
				variables: {
					chatIds: reorderedPinned.map(c => c.id)
				}
			})
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Reorder error',
				text2: String(error) || 'Something went wrong'
			})
			refetchChats()
		}
	}

	// ── Effects ──────────────────────────────────────────────
	useEffect(() => {
		if (!allChatsData?.findAllChatsByUser) return
		const dmChats = allChatsData.findAllChatsByUser.filter(c => !c.isGroup)
		setAllChats(sortChatsWithPinned(dmChats))
	}, [allChatsData])

	// Remove chat from local state when the current user leaves
	useEffect(() => {
		return chatEvents.onLeave(leftChatId => {
			setAllChats(prev => prev.filter(c => c.id !== leftChatId))
		})
	}, [])

	useEffect(() => {
		if (!updateChatData?.chatUpdated) return
		const { members: _m, ...updatedFields } = updateChatData.chatUpdated
		if (updatedFields.isGroup) return // skip group chats

		setAllChats(prev => {
			const exists = prev.some(c => c.id === updatedFields.id)
			if (exists) {
				return sortChatsWithPinned(
					prev.map(c =>
						c.id === updatedFields.id
							? { ...c, ...updatedFields }
							: c
					)
				)
			}
			refetchChats()
			return prev
		})
	}, [updateChatData])

	const pinnedChats = allChats.filter(c => c.isPinned)
	const unpinnedChats = allChats.filter(c => !c.isPinned)

	return {
		allChats,
		pinnedChats,
		unpinnedChats,
		isLoadingChats,
		handleDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	}
}
