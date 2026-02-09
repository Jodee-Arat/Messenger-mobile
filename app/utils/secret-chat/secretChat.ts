import * as FileSystem from 'expo-file-system'

import { SecretChatData } from '@/hooks/useSecretChat'

import { MessageType } from '@/types/message.type'

import {
	FindAllChatsByGroupQuery,
	GetPreKeysQuery
} from '@/graphql/generated/output'
import { PreKeyBundleClient, PreKeyBundleServer } from '@/libs/e2ee/gost'

export const FILE = {
	MESSAGES: 'messages.json',
	CHAT: 'chat.json',
	KEYS: 'keys.json',
	MY_KEYS: 'my-keys.json',
	PRE_KEYS: 'pre-keys.json'
}

const BASE_DIRECTORY = FileSystem.documentDirectory

export type PreKeyBundle = {
	toServer: PreKeyBundleServer
	toStore: PreKeyBundleClient
}
export type MyKeys = {
	sessionKeyHex: Uint8Array<ArrayBufferLike>
}
// тут можно продумать ещё мб чтобы как-то сохранялись ключи при перезаходе в юзеровский аккаунт
// 💾 Сохранение моего PreKey в файл JSON
export async function upsertMyPreKeyJSON(preKey: PreKeyBundle) {
	const PRE_KEY_FILE = `${BASE_DIRECTORY}/${FILE.PRE_KEYS}`

	await FileSystem.writeAsStringAsync(
		PRE_KEY_FILE,
		JSON.stringify(preKey, null, 2)
	)
}

export async function loadMyPreKeyJSON(): Promise<PreKeyBundle | null> {
	const PRE_KEY_FILE = `${BASE_DIRECTORY}/${FILE.PRE_KEYS}`
	const fileInfo = await FileSystem.getInfoAsync(PRE_KEY_FILE)
	if (!fileInfo.exists) {
		return null
	}
	const content = await FileSystem.readAsStringAsync(PRE_KEY_FILE)

	return JSON.parse(content)
}

/**
 * 📁 Создание нового секретного чата (в отдельной папке внутри группы)
 */
export async function createSecretChat(
	chat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
) {
	try {
		const GROUP_DIRECTORY = `${BASE_DIRECTORY}${chat.groupId}`

		// Проверяем, что директория группы существует
		await FileSystem.makeDirectoryAsync(GROUP_DIRECTORY, {
			intermediates: true
		})

		const CHAT_DIRECTORY = `${GROUP_DIRECTORY}/${chat.id}`

		const isDirectoryExists = await FileSystem.getInfoAsync(CHAT_DIRECTORY)
		if (isDirectoryExists.exists) {
			return
		}

		await FileSystem.makeDirectoryAsync(CHAT_DIRECTORY, {
			intermediates: true
		})

		// Файл с данными чата
		const CHAT_FILE = `${CHAT_DIRECTORY}/${chat.id}.json`

		// Формируем объект чата
		const newChat: FindAllChatsByGroupQuery['findAllChatsByGroup'][0] = {
			id: chat.id,
			chatName: chat.chatName,
			isGroup: chat.isGroup,
			groupId: chat.groupId,
			updatedAt: chat.updatedAt,
			lastMessageAt: chat.lastMessageAt,
			isSecret: true,
			members: chat.members
		}

		// Записываем чат в файл
		await FileSystem.writeAsStringAsync(
			CHAT_FILE,
			JSON.stringify(newChat, null, 2)
		)

		console.log(
			`Новый секретный чат создан в группе ${chat.groupId}:`,
			newChat
		)
		return newChat
	} catch (error) {
		console.error('Ошибка при создании чата:', error)
		throw 'Ошибка при создании чата:' + error
	}
}

/**
 * 📂 Загрузка всех чатов конкретной группы
 */
export async function loadAllSecretChats(
	groupId: string
): Promise<FindAllChatsByGroupQuery['findAllChatsByGroup']> {
	try {
		const GROUP_DIRECTORY = `${BASE_DIRECTORY}${groupId}`

		const groupInfo = await FileSystem.getInfoAsync(GROUP_DIRECTORY)
		if (!groupInfo.exists) return []

		// Получаем список всех подпапок (каждая — это чат)
		const chatFolders = await FileSystem.readDirectoryAsync(GROUP_DIRECTORY)
		const chats: FindAllChatsByGroupQuery['findAllChatsByGroup'] = []

		for (const folderName of chatFolders) {
			const CHAT_DIRECTORY = `${GROUP_DIRECTORY}/${folderName}`
			const CHAT_FILE = `${CHAT_DIRECTORY}/${folderName}.json`

			const fileInfo = await FileSystem.getInfoAsync(CHAT_FILE)
			if (!fileInfo.exists) continue

			const content = await FileSystem.readAsStringAsync(CHAT_FILE)
			const chat = JSON.parse(content) as SecretChatData
			chats.push(chat)
		}

		return chats
	} catch (error) {
		console.error('Ошибка при загрузке чатов:', error)
		return []
	}
}

/**
 * 🗑️ Удаление чата (вместе с его папкой)
 */
export async function deleteSecretChat(groupId: string, chatId: string) {
	try {
		const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
		const dirInfo = await FileSystem.getInfoAsync(CHAT_DIRECTORY)

		if (!dirInfo.exists) {
			console.warn(`Папка чата ${chatId} не найдена в группе ${groupId}`)
			return
		}

		await FileSystem.deleteAsync(CHAT_DIRECTORY, { idempotent: true })
		console.log(`Секретный чат ${chatId} удалён из группы ${groupId}`)
	} catch (error) {
		console.error('Ошибка при удалении чата:', error)
	}
}

