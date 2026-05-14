import { Directory, File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'

import { SecretChatData } from '@/hooks/useSecretChat'

import { MessageType } from '@/types/message.type'

import { notifySecretChatReady } from '@/utils/secret-chat/secretChatBootstrap'

import {
	FindAllChatsByGroupQuery,
	FindChatByChatIdQuery
} from '@/graphql/generated/output'
import {
	DmRatchetsState,
	GroupSenderKeysState,
	PreKeyBundleClient,
	PreKeyBundleServer
} from '@/libs/e2ee/gost'

export const FILE = {
	MESSAGES: 'messages.json',
	CHAT: 'chat.json',
	KEYS: 'keys.json',
	MY_KEYS: 'my-keys.json',
	DM_RATCHETS: 'dm-ratchets.json',
	SENDER_KEYS: 'sender-keys.json',
	PRE_KEYS: 'pre-keys.json'
}

const BASE_DIRECTORY = Paths.document
const SECURE_KEY_PRE_KEYS = 'secret.preKeys'
const SECURE_KEY_INDEX = 'secret.index'
const INTERNAL_DOCUMENT_DIRS_TO_KEEP = new Set(['downloads'])
const SECRET_CACHE_DIRS = [
	'secret-attachments',
	'secret-attachments-cache',
	'secret-download'
]

export type PreKeyBundle = {
	toServer: PreKeyBundleServer
	toStore: PreKeyBundleClient
}
export type MyKeys = {
	sessionKeyHex: Uint8Array<ArrayBufferLike>
}

const normalizeMyKeys = (parsed: any): MyKeys | null => {
	try {
		let arr: number[] | null = null

		if (Array.isArray(parsed?.sessionKeyHex)) {
			arr = parsed.sessionKeyHex as number[]
		} else if (
			parsed?.sessionKeyHex &&
			typeof parsed.sessionKeyHex === 'object'
		) {
			const keys = Object.keys(parsed.sessionKeyHex)
				.map(k => Number(k))
				.sort((a, b) => a - b)
			arr = keys.map(k => Number(parsed.sessionKeyHex[String(k)]))
		} else if (Array.isArray(parsed?.sessionKey)) {
			arr = parsed.sessionKey as number[]
		}

		if (arr && arr.length > 0) {
			return { sessionKeyHex: new Uint8Array(arr) }
		}

		return null
	} catch (e) {
		console.warn('Не удалось прочитать ключи:', e)
		return null
	}
}

const getGroupDirectory = (groupId: string) =>
	new Directory(BASE_DIRECTORY, groupId)

const getChatDirectory = (groupId: string, chatId: string) =>
	new Directory(getGroupDirectory(groupId), chatId)

const getSecretChatFile = (groupId: string, chatId: string) =>
	new File(getChatDirectory(groupId, chatId), `${chatId}.json`)

const getChatFile = (groupId: string, chatId: string, fileName: string) =>
	new File(getChatDirectory(groupId, chatId), fileName)

const getRootFile = (fileName: string) => new File(BASE_DIRECTORY, fileName)

const toSecureStoreKeyPart = (value: string) =>
	value.replace(/[^A-Za-z0-9._-]/g, '_')

const getSessionKeySecureStoreKey = (groupId: string, chatId: string) =>
	`secret.sessionKey.${toSecureStoreKeyPart(groupId)}.${toSecureStoreKeyPart(chatId)}`

const getSenderKeysSecureStoreKey = (groupId: string, chatId: string) =>
	`secret.senderKeys.${toSecureStoreKeyPart(groupId)}.${toSecureStoreKeyPart(chatId)}`

const getDmRatchetsSecureStoreKey = (groupId: string, chatId: string) =>
	`secret.dmRatchets.${toSecureStoreKeyPart(groupId)}.${toSecureStoreKeyPart(chatId)}`

const readSecureIndex = async (): Promise<string[]> => {
	const raw = await SecureStore.getItemAsync(SECURE_KEY_INDEX)
	if (!raw) return []

	try {
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed)
			? parsed.filter((key): key is string => typeof key === 'string')
			: []
	} catch {
		return []
	}
}

const writeSecureIndex = async (keys: string[]) => {
	await SecureStore.setItemAsync(
		SECURE_KEY_INDEX,
		JSON.stringify(Array.from(new Set(keys)).sort())
	)
}

const trackSecureKey = async (key: string) => {
	const keys = await readSecureIndex()
	if (keys.includes(key)) return
	await writeSecureIndex([...keys, key])
}

const untrackSecureKey = async (key: string) => {
	const keys = await readSecureIndex()
	const next = keys.filter(item => item !== key)
	if (next.length === keys.length) return
	await writeSecureIndex(next)
}

