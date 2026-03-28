import AsyncStorage from '@react-native-async-storage/async-storage'

const getStartedDirectChatsStorageKey = (userId: string) =>
	`started-direct-chats:${userId}`

export const loadStartedDirectChats = async (
	userId?: string | null
): Promise<string[]> => {
	if (!userId) return []

	try {
		const raw = await AsyncStorage.getItem(
			getStartedDirectChatsStorageKey(userId)
		)
		if (!raw) return []

		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return []

		return parsed.filter((item): item is string => typeof item === 'string')
	} catch {
		return []
	}
}

export const markDirectChatStarted = async (
	userId: string,
	chatId: string
) => {
	const current = new Set(await loadStartedDirectChats(userId))
	current.add(chatId)
	await AsyncStorage.setItem(
		getStartedDirectChatsStorageKey(userId),
		JSON.stringify([...current])
	)
}

export const forgetStartedDirectChat = async (
	userId?: string | null,
	chatId?: string | null
) => {
	if (!userId || !chatId) return

	const current = new Set(await loadStartedDirectChats(userId))
	if (!current.has(chatId)) return

	current.delete(chatId)
	await AsyncStorage.setItem(
		getStartedDirectChatsStorageKey(userId),
		JSON.stringify([...current])
	)
}
