import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Toast from 'react-native-toast-message'

import { useUser } from '@/hooks/useUser'
import { getStoredSecretSessionId } from '@/services/secret/secret-session.service'

import { chatEvents } from '@/utils/chatEvents'
import {
	createSecretChat,
	deleteSecretChat,
	loadMyKeys,
	updateSecretChatUpdatedAt
} from '@/utils/secret-chat/secretChat'
import {
	isSecretChatBootstrapPending,
	onSecretChatBootstrapChange
} from '@/utils/secret-chat/secretChatBootstrap'

import {
	ChatUpdatedSubscription,
	FindAllChatsByGroupQuery,
	useAddSessionSharedSecretKeySubscription,
	useChatAddedSubscription,
	useChatDeletedSubscription,
	useChatUpdatedSubscription,
	useDeleteChatMutation,
	useFindAllChatsByGroupQuery,
	useGetSessionSharedSecretKeysLazyQuery,
	usePinChatMutation,
	useUnPinChatMutation,
	useUpdatePinnedChatsOrderMutation
} from '@/graphql/generated/output'

type ChatItem = FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
type ChatUpdatedItem = ChatUpdatedSubscription['chatUpdated']

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

function mergeUpdatedChat(
	previousChat: ChatItem,
	updatedChat: ChatUpdatedItem
): ChatItem {
	return {
		...previousChat,
		...updatedChat,
		members: updatedChat.members?.length
			? updatedChat.members
			: previousChat.members
	}
}