const setSecureJson = async (key: string, data: unknown) => {
	await SecureStore.setItemAsync(key, JSON.stringify(data))
	await trackSecureKey(key)
}

const getSecureJson = async <T>(key: string): Promise<T | null> => {
	const raw = await SecureStore.getItemAsync(key)
	if (!raw) return null
	return JSON.parse(raw) as T
}

const deleteSecureKey = async (key: string) => {
	await SecureStore.deleteItemAsync(key)
	await untrackSecureKey(key)
}

const deleteFileIfExists = (file: File) => {
	if (file.exists) {
		file.delete()
	}
}

const ensureDirectory = (directory: Directory) => {
	if (!directory.exists) {
		directory.create({ intermediates: true, idempotent: true })
	}
}

const writeJson = (file: File, data: unknown) => {
	file.create({ intermediates: true, overwrite: true })
	file.write(JSON.stringify(data, null, 2))
}

const readJson = async <T>(file: File): Promise<T | null> => {
	if (!file.exists) {
		return null
	}

	return JSON.parse(await file.text()) as T
}

// тут можно продумать еще мб чтобы как-то сохранялись ключи при перезаходе в юзеровский аккаунт
//  Сохранение моего PreKey в файл JSON
export async function upsertMyPreKeyJSON(preKey: PreKeyBundle) {
	await SecureStore.setItemAsync(SECURE_KEY_PRE_KEYS, JSON.stringify(preKey))
	deleteFileIfExists(getRootFile(FILE.PRE_KEYS))
}

export async function loadMyPreKeyJSON(): Promise<PreKeyBundle | null> {
	const stored = await getSecureJson<PreKeyBundle>(SECURE_KEY_PRE_KEYS)
	if (stored) return stored

	const legacyFile = getRootFile(FILE.PRE_KEYS)
	const legacy = await readJson<PreKeyBundle>(legacyFile)
	if (!legacy) return null

	await SecureStore.setItemAsync(SECURE_KEY_PRE_KEYS, JSON.stringify(legacy))
	deleteFileIfExists(legacyFile)
	return legacy
}

export async function clearLocalSecretChatData() {
	try {
		const indexedSecureKeys = await readSecureIndex()
		for (const key of indexedSecureKeys) {
			await SecureStore.deleteItemAsync(key)
		}
		await SecureStore.deleteItemAsync(SECURE_KEY_PRE_KEYS)
		await SecureStore.deleteItemAsync(SECURE_KEY_INDEX)

		for (const entry of BASE_DIRECTORY.list()) {
			if (!(entry instanceof Directory)) continue
			for (const chatEntry of entry.list()) {
				if (!(chatEntry instanceof Directory)) continue
				await SecureStore.deleteItemAsync(
					getSessionKeySecureStoreKey(entry.name, chatEntry.name)
				)
				await SecureStore.deleteItemAsync(
					getSenderKeysSecureStoreKey(entry.name, chatEntry.name)
				)
				await SecureStore.deleteItemAsync(
					getDmRatchetsSecureStoreKey(entry.name, chatEntry.name)
				)
			}
		}

		for (const fileName of [
			FILE.PRE_KEYS,
			FILE.MY_KEYS,
			FILE.KEYS,
			FILE.DM_RATCHETS,
			FILE.SENDER_KEYS
		]) {
			const file = getRootFile(fileName)
			deleteFileIfExists(file)
		}

		for (const entry of BASE_DIRECTORY.list()) {
			if (
				entry instanceof Directory &&
				!INTERNAL_DOCUMENT_DIRS_TO_KEEP.has(entry.name)
			) {
				entry.delete()
			}
		}

		for (const directoryName of SECRET_CACHE_DIRS) {
			const directory = new Directory(Paths.cache, directoryName)
			if (directory.exists) {
				directory.delete()
			}
		}
	} catch (error) {
		console.warn('[SecretChat] Failed to clear local secret data', error)
	}
}

/**
 *  Создание нового секретного чата (в отдельной папке внутри группы)
 */
