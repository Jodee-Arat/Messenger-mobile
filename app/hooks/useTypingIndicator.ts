import { useCallback, useRef, useState } from 'react'

import {
	useStartTypingMutation,
	useTypingStartedSubscription
} from '@/graphql/generated/output'

const TYPING_TIMEOUT_MS = 3000
const DEBOUNCE_MS = 2000

/**
 * Хук для индикатора набора текста:
 * - Подписка на событие «пользователь печатает» в конкретном чате
 * - Мутация для отправки «я печатаю» с дебаунсом (2 сек)
 * - Автоматический сброс через 3 сек, если не приходит новое событие
 */
export function useTypingIndicator(chatId: string, userId: string) {
	const [typingUsers, setTypingUsers] = useState<
		Map<string, { username: string; timeout: NodeJS.Timeout }>
	>(new Map())
	const lastSentRef = useRef<number>(0)

	const [startTypingMutation] = useStartTypingMutation()

	// Подписка: получаем события «пользователь печатает»
	useTypingStartedSubscription({
		variables: { chatId, userId },
		onData: ({ data }) => {
			const info = data?.data?.typingStarted
			if (!info) return

			setTypingUsers(prev => {
				const next = new Map(prev)

				// Сбросить предыдущий таймер для этого пользователя
				const existing = next.get(info.userId)
				if (existing) clearTimeout(existing.timeout)

				// Установить новый таймер: если через 3 сек не будет нового события — убрать
				const timeout = setTimeout(() => {
					setTypingUsers(p => {
						const updated = new Map(p)
						updated.delete(info.userId)
						return updated
					})
				}, TYPING_TIMEOUT_MS)

				next.set(info.userId, {
					username: info.username,
					timeout
				})
				return next
			})
		}
	})

	// Отправить «я печатаю» с дебаунсом
	const sendTyping = useCallback(() => {
		const now = Date.now()
		if (now - lastSentRef.current < DEBOUNCE_MS) return
		lastSentRef.current = now

		startTypingMutation({ variables: { chatId } }).catch(() => {
			// Ошибки не критичны для typing indicator
		})
	}, [chatId, startTypingMutation])

	// Вернуть массив имён печатающих
	const typingUsernames = Array.from(typingUsers.values()).map(
		v => v.username
	)

	return {
		/** Список имён пользователей, которые сейчас печатают */
		typingUsernames,
		/** Вызывать при изменении текста в поле ввода */
		sendTyping
	}
}