export function useGroupChats(groupId: string, searchTerm?: string) {
	const [allChatsRaw, setAllChatsRaw] = useState<ChatItem[]>([])
	const [allChats, setAllChats] = useState<ChatItem[]>([])
	const [disabledChatIds, setDisabledChatIds] = useState<string[]>([])
	const [isRefreshingChats, setIsRefreshingChats] = useState(false)
	const initialLoadDone = useRef(false)
	const readySecretChatIdsRef = useRef<Set<string>>(new Set())
	const { userId } = useUser()
	const [secretSessionId, setSecretSessionId] = useState<string | null>(null)

	useEffect(() => {
		let isCancelled = false

		void getStoredSecretSessionId().then(storedSecretSessionId => {
			if (isCancelled) return
			setSecretSessionId(storedSecretSessionId ?? null)
		})

		return () => {
			isCancelled = true
		}
	}, [userId])

	const {
		data: allChatsData,
		loading: isLoadingFindAllChats,
		refetch: refetchChats
	} = useFindAllChatsByGroupQuery({
		variables: {
			filters: { searchTerm: searchTerm || undefined },
			groupId
		},
		fetchPolicy: 'network-only'
	})

	const { data: newChatData } = useChatAddedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})

	const { data: deletedChatData } = useChatDeletedSubscription({
		variables: { userId, groupId },
		skip: !(userId && groupId)
	})

	const { data: updateChatData } = useChatUpdatedSubscription({
		variables: { userId },
		skip: !(userId && groupId)
	})

	const { data: sharedKeyData } = useAddSessionSharedSecretKeySubscription({
		variables: {
			userId,
			secretSessionId: secretSessionId ?? ''
		},
		skip: !userId || !secretSessionId
	})
	const [getSessionSharedSecretKeys] = useGetSessionSharedSecretKeysLazyQuery({
		fetchPolicy: 'network-only'
	})

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

	const handleDeleteChat = (chatId: string) => {
		deleteChat({ variables: { chatId } })
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
				text1: 'Pin error',
				text2: String(error) || 'Something went wrong'
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
				text1: 'Unpin error',
				text2: String(error) || 'Something went wrong'
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
				text1: 'Reorder error',
				text2: String(error) || 'Something went wrong'
			})
			refetchChats()
		}
	}

	const handleRefreshChats = useCallback(async () => {
		if (!groupId) return

		setIsRefreshingChats(true)
		try {
			await refetchChats()
		} finally {
			setIsRefreshingChats(false)
		}
	}, [groupId, refetchChats])

	const handleSilentRefreshChats = useCallback(async () => {
		if (!groupId) return
		await refetchChats()
	}, [groupId, refetchChats])

	const refreshSecretChatAvailability = useCallback(async () => {
		const nextDisabledIds: string[] = []
		if (!secretSessionId) {
			setDisabledChatIds(
				allChatsRaw.filter(chat => chat.isSecret).map(chat => chat.id)
			)
			return
		}

		try {
			for (const chat of allChatsRaw) {
				if (!chat.isSecret) continue

				if (isSecretChatBootstrapPending(groupId, chat.id)) {
					nextDisabledIds.push(chat.id)
					continue
				}

				if (!chat.groupId) {
					nextDisabledIds.push(chat.id)
					continue
				}

				const localKeys = await loadMyKeys(chat.id, chat.groupId)
				if (
					localKeys?.sessionKeyHex?.length ||
					readySecretChatIdsRef.current.has(chat.id)
				) {
					continue
				}

				const queuedSharedKeys =
					(
						await getSessionSharedSecretKeys({
							variables: {
								chatId: chat.id,
								secretSessionId
							},
							fetchPolicy: 'network-only'
						})
					).data?.getSessionSharedSecretKeys ?? []
				const hasQueuedSharedKey = queuedSharedKeys.length > 0

				if (hasQueuedSharedKey) {
					readySecretChatIdsRef.current.add(chat.id)
					continue
				}

				nextDisabledIds.push(chat.id)
			}
		} catch (error) {
			console.warn(
				'[SecretChat][ChatsList] failed to refresh secret chat availability:',
				error
			)
		}

		setDisabledChatIds(nextDisabledIds)
	}, [allChatsRaw, getSessionSharedSecretKeys, groupId, secretSessionId])

	useEffect(() => {
		if (!allChatsData?.findAllChatsByGroup) return

		initialLoadDone.current = true
		const nextChats = sortChatsWithPinned(
			allChatsData.findAllChatsByGroup.map(cloneChat)
		)
		setAllChatsRaw(nextChats)
		setAllChats(nextChats)
	}, [allChatsData])

	useEffect(() => {
		void refreshSecretChatAvailability()
	}, [refreshSecretChatAvailability])

	useEffect(() => {
		if (!disabledChatIds.length) return

		const timeoutId = setTimeout(() => {
			void refreshSecretChatAvailability()
		}, 1500)

		return () => clearTimeout(timeoutId)
	}, [disabledChatIds, refreshSecretChatAvailability])

	useFocusEffect(
		useCallback(() => {
			void handleSilentRefreshChats()
			void refreshSecretChatAvailability()
		}, [handleSilentRefreshChats, refreshSecretChatAvailability])
	)

	useEffect(() => {
		if (!newChatData?.chatAdded) return

		const addNewChat = async () => {
			try {
				const addedChat = cloneChat(newChatData.chatAdded as ChatItem)

				if (addedChat.isSecret) {
					await createSecretChat(newChatData.chatAdded)
				}

				setAllChatsRaw(prev => {
					const existingIndex = prev.findIndex(
						chat => chat.id === addedChat.id
					)

					if (existingIndex === -1) {
						return sortChatsWithPinned([addedChat, ...prev])
					}

					const next = [...prev]
					next[existingIndex] = {
						...next[existingIndex],
						...addedChat
					}
					return sortChatsWithPinned(next)
				})
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to create chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		void addNewChat()
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
			void handleDelete()
		}

		setAllChatsRaw(prev =>
			prev.filter(chat => chat.id !== deletedChatData.chatDeleted.id)
		)
		setAllChats(prev =>
			prev.filter(chat => chat.id !== deletedChatData.chatDeleted.id)
		)
		setDisabledChatIds(prev =>
			prev.filter(chatId => chatId !== deletedChatData.chatDeleted.id)
		)
	}, [deletedChatData, groupId])

	useEffect(() => {
		if (!updateChatData?.chatUpdated) return
		if (updateChatData.chatUpdated.groupId !== groupId) return

		const handleUpdate = async () => {
			try {
				await updateSecretChatUpdatedAt(groupId, updateChatData.chatUpdated.id)
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to update chat',
					text2: String(error || '') || 'Something went wrong'
				})
			}
		}

		if (updateChatData.chatUpdated.isSecret) {
			void handleUpdate()
		}

		setAllChatsRaw(prev => {
			const previousChat = prev.find(
				chat => chat.id === updateChatData.chatUpdated.id
			)

			if (!previousChat) {
				void refetchChats()
				return prev
			}

			const nextChat = mergeUpdatedChat(previousChat, updateChatData.chatUpdated)

			return sortChatsWithPinned([
				cloneChat(nextChat),
				...prev.filter(chat => chat.id !== nextChat.id)
			])
		})
	}, [groupId, refetchChats, updateChatData])

	useEffect(() => {
		return chatEvents.onLeave(leftChatId => {
			setAllChatsRaw(prev => prev.filter(chat => chat.id !== leftChatId))
			setAllChats(prev => prev.filter(chat => chat.id !== leftChatId))
			setDisabledChatIds(prev => prev.filter(chatId => chatId !== leftChatId))
		})
	}, [])

	useEffect(() => {
		return onSecretChatBootstrapChange(event => {
			if (event.groupId !== groupId) return
			void refreshSecretChatAvailability()
		})
	}, [groupId, refreshSecretChatAvailability])

	useEffect(() => {
		const chatId = sharedKeyData?.addSessionSharedSecretKey?.chatId
		if (!chatId) return
		readySecretChatIdsRef.current.add(chatId)
		void refreshSecretChatAvailability()
	}, [refreshSecretChatAvailability, sharedKeyData])

	const pinnedChats = useMemo(
		() => allChats.filter(chat => chat.isPinned),
		[allChats]
	)
	const unpinnedChats = useMemo(
		() => allChats.filter(chat => !chat.isPinned),
		[allChats]
	)

	return {
		allChats,
		pinnedChats,
		unpinnedChats,
		disabledChatIds,
		setAllChats,
		isInitialLoading: isLoadingFindAllChats && !initialLoadDone.current,
		isRefreshingChats,
		handleRefreshChats,
		handleDeleteChat,
		isLoadingDeleteChat,
		handlePinChat,
		handleUnPinChat,
		handleReorderPinnedChats
	}
}