export async function createSecretChat(
	chat:
		| FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
		| FindChatByChatIdQuery['findChatByChatId'],
	overwrite = false
) {
	try {
		const groupId = chat.groupId
		const chatId = chat.id
		if (!groupId || !chatId) {
			throw new Error('Secret chat metadata is incomplete')
		}

		const groupDirectory = getGroupDirectory(groupId)
		ensureDirectory(groupDirectory)

		const chatDirectory = getChatDirectory(groupId, chatId)
		if (chatDirectory.exists && !overwrite) {
			return
		}
		ensureDirectory(chatDirectory)

		const newChat = {
			id: chat.id,
			chatName: chat.chatName,
			avatarUrl: chat.avatarUrl ?? null,
			isGroup: chat.isGroup,
			groupId: chat.groupId,
			updatedAt: chat.updatedAt,
			lastMessageAt: (chat as any).lastMessageAt ?? null,
			isSecret: true,
			requireTotp: (chat as any).requireTotp ?? false,
			description: (chat as any).description ?? null,
			isPinned: (chat as any).isPinned ?? false,
			pinnedOrder: (chat as any).pinnedOrder ?? null,
			members: chat.members,
			lastMessage: (chat as any).lastMessage ?? null,
			draftMessages: (chat as any).draftMessages ?? []
		}

		writeJson(getSecretChatFile(groupId, chatId), newChat)

		return newChat as unknown as
			| FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
			| FindChatByChatIdQuery['findChatByChatId']
	} catch (error) {
		console.error('Ошибка при создании чата:', error)
		throw 'Ошибка при создании чата:' + error
	}
}

/**
 *  Загрузка всех чатов конкретной группы
 */
export async function loadAllSecretChats(
	groupId: string
): Promise<FindAllChatsByGroupQuery['findAllChatsByGroup']> {
	try {
		const groupDirectory = getGroupDirectory(groupId)

		if (!groupDirectory.exists) return []

		const chatFolders = groupDirectory
			.list()
			.filter((entry): entry is Directory => entry instanceof Directory)
		const chats: FindAllChatsByGroupQuery['findAllChatsByGroup'] = []

		for (const chatFolder of chatFolders) {
			const chatFile = new File(chatFolder, `${chatFolder.name}.json`)
			const chat = await readJson<SecretChatData>(chatFile)
			if (!chat) {
				continue
			}

			chats.push(
				chat as unknown as FindAllChatsByGroupQuery['findAllChatsByGroup'][0]
			)
		}

		return chats
	} catch (error) {
		console.error('Ошибка при загрузке чатов:', error)
		return []
	}
}

/**
 *  Удаление только сессионного ключа (my-keys.json) без удаления всего чата.
 * Используется при ротации ключей (leave / remove member).
 */
export async function deleteMyKeys(chatId: string, groupId: string) {
	try {
		await deleteSecureKey(getSessionKeySecureStoreKey(groupId, chatId))
		const file = getChatFile(groupId, chatId, FILE.MY_KEYS)
		if (file.exists) {
			file.delete()
			console.log(`[SecretChat] my-keys.json удален для чата ${chatId}`)
		}
	} catch (error) {
		console.error('[SecretChat] Ошибка при удалении my-keys.json:', error)
	}
}

export async function deleteDmRatchets(chatId: string, groupId: string) {
	try {
		await deleteSecureKey(getDmRatchetsSecureStoreKey(groupId, chatId))
		deleteFileIfExists(getChatFile(groupId, chatId, FILE.DM_RATCHETS))
	} catch (error) {
		console.error('[SecretChat] Failed to delete dm-ratchets.json:', error)
	}
}

export async function deleteGroupSenderKeys(chatId: string, groupId: string) {
	try {
		await deleteSecureKey(getSenderKeysSecureStoreKey(groupId, chatId))
		const file = getChatFile(groupId, chatId, FILE.SENDER_KEYS)
		if (file.exists) {
			file.delete()
		}
	} catch (error) {
		console.error('[SecretChat] Failed to delete sender-keys.json:', error)
	}
}

export async function resetLegacyGroupSecretState(
	chatId: string,
	groupId: string
) {
	await deleteMyKeys(chatId, groupId)
	try {
		const messagesFile = getChatFile(groupId, chatId, FILE.MESSAGES)
		if (messagesFile.exists) {
			messagesFile.delete()
		}
	} catch (error) {
		console.error('[SecretChat] Failed to reset legacy group history:', error)
	}
}

export async function resetLegacyDmSecretState(
	chatId: string,
	groupId: string
) {
	await deleteMyKeys(chatId, groupId)
	await deleteDmRatchets(chatId, groupId)
	try {
		const messagesFile = getChatFile(groupId, chatId, FILE.MESSAGES)
		deleteFileIfExists(messagesFile)
	} catch (error) {
		console.error('[SecretChat] Failed to reset legacy DM history:', error)
	}
}

/**
 *  Удаление чата (вместе с его папкой)
 */
