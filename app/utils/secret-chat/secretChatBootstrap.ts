type SecretChatBootstrapEvent = {
	groupId: string
	chatId: string
	pending: boolean
}

type Listener = (event: SecretChatBootstrapEvent) => void

const pendingChatsByGroup = new Map<string, Set<string>>()
const listeners = new Set<Listener>()

function emit(event: SecretChatBootstrapEvent) {
	listeners.forEach(listener => {
		listener(event)
	})
}

export function markSecretChatBootstrapPending(groupId: string, chatId: string) {
	const pendingChats = pendingChatsByGroup.get(groupId) ?? new Set<string>()
	pendingChats.add(chatId)
	pendingChatsByGroup.set(groupId, pendingChats)
	emit({ groupId, chatId, pending: true })
}

export function clearSecretChatBootstrapPending(groupId: string, chatId: string) {
	const pendingChats = pendingChatsByGroup.get(groupId)
	if (!pendingChats?.has(chatId)) return

	pendingChats.delete(chatId)
	if (pendingChats.size === 0) {
		pendingChatsByGroup.delete(groupId)
	}

	emit({ groupId, chatId, pending: false })
}

export function notifySecretChatReady(groupId: string, chatId: string) {
	emit({ groupId, chatId, pending: false })
}

export function isSecretChatBootstrapPending(groupId: string, chatId: string) {
	return pendingChatsByGroup.get(groupId)?.has(chatId) ?? false
}

export function onSecretChatBootstrapChange(listener: Listener) {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}
