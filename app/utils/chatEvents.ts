type Listener = (chatId: string) => void

const listeners = new Set<Listener>()

export const chatEvents = {
	emitLeave(chatId: string) {
		listeners.forEach(fn => fn(chatId))
	},
	onLeave(fn: Listener) {
		listeners.add(fn)
		return () => {
			listeners.delete(fn)
		}
	}
}
