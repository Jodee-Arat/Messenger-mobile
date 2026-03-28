import { ForwardedMessageType } from '@/types/forward/forwarded-message.type'

/**
 * Temporary in-memory store for forwarded messages that should be
 * pre-populated in the draft when navigating to a target chat.
 *
 * Cleared as soon as the target chat consumes the value.
 */

type PendingForward = {
	chatId: string
	messages: ForwardedMessageType[]
	text: string
}

let pending: PendingForward | null = null

export function setPendingForward(value: PendingForward) {
	pending = value
}

export function consumePendingForward(chatId: string): PendingForward | null {
	if (pending && pending.chatId === chatId) {
		const value = pending
		pending = null
		return value
	}
	return null
}
