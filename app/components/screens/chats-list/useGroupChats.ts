import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'
import {
	createSecretChat,
	deleteSecretChat,
	updateSecretChatUpdatedAt
} from '@/utils/secret-chat/secretChat'

import {
	FindAllChatsByGroupQuery,
	useChatAddedSubscription,
	useChatDeletedSubscription,
	useChatUpdatedSubscription,
	useDeleteChatMutation,
	useFindAllChatsByGroupQuery,
	usePinChatMutation,
	useUnPinChatMutation,
	useUpdatePinnedChatsOrderMutation
} from '@/graphql/generated/output'

type ChatItem = FindAllChatsByGroupQuery['findAllChatsByGroup'][0]

function sortChatsWithPinned(chats: ChatItem[]): ChatItem[] {
	const pinned = chats
		.filter(c => c.isPinned)
		.sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0))
	const unpinned = chats.filter(c => !c.isPinned)
	return [...pinned, ...unpinned]
}

export function useGroupChats(groupId: string) {
	const [allChats, setAllChats] = useState<ChatItem[]>([])
	const { userId } = useUser()

	// ── Queries ──────────────────────────────────────────────
	const {
		data: allChatsData,
		loading: isLoadingFindAllChats,
		refetch: refetchChats
	} = useFindAllChatsByGroupQuery({
		variables: { filters: {}, groupId },
		fetchPolicy: 'network-only'
	})

	// ── Subscriptions ────────────────────────────────────────
	const { data: newChatData } = useChatAddedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})

	const { data: deletedChatData } = useChatDeletedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})

	// это надо переписать и добавить на сервер в secret update
	const { data: updateChatData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !(userId && groupId)
	})

	// ── Mutations ────────────────────────────────────────────
	const [deleteChat, { loading: isLoadingDeleteChat }] =
		useDeleteChatMutation({
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

	// Handles
	const handleDeleteChat = (chatId: string) => {
		deleteChat({ variables: { chatId } })
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
		if (!allChatsData?.findAllChatsByGroup) return
		setAllChats(sortChatsWithPinned(allChatsData.findAllChatsByGroup))
	}, [allChatsData])

	useEffect(() => {
		if (!newChatData?.chatAdded) return

		const addNewChat = async () => {
			try {
				if (allChats.some(c => c.id === newChatData.chatAdded.id))
					return

				if (newChatData.chatAdded.isSecret) {
					await createSecretChat(newChatData.chatAdded)
				}
				setAllChats(prev =>
					sortChatsWithPinned([newChatData.chatAdded, ...prev])
				)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to create chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		addNewChat()
	}, [newChatData])

	useEffect(() => {
		if (!deletedChatData?.chatDeleted) return

		const handleDelete = async () => {
			try {
				await deleteSecretChat(groupId, deletedChatData.chatDeleted.id)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to delete chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		if (deletedChatData.chatDeleted.isSecret) {
			handleDelete()
		}

		setAllChats(prev =>
			prev.filter(chat => chat.id !== deletedChatData.chatDeleted.id)
		)
	}, [deletedChatData])

	useEffect(() => {
		if (!updateChatData?.chatUpdated) return

		const handleUpdate = async () => {
			try {
				await updateSecretChatUpdatedAt(
					groupId,
					updateChatData.chatUpdated.id
				)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to update chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		if (updateChatData.chatUpdated.isSecret) {
			handleUpdate()
		}

		setAllChats(prev =>
			sortChatsWithPinned([
				updateChatData.chatUpdated,
				...prev.filter(c => c.id !== updateChatData.chatUpdated.id)
			])
		)
	}, [updateChatData])

	const pinnedChats = allChats.filter(c => c.isPinned)
	const unpinnedChats = allChats.filter(c => !c.isPinned)

	// Remove chat from local state when the current user leaves
	useEffect(() => {
		return chatEvents.onLeave(leftChatId => {
			setAllChats(prev => prev.filter(c => c.id !== leftChatId))
		})
	}, [])

	return {
		allChats,
		pinnedChats,
		unpinnedChats,
		setAllChats,
		isLoadingFindAllChats,
		handleDeleteChat,
		isLoadingDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	}
}