export async function deleteSecretChat(groupId: string, chatId: string) {
	try {
		await deleteSecureKey(getSessionKeySecureStoreKey(groupId, chatId))
		await deleteSecureKey(getSenderKeysSecureStoreKey(groupId, chatId))
		await deleteSecureKey(getDmRatchetsSecureStoreKey(groupId, chatId))

		const chatDirectory = getChatDirectory(groupId, chatId)

		if (!chatDirectory.exists) {
			console.warn(`Папка чата ${chatId} не найдена в группе ${groupId}`)
			return
		}

		chatDirectory.delete()
		console.log(`Секретный чат ${chatId} удален из группы ${groupId}`)
	} catch (error) {
		console.error('Ошибка при удалении чата:', error)
	}
}

export async function updateSecretChatUpdatedAt(
	groupId: string,
	chatId: string
) {
	try {
		const chatFile = getSecretChatFile(groupId, chatId)
		if (!chatFile.exists) {
			console.warn(`Файл чата ${chatId} не найден в группе ${groupId}`)
			return
		}

		const existingChat = await readJson<Record<string, unknown>>(chatFile)
		if (!existingChat) {
			return
		}

		writeJson(chatFile, {
			...existingChat,
			updatedAt: new Date().toISOString()
		})
	} catch (error) {
		console.error('Ошибка при обновлении чата:', error)
	}
}

export async function fileExist(
	chatId: string,
	groupId: string,
	fileName: string
) {
	if (fileName === FILE.MY_KEYS) {
		const secureValue = await SecureStore.getItemAsync(
			getSessionKeySecureStoreKey(groupId, chatId)
		)
		return Boolean(secureValue) || getChatFile(groupId, chatId, fileName).exists
	}

	if (fileName === FILE.SENDER_KEYS) {
		const secureValue = await SecureStore.getItemAsync(
			getSenderKeysSecureStoreKey(groupId, chatId)
		)
		return Boolean(secureValue) || getChatFile(groupId, chatId, fileName).exists
	}

	if (fileName === FILE.DM_RATCHETS) {
		const secureValue = await SecureStore.getItemAsync(
			getDmRatchetsSecureStoreKey(groupId, chatId)
		)
		return Boolean(secureValue) || getChatFile(groupId, chatId, fileName).exists
	}

	return getChatFile(groupId, chatId, fileName).exists
}

export async function createMyKey(
	chatId: string,
	groupId: string,
	userId: string,
	sessionKey: Uint8Array<ArrayBufferLike>
) {
	ensureDirectory(getChatDirectory(groupId, chatId))

	await setSecureJson(getSessionKeySecureStoreKey(groupId, chatId), {
		sessionKeyHex: Array.from(sessionKey as Uint8Array)
	})
	deleteFileIfExists(getChatFile(groupId, chatId, FILE.MY_KEYS))
	notifySecretChatReady(groupId, chatId)
}

// сессионный ключ
export async function loadMyKeys(
	chatId: string,
	groupId: string
): Promise<MyKeys | null> {
	const secureKey = getSessionKeySecureStoreKey(groupId, chatId)
	const stored = await getSecureJson<any>(secureKey)
	const normalizedStored = normalizeMyKeys(stored)
	if (normalizedStored) return normalizedStored

	const parsed = await readJson<any>(
		getChatFile(groupId, chatId, FILE.MY_KEYS)
	)
	if (!parsed) {
		return null
	}

	const normalizedLegacy = normalizeMyKeys(parsed)
	if (normalizedLegacy) {
		await setSecureJson(secureKey, {
			sessionKeyHex: Array.from(normalizedLegacy.sessionKeyHex as Uint8Array)
		})
		deleteFileIfExists(getChatFile(groupId, chatId, FILE.MY_KEYS))
		return normalizedLegacy
	}

	try {
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
			return { sessionKeyHex: new Uint8Array(arr) }
		}

		return null
	} catch (e) {
		console.warn('Не удалось прочитать ключи из файла:', e)
		return null
	}
}

export async function saveGroupSenderKeys(
	chatId: string,
	groupId: string,
	state: GroupSenderKeysState
) {
	try {
		await setSecureJson(getSenderKeysSecureStoreKey(groupId, chatId), state)
		deleteFileIfExists(getChatFile(groupId, chatId, FILE.SENDER_KEYS))
		notifySecretChatReady(groupId, chatId)
	} catch (error) {
		console.error(
			'[SecretChat] Failed to persist sender keys in SecureStore',
			error
		)
		throw error
	}
}