export async function updateSecretChatUpdatedAt(
	groupId: string,
	chatId: string
) {
	try {
		const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
		const CHAT_FILE = `${CHAT_DIRECTORY}/${chatId}.json`
		const fileInfo = await FileSystem.getInfoAsync(CHAT_FILE)
		if (!fileInfo.exists) {
			console.warn(`Файл чата ${chatId} не найден в группе ${groupId}`)
			return
		}

		await FileSystem.writeAsStringAsync(
			CHAT_FILE,
			JSON.stringify(
				{
					...JSON.parse(
						await FileSystem.readAsStringAsync(CHAT_FILE)
					),
					updatedAt: new Date().toISOString()
				},
				null,
				2
			)
		)
	} catch (error) {
		console.error('Ошибка при обновлении чата:', error)
	}
}

export async function fileExist(
	chatId: string,
	groupId: string,
	fileName: string
) {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${fileName}`
	const fileInfo = await FileSystem.getInfoAsync(FILE_PATH)
	if (!fileInfo.exists) {
		return false
	} else {
		return true
	}
}

export async function createMyKey(
	chatId: string,
	groupId: string,
	userId: string,
	sessionKey: Uint8Array<ArrayBufferLike>
) {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${FILE.MY_KEYS}`

	await FileSystem.writeAsStringAsync(
		FILE_PATH,
		// Храним как массив чисел, чтобы корректно восстановить Uint8Array
		JSON.stringify(
			{ sessionKeyHex: Array.from(sessionKey as Uint8Array) },
			null,
			2
		)
	)
}

// сессионный ключ
export async function loadMyKeys(
	chatId: string,
	groupId: string
): Promise<MyKeys | null> {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${FILE.MY_KEYS}`
	const fileInfo = await FileSystem.getInfoAsync(FILE_PATH)
	if (!fileInfo.exists) {
		// console.warn(`Файл ключей ${FILE.MY_KEYS} не найден в чате ${chatId}`)
		return null
	}

	const content = await FileSystem.readAsStringAsync(FILE_PATH)
	try {
		const parsed = JSON.parse(content) as any
		let arr: number[] | null = null

		if (Array.isArray(parsed?.sessionKeyHex)) {
			arr = parsed.sessionKeyHex as number[]
		} else if (
			parsed?.sessionKeyHex &&
			typeof parsed.sessionKeyHex === 'object'
		) {
			// Случай сериализации Uint8Array в объект вида {"0":n, "1":n, ...}
			const keys = Object.keys(parsed.sessionKeyHex)
				.map(k => Number(k))
				.sort((a, b) => a - b)
			arr = keys.map(k => Number(parsed.sessionKeyHex[String(k)]))
		} else if (Array.isArray(parsed?.sessionKey)) {
			// Миграция старого поля
			arr = parsed.sessionKey as number[]
		}

		if (arr && arr.length > 0) {
			const u8 = new Uint8Array(arr)
			return { sessionKeyHex: u8 }
		}

		return null
	} catch (e) {
		console.warn('Не удалось прочитать ключи из файла:', e)
		return null
	}
}

export async function loadChatData(
	chatId: string,
	groupId: string
): Promise<SecretChatData | null> {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const CHAT_FILE = `${CHAT_DIRECTORY}/${FILE.CHAT}`
	const fileInfo = await FileSystem.getInfoAsync(CHAT_FILE)
	if (!fileInfo.exists) {
		console.warn(`Файл чата ${chatId} не найден в группе ${groupId}`)
		return null
	}

	const content = await FileSystem.readAsStringAsync(CHAT_FILE)
	return JSON.parse(content)
}

export async function addMessages(
	messages: MessageType[],
	chatId: string,
	groupId: string
) {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${FILE.MESSAGES}`
	let existingMessages: MessageType[] = []
	const fileInfo = await FileSystem.getInfoAsync(FILE_PATH)
	if (fileInfo.exists) {
		const content = await FileSystem.readAsStringAsync(FILE_PATH)
		existingMessages = JSON.parse(content) as MessageType[]
	}
	const updatedMessages = [...existingMessages, ...messages]

	await FileSystem.writeAsStringAsync(
		FILE_PATH,
		JSON.stringify(updatedMessages, null, 2)
	)
}

/**
 * 📥 Загрузка сообщений чата из локального файла
 */
export async function loadMessages(
	chatId: string,
	groupId: string
): Promise<MessageType[]> {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${FILE.MESSAGES}`

	const fileInfo = await FileSystem.getInfoAsync(FILE_PATH)

	if (!fileInfo.exists) {
		return []
	}
	try {
		const content = await FileSystem.readAsStringAsync(FILE_PATH)
		const messages = JSON.parse(content) as MessageType[]

		return Array.isArray(messages) ? messages : []
	} catch (e) {
		console.warn('Не удалось прочитать сообщения из файла:', e)
		return []
	}
}

/**
 * 💾 Полная перезапись сообщений чата в локальный файл
 */
export async function saveMessages(
	messages: MessageType[],
	chatId: string,
	groupId: string
) {
	const CHAT_DIRECTORY = `${BASE_DIRECTORY}${groupId}/${chatId}`
	const FILE_PATH = `${CHAT_DIRECTORY}/${FILE.MESSAGES}`

	const dirInfo = await FileSystem.getInfoAsync(CHAT_DIRECTORY)
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(CHAT_DIRECTORY, {
			intermediates: true
		})
	}

	await FileSystem.writeAsStringAsync(
		FILE_PATH,
		JSON.stringify(messages, null, 2)
	)
}
