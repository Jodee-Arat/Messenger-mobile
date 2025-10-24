import { createId } from '@paralleldrive/cuid2'
import * as FileSystem from 'expo-file-system'

import {
	FindAllChatsByGroupQuery,
	FindAllUsersQuery
} from '@/graphql/generated/output'

const CHATS_FILE = FileSystem.documentDirectory + 'secret_chats.json'

// Создание нового чата
export async function createSecretChat(
	chatName: string,
	users: FindAllUsersQuery['findAllUsers']
) {
	try {
		// Проверяем, существует ли файл
		const fileInfo = await FileSystem.getInfoAsync(CHATS_FILE)
		let chats: FindAllChatsByGroupQuery['findAllChatsByGroup'] = []

		if (fileInfo.exists) {
			const content = await FileSystem.readAsStringAsync(CHATS_FILE)
			chats = JSON.parse(content)
		}

		// Создаём новый чат
		const newChat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0] = {
			id: createId(),
			chatName,
			updatedAt: new Date().toISOString(),
			members: users.map(user => ({
				user: {
					id: user.id,
					username: user.username,
					avatarUrl: user.avatarUrl
				}
			}))
		}

		chats.push(newChat)

		// Сохраняем в файл
		await FileSystem.writeAsStringAsync(
			CHATS_FILE,
			JSON.stringify(chats, null, 2)
		)

		console.log('✅ Новый секретный чат создан:', newChat)
		return newChat
	} catch (error) {
		console.error('❌ Ошибка при создании чата:', error)
		throw error
	}
}

// Загрузка всех чатов
export async function loadAllSecretChats(): Promise<
	FindAllChatsByGroupQuery['findAllChatsByGroup']
> {
	try {
		const fileInfo = await FileSystem.getInfoAsync(CHATS_FILE)
		if (!fileInfo.exists) return []

		const content = await FileSystem.readAsStringAsync(CHATS_FILE)
		const chats: FindAllChatsByGroupQuery['findAllChatsByGroup'] =
			JSON.parse(content)

		return chats
	} catch (error) {
		console.error('❌ Ошибка при загрузке чатов:', error)
		return []
	}
}

export async function deleteSecretChat(groupId: string, chatId: string) {
	try {
		const chats = await loadAllSecretChats()
		const filteredChats = chats.filter(chat => chat.id !== chatId)
		await FileSystem.writeAsStringAsync(
			CHATS_FILE,
			JSON.stringify(filteredChats, null, 2)
		)
		console.log(`🗑️ Секретный чат ${chatId} удалён из группы ${groupId}`)
	} catch (error) {
		console.error('❌ Ошибка при удалении чата:', error)
	}
}

// // Добавление сообщения в чат
// export async function addMessageToChat(chatId: string, message: SecretMessage) {
//   try {
//     const chats = await loadAllSecretChats()
//     const index = chats.findIndex(c => c.id === chatId)
//     if (index === -1) throw new Error('Chat not found')

//     chats[index].messages.push(message)

//     await FileSystem.writeAsStringAsync(CHATS_FILE, JSON.stringify(chats, null, 2))
//     console.log('💬 Сообщение добавлено в чат', chatId)
//   } catch (error) {
//     console.error('Ошибка при добавлении сообщения:', error)
//   }
// }