export async function loadGroupSenderKeys(
	chatId: string,
	groupId: string
): Promise<GroupSenderKeysState | null> {
	const secureKey = getSenderKeysSecureStoreKey(groupId, chatId)
	const stored = await getSecureJson<GroupSenderKeysState>(secureKey)
	if (stored?.version === 1 && stored.chatId === chatId) {
		return {
			...stored,
			own: stored.own ?? null,
			received: stored.received ?? {}
		}
	}

	const parsed = await readJson<GroupSenderKeysState>(
		getChatFile(groupId, chatId, FILE.SENDER_KEYS)
	)
	if (!parsed || parsed.version !== 1 || parsed.chatId !== chatId) {
		return null
	}

	await setSecureJson(secureKey, parsed)
	deleteFileIfExists(getChatFile(groupId, chatId, FILE.SENDER_KEYS))

	return {
		...parsed,
		own: parsed.own ?? null,
		received: parsed.received ?? {}
	}
}

export async function saveDmRatchets(
	chatId: string,
	groupId: string,
	state: DmRatchetsState
) {
	try {
		await setSecureJson(getDmRatchetsSecureStoreKey(groupId, chatId), state)
		deleteFileIfExists(getChatFile(groupId, chatId, FILE.DM_RATCHETS))
		notifySecretChatReady(groupId, chatId)
	} catch (error) {
		console.error('[SecretChat] Failed to persist DM ratchets', error)
		throw error
	}
}

export async function loadDmRatchets(
	chatId: string,
	groupId: string,
	localSessionId: string
): Promise<DmRatchetsState | null> {
	const secureKey = getDmRatchetsSecureStoreKey(groupId, chatId)
	const stored = await getSecureJson<DmRatchetsState>(secureKey)
	if (
		stored?.version === 1 &&
		stored.chatId === chatId &&
		stored.localSessionId === localSessionId
	) {
		return {
			...stored,
			peers: stored.peers ?? {}
		}
	}

	const parsed = await readJson<DmRatchetsState>(
		getChatFile(groupId, chatId, FILE.DM_RATCHETS)
	)
	if (
		!parsed ||
		parsed.version !== 1 ||
		parsed.chatId !== chatId ||
		parsed.localSessionId !== localSessionId
	) {
		return null
	}

	await setSecureJson(secureKey, parsed)
	deleteFileIfExists(getChatFile(groupId, chatId, FILE.DM_RATCHETS))

	return {
		...parsed,
		peers: parsed.peers ?? {}
	}
}

export async function loadChatData(
	chatId: string,
	groupId: string
): Promise<SecretChatData | null> {
	const chatFile = getChatFile(groupId, chatId, FILE.CHAT)
	if (!chatFile.exists) {
		console.warn(`Файл чата ${chatId} не найден в группе ${groupId}`)
		return null
	}

	return readJson<SecretChatData>(chatFile)
}

export async function addMessages(
	messages: MessageType[],
	chatId: string,
	groupId: string
) {
	const file = getChatFile(groupId, chatId, FILE.MESSAGES)
	const existingMessages = (await readJson<MessageType[]>(file)) ?? []
	const seenIds = new Set(existingMessages.map(message => message.id))
	const uniqueIncoming = messages.filter(message => {
		if (seenIds.has(message.id)) {
			return false
		}
		seenIds.add(message.id)
		return true
	})
	const updatedMessages = [...existingMessages, ...uniqueIncoming]

	writeJson(file, sortMessagesByCreatedAt(updatedMessages))
}

const getMessageTime = (message: MessageType) => {
	const timestamp = new Date(message.createdAt).getTime()
	return Number.isFinite(timestamp) ? timestamp : 0
}

const sortMessagesByCreatedAt = (messages: MessageType[]) =>
	[...messages].sort((left, right) => {
		const timeDiff = getMessageTime(left) - getMessageTime(right)
		if (timeDiff !== 0) return timeDiff

		return left.id.localeCompare(right.id)
	})

/**
 *  Загрузка сообщений чата из локального файла
 */
export async function loadMessages(
	chatId: string,
	groupId: string
): Promise<MessageType[]> {
	const file = getChatFile(groupId, chatId, FILE.MESSAGES)

	if (!file.exists) {
		return []
	}

	try {
		const messages = await readJson<MessageType[]>(file)
		return Array.isArray(messages) ? sortMessagesByCreatedAt(messages) : []
	} catch (e) {
		console.warn('Не удалось прочитать сообщения из файла:', e)
		return []
	}
}

/**
 *  Полная перезапись сообщений чата в локальный файл
 */
export async function saveMessages(
	messages: MessageType[],
	chatId: string,
	groupId: string
) {
	ensureDirectory(getChatDirectory(groupId, chatId))
	writeJson(
		getChatFile(groupId, chatId, FILE.MESSAGES),
		sortMessagesByCreatedAt(messages)
	)
}
