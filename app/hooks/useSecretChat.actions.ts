import { createId } from '@paralleldrive/cuid2'
import * as DocumentPicker from 'expo-document-picker'
import { MutableRefObject } from 'react'

import {
	FILE,
	fileExist,
	loadAllSecretChats,
	loadMyKeys,
	loadMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'

import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	FindAllUsersQuery,
	GetPreKeysQuery,
	GetSecretMessageQuery,
	useGetPreKeysLazyQuery,
	useGetSecretMessageLazyQuery,
	useGetSharedSecretKeyLazyQuery,
	useSendSecretMessageMutation,
	useSendSharedSecretKeyMutation
} from '@/graphql/generated/output'
import {
	PreKeyBundleClient,
	buildInitEnvelope,
	buildSessionMsgEnvelope,
	checkMyPreKeys,
	decryptSessionMsgEnvelope,
	finalizeFromEnvelope,
	fromHex,
	importPrivateRaw,
	importPublicRaw
} from '@/libs/e2ee/gost'

// Дополнительный тип для выбранного файла (с URI, если нужен для UI)
export type PickedFile = SendFileType & { uri?: string }

// 1) Загрузка состояния чата и ключей (чистая функция)
export const loadChatAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
}): Promise<{
	chat: any | null
	mySecretPreKey?: PreKeyBundleClient | null
	preKeysPub?: GetPreKeysQuery['getPreKeys']
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	errorMessage?: string
}> => {
	const { chatId, groupId, userId, getPreKeys } = params
	try {
		const haveMyKeys = await fileExist(chatId, groupId, FILE.MY_KEYS)
		console.log(
			'[SecretChat] haveMyKeys:',
			haveMyKeys,
			'chatId:',
			chatId,
			'groupId:',
			groupId
		)
		if (!haveMyKeys) {
			const preKeysResponse = await getPreKeys({ variables: { chatId } })
			if (preKeysResponse.error) {
				console.error(
					'Ошибка при получении PreKeys:',
					preKeysResponse.error
				)
				return {
					chat: null,
					errorMessage: 'Ошибка при получении PreKeys'
				}
			}
			const preKeys = preKeysResponse.data?.getPreKeys
			console.log(
				'[SecretChat] fetched preKeys count(all members):',
				preKeys?.length ?? 0
			)
			if (!preKeys || preKeys.length === 0) {
				console.error('PreKeys не найдены')
				return { chat: null, errorMessage: 'PreKeys не найдены' }
			}

			const myPreKeys = await loadMyPreKeyJSON()
			if (!myPreKeys) {
				console.error('Мои PreKeys не найдены')
				return { chat: null, errorMessage: 'Мои PreKeys не найдены' }
			}

			let isMyPreKeys = false
			for (const pk of preKeys) {
				if (pk.userId === userId) {
					isMyPreKeys = await checkMyPreKeys(myPreKeys.toServer, pk)
					break
				}
			}
			if (!isMyPreKeys) {
				console.error('Мои PreKeys не совпадают с серверными')
				return {
					chat: null,
					errorMessage: 'Мои PreKeys не совпадают с серверными'
				}
			}

			const chatsData = await loadAllSecretChats(groupId)
			const currentChat = chatsData.find(c => c.id === chatId) || null
			return {
				chat: currentChat,
				mySecretPreKey: myPreKeys.toStore,
				preKeysPub: preKeys,
				sessionKey: null
			}
		} else {
			const mySessionKeys = await loadMyKeys(chatId, groupId)
			console.log(
				'[SecretChat] loaded existing sessionKey:',
				!!mySessionKeys?.sessionKeyHex
			)
			if (!mySessionKeys) {
				console.error('Мои ключи сессии не найдены')
				return {
					chat: null,
					errorMessage: 'Мои ключи сессии не найдены'
				}
			}
			const myPreKeys = await loadMyPreKeyJSON()
			let preKeysPub: GetPreKeysQuery['getPreKeys'] | undefined
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getPreKeys) {
					preKeysPub = preKeysResponse.data.getPreKeys
				}
			} catch {}

			const chatsData = await loadAllSecretChats(groupId)
			const currentChat = chatsData.find(c => c.id === chatId) || null
			return {
				chat: currentChat,
				mySecretPreKey: myPreKeys?.toStore ?? null,
				preKeysPub,
				sessionKey: mySessionKeys.sessionKeyHex
			}
		}
	} catch (e) {
		console.error('Ошибка загрузки чата:', e)
		return { chat: null, errorMessage: 'Ошибка загрузки чата' }
	}
}

// 2) Обработка сообщения из подписки (чистая функция)
// Обработка сообщения из подписки: построчные пояснения
export const processSecretSubscriptionAction = async (params: {
	msg: any // объект сообщения из подписки
	chat: any // текущий чат (метаданные и участники)
	chatId: string // идентификатор чата
	groupId: string // идентификатор группы
	userId: string // мой идентификатор
	sessionKey: Uint8Array<ArrayBufferLike> | null // текущий ключ сессии (если уже финализирован)
	preKeysPub: GetPreKeysQuery['getPreKeys'] // публичные preKeys всех участников
	mySecretPreKey: PreKeyBundleClient | null // мои приватные ключи IK/SPK из файла
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0] // ленивый запрос preKeys (для рефреша)
	getSecretMessage: ReturnType<typeof useGetSecretMessageLazyQuery>[0] // ленивый запрос секретного сообщения
	processedRef?: MutableRefObject<Set<string>> // глобальный набор уже обработанных пакетов (iv+sig)
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike> | null // новый или текущий ключ сессии
	newMessage?: MessageType // расшифрованное новое сообщение
	needPersistKey?: boolean // нужно ли сохранить ключ сессии на диск
}> => {
	const {
		msg, // сообщение из подписки
		chat, // чат
		chatId, // id чата
		groupId, // id группы
		userId, // мой id
		sessionKey, // ключ сессии (может быть null)
		preKeysPub, // публичные preKeys
		mySecretPreKey, // мои приватные ключи
		getPreKeys, // функция запроса preKeys
		getSecretMessage, // функция запроса секретного сообщения
		processedRef // глобальный набор обработанных пакетов
	} = params

	if (!msg || !chat) return {} // если нет данных — выходим

	// Global dedup by iv+sig if provided
	try {
		const key = `${msg.iv}.${msg.sig}`
		if (processedRef?.current?.has(key)) {
			return {}
		}
	} catch {}

	let currentSession = sessionKey // локальная копия ключа сессии
	console.log(
		'[SecretChat][Sub] incoming msg:', // лог прихода сообщения
		!!msg,
		'sessionKey exists:',
		!!currentSession
	)
	if (!currentSession) {
		// если нет ключа — пытаемся восстановить
		const fromDisk = await loadMyKeys(chatId, groupId) // читаем ключ с диска
		console.log(
			'[SecretChat][Sub] fromDisk session:', // лог наличия ключа на диске
			!!fromDisk?.sessionKeyHex
		)
		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex // берем ключ из файла
		} else if (mySecretPreKey) {
			// иначе пробуем финализировать через GSM
			try {
				// пытаемся получить пакет для финализации
				const resMsg = await getSecretMessage({ variables: { chatId } }) // запрос пары для финализации
				const smsg: any = resMsg.data?.getSecretMessage // извлекаем полезную нагрузку
				console.log(
					'[SecretChat][Sub][GSM] full payload:', // лог payload
					JSON.stringify(smsg)
				)
				if (smsg?.ukm) {
					// ukm присутствует — это инициирующий пакет
					const ikPrivHex = mySecretPreKey.ikPriv || '' // IK приватный ключ в hex
					const spkPrivHex = mySecretPreKey.spkPriv || '' // SPK приватный ключ в hex
					if (!ikPrivHex || !spkPrivHex) {
						// защита от пустых ключей
						console.warn(
							'[SecretChat][Sub] mySecretPreKey is missing private keys'
						)
						return {}
					}
					const ikPriv = await importPrivateRaw(fromHex(ikPrivHex)) // импорт IK
					const spkPriv = await importPrivateRaw(fromHex(spkPrivHex)) // импорт SPK
					let senderIkPub =
						smsg.ikPub || // приоритет — из payload
						preKeysPub.find(pk => pk.userId === smsg.fromUserId)
							?.ikPub || // иначе из preKeys
						undefined
					if (!senderIkPub && getPreKeys) {
						// при необходимости — рефреш preKeys
						try {
							const preKeysResponse = await getPreKeys({
								variables: { chatId }
							})
							const fresh = preKeysResponse.data?.getPreKeys || []
							senderIkPub = fresh.find(
								pk => pk.userId === smsg.fromUserId
							)?.ikPub
						} catch (e) {
							console.warn(
								'[SecretChat][Sub] getPreKeys refresh failed:',
								e
							)
						}
					}
					if (!senderIkPub) {
						// без IK паблика не можем проверить подпись
						console.warn(
							'[SecretChat][Sub] senderIkPub missing; abort finalize'
						)
						return {}
					}
					const envelope = {
						ikAPub: senderIkPub, // публичный IK отправителя
						ekAPub: smsg.ekPub, // efemерный ключ отправителя
						usedOpk: smsg.usedOpk ?? null, // использованный OPK
						ukm: smsg.ukm, // ukm для KDF
						iv: smsg.iv, // IV для шифрования
						ct: smsg.encryptedMessage, // шифртекст
						sig: smsg.sig // подпись отправителя
					}
					console.log(
						'[SecretChat][Sub] envelope from GSM:', // лог конверта
						envelope
					)
					const finalize = await finalizeFromEnvelope({
						// финализируем сессию у получателя
						bobIKPriv: ikPriv,
						bobSPKPriv: spkPriv,
						opkPriv: undefined,
						envelope
					})
					currentSession = finalize.sessionKey // сохраняем ключ сессии в локальную переменную
					try {
						// отмечаем пакет как обработанный (глобально)
						processedRef?.current?.add(`${smsg.iv}.${smsg.sig}`)
					} catch {}
					const sender = chat.members.find(
						(m: any) => m.user.id === smsg.fromUserId
					)?.user // ищем метаданные пользователя-отправителя
					const firstMessage: MessageType = {
						// собираем первое расшифрованное сообщение
						id: createId(),
						text: finalize.decrypted,
						isEdited: false,
						user: {
							id: smsg.fromUserId,
							username: sender?.username || 'user'
						},
						chat: { chatName: chat.chatName },
						createdAt: new Date().toISOString(),
						files: []
					}
					return {
						sessionKey: currentSession, // вернём ключ
						newMessage: firstMessage, // и само сообщение
						needPersistKey: true // нужно сохранить ключ на диск
					}
				}
			} catch (e) {
				console.warn('[SecretChat][Sub] GSM finalize failed:', e) // финализация не удалась
			}
		}
	}

	if (!currentSession) return {} // без ключа — выходим

	let senderIkPub =
		(msg as any)?.ikPub || // приоритет — из payload
		preKeysPub.find(pk => pk.userId === msg.fromUserId)?.ikPub // иначе из preKeys
	if (!senderIkPub && getPreKeys) {
		// рефреш preKeys при необходимости
		try {
			const preKeysResponse = await getPreKeys({ variables: { chatId } })
			const fresh = preKeysResponse.data?.getPreKeys || []
			senderIkPub = fresh.find(pk => pk.userId === msg.fromUserId)?.ikPub
		} catch (e) {
			console.warn('[SecretChat][Sub] getPreKeys refresh failed:', e)
		}
	}
	if (!senderIkPub) return {} // без IK паблика — выходим

	const { decrypted, sigOk } = await decryptSessionMsgEnvelope({
		// расшифровка сессионного сообщения
		sessionKey: currentSession,
		envelope: { iv: msg.iv, ct: msg.encryptedMessage, sig: msg.sig },
		senderIkPub
	})
	console.log('[SecretChat][Sub] sigOk:', sigOk) // проверка подписи
	if (!sigOk) return {} // подпись невалидна — выходим
	try {
		processedRef?.current?.add(`${msg.iv}.${msg.sig}`)
	} catch {}

	const sender = chat.members.find(
		(m: any) => m.user.id === msg.fromUserId
	)?.user // метаданные пользователя
	const newMessage: MessageType = {
		// собираем объект сообщения для UI
		id: createId(),
		text: decrypted,
		isEdited: false,
		user: { id: msg.fromUserId, username: sender?.username || 'user' },
		chat: { chatName: chat.chatName },
		createdAt: new Date().toISOString(),
		files: []
	}
	return { sessionKey: currentSession, newMessage } // возвращаем результат
}

// 3) Пуллинг секретных сообщений (чистая функция)
// Пуллинг секретных сообщений: построчные пояснения
export const pullSecretMessagesAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	chat: any
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getSecretMessage: ReturnType<typeof useGetSecretMessageLazyQuery>[0]
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	processedRef?: MutableRefObject<Set<string>>
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	newMessages: MessageType[]
	needPersistKey?: boolean
}> => {
	const {
		chatId, // id чата
		groupId, // id группы
		userId, // мой id
		chat, // чат
		sessionKey, // текущий ключ сессии
		mySecretPreKey, // мои приватные ключи
		preKeysPub, // публичные preKeys
		getSecretMessage, // функция запроса секретного сообщения
		processedRef // глобальный набор обработанных пакетов
	} = params

	if (!chat) return { newMessages: [] } // без чата — выходим

	let currentSession = sessionKey // локальная копия ключа
	let needPersistKey = false // флаг сохранения ключа
	
	if (!currentSession) {
		// если ключа нет — пытаемся восстановить
		const fromDisk = await loadMyKeys(chatId, groupId) // читаем ключ с диска
		
		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex // берем ключ из файла
		} else if (mySecretPreKey) {
			// иначе пробуем финализировать
			try {
				// запрос GSM для финализации
				const resMsg = await getSecretMessage({ variables: { chatId } }) // запрос пакета
				
				const msg: GetSecretMessageQuery['getSecretMessage']|undefined = resMsg.data?.getSecretMessage // полезная нагрузка
				
				if (msg && msg.ukm) {
					// ukm есть — это инициатор
					const ikPrivHex = mySecretPreKey.ikPriv || '' // IK приватный ключ
					const spkPrivHex = mySecretPreKey.spkPriv || '' // SPK приватный ключ
					if (!ikPrivHex || !spkPrivHex) {
						// защита от пустых ключей
						console.warn(
							'[SecretChat][Pull] mySecretPreKey is missing private keys'
						)
						return { newMessages: [] }
					}
					const ikPriv = await importPrivateRaw(fromHex(ikPrivHex)) // импорт IK
					const spkPriv = await importPrivateRaw(fromHex(spkPrivHex)) // импорт SPK
					let senderIkPub =
						preKeysPub.find(pk => pk.userId === msg.fromUserId)
							?.ikPub || // иначе preKeys
						undefined
					if (!senderIkPub && params.getPreKeys) {
						// рефреш preKeys
						try {
							const preKeysResponse = await params.getPreKeys({
								variables: { chatId }
							})
							const fresh = preKeysResponse.data?.getPreKeys || []
							senderIkPub = fresh.find(
								pk => pk.userId === msg.fromUserId
							)?.ikPub
						} catch (e) {
							console.warn(
								'[SecretChat][Pull] getPreKeys refresh failed:',
								e
							)
						}
					}
					if (!senderIkPub) {
						// без IK паблика финализация невозможна
						console.warn(
							'[SecretChat][Pull] senderIkPub missing; abort finalize'
						)
						return { newMessages: [] }
					}
					const ek = msg.ekPub as string | undefined // efemерный ключ
					const used = (msg.usedOpk as string | undefined) ?? null // использованный OPK
					if (!ek) {
						// без ekPub не финализируем
						console.warn(
							'[SecretChat][Pull] ekPub missing in GSM payload, cannot finalize session'
						)
						return { newMessages: [] }
					}
					const envelope = {
						ikAPub: senderIkPub, // IK паблик отправителя
						ekAPub: ek, // efemерный ключ отправителя
						usedOpk: used, // использованный OPK
						ukm: msg.ukm, // ukm для KDF
						iv: msg.iv, // IV
						ct: msg.encryptedMessage, // шифртекст
						sig: msg.sig // подпись
					}
					const finalize = await finalizeFromEnvelope({
						// финализируем сессию
						bobIKPriv: ikPriv,
						bobSPKPriv: spkPriv,
						opkPriv: undefined,
						envelope
					})
					currentSession = finalize.sessionKey // сохраняем ключ
					needPersistKey = true // отметка о сохранении
					const sender = chat.members.find(
						(m: any) => m.user.id === msg.fromUserId
					)?.user // метаданные пользователя
					const firstMessage: MessageType = {
						// собираем первое сообщение
						id: createId(),
						text: finalize.decrypted,
						isEdited: false,
						user: {
							id: msg.fromUserId,
							username: sender?.username || 'user'
						},
						chat: { chatName: chat.chatName },
						createdAt: new Date().toISOString(),
						files: []
					}
					// Initialize collected with first
					const collectedTail: MessageType[] = [firstMessage] // коллекция сообщений для возврата
					try {
						processedRef?.current?.add(`${msg.iv}.${msg.sig}`)
					} catch {}
					const processedKeys = new Set<string>()
					processedKeys.add(`${msg.iv}.${msg.sig}`)
					// Continue tail loop
					for (let i = 0; i < 10; i++) {
						// читаем хвост до 10 сообщений
						const res = await getSecretMessage({
							variables: { chatId }
						})
						const nextMsg: any = res.data?.getSecretMessage
						console.log(
							'[SecretChat][Pull][GSM] tail payload:',
							JSON.stringify(nextMsg)
						)
						if (!nextMsg) break // нет сообщений — выходим из хвоста
						const key = `${nextMsg.iv}.${nextMsg.sig}`
						if (processedKeys.has(key)) {
							continue
						}
						if (processedRef?.current?.has(key)) {
							continue
						}
						if (!currentSession) break // защита от отсутствия ключа
						let senderIkPub2 =
							nextMsg.ikPub ||
							preKeysPub.find(
								pk => pk.userId === nextMsg.fromUserId
							)?.ikPub
						if (!senderIkPub2 && params.getPreKeys) {
							try {
								const preKeysResponse = await params.getPreKeys(
									{ variables: { chatId } }
								)
								const fresh =
									preKeysResponse.data?.getPreKeys || []
								senderIkPub2 = fresh.find(
									pk => pk.userId === nextMsg.fromUserId
								)?.ikPub
							} catch (e) {
								console.warn(
									'[SecretChat][Pull] getPreKeys refresh failed:',
									e
								)
							}
						}
						if (!senderIkPub2) break // без IK паблика — пропуск
						const { decrypted, sigOk } =
							await decryptSessionMsgEnvelope({
								sessionKey: currentSession,
								envelope: {
									iv: nextMsg.iv,
									ct: nextMsg.encryptedMessage,
									sig: nextMsg.sig
								},
								senderIkPub: senderIkPub2
							})
						console.log(
							'[SecretChat][Pull] tail msg decrypted, sigOk:',
							sigOk
						)
						if (!sigOk) continue // подпись невалидна — пропускаем
						processedKeys.add(key)
						try {
							processedRef?.current?.add(key)
						} catch {}
						const sender2 = chat.members.find(
							(m: any) => m.user.id === nextMsg.fromUserId
						)?.user
						collectedTail.push({
							id: createId(),
							text: decrypted,
							isEdited: false,
							user: {
								id: nextMsg.fromUserId,
								username: sender2?.username || 'user'
							},
							chat: { chatName: chat.chatName },
							createdAt: new Date().toISOString(),
							files: []
						})
					}
					return {
						sessionKey: currentSession,
						newMessages: collectedTail,
						needPersistKey
					}
				}
			} catch (e) {
				console.warn('[SecretChat][Pull] GSM finalize failed:', e) // финализация не удалась
			}
		}
	}

	const collected: MessageType[] = [] // набор для обычного хвоста
	const processedKeys = new Set<string>()
	for (let i = 0; i < 10; i++) {
		const res = await getSecretMessage({ variables: { chatId } })
		const msg: any = res.data?.getSecretMessage
		console.log(
			'[SecretChat][Pull][GSM] tail payload:',
			JSON.stringify(msg)
		)
		if (!msg) break // нет пакетов — выходим
		const key = `${msg.iv}.${msg.sig}`
		if (processedKeys.has(key)) {
			continue
		}
		if (processedRef?.current?.has(key)) {
			continue
		}
		if (!currentSession) break // без ключа — выходим
		let senderIkPub =
			msg.ikPub ||
			preKeysPub.find(pk => pk.userId === msg.fromUserId)?.ikPub
		if (!senderIkPub && params.getPreKeys) {
			try {
				const preKeysResponse = await params.getPreKeys({
					variables: { chatId }
				})
				const fresh = preKeysResponse.data?.getPreKeys || []
				senderIkPub = fresh.find(
					pk => pk.userId === msg.fromUserId
				)?.ikPub
			} catch (e) {
				console.warn('[SecretChat][Pull] getPreKeys refresh failed:', e)
			}
		}
		if (!senderIkPub) {
			console.warn(
				'[SecretChat][Pull] tail senderIkPub missing; skip msg'
			)
			continue
		}
		const { decrypted, sigOk } = await decryptSessionMsgEnvelope({
			// расшифровка
			sessionKey: currentSession!,
			envelope: { iv: msg.iv, ct: msg.encryptedMessage, sig: msg.sig },
			senderIkPub
		})
		console.log('[SecretChat][Pull] msg decrypted, sigOk:', sigOk) // проверка подписи
		if (!sigOk) continue // подпись невалидна — пропускаем
		processedKeys.add(key)
		try {
			processedRef?.current?.add(key)
		} catch {}
		const sender = chat.members.find(
			(m: any) => m.user.id === msg.fromUserId
		)?.user
		collected.push({
			// добавляем сообщение в коллекцию
			id: createId(),
			text: decrypted,
			isEdited: false,
			user: { id: msg.fromUserId, username: sender?.username || 'user' },
			chat: { chatName: chat.chatName },
			createdAt: new Date().toISOString(),
			files: []
		})
	}
	return {
		sessionKey: currentSession ?? undefined, // возвращаем ключ (если появился)
		newMessages: collected, // хвостовые сообщения
		needPersistKey // нужно ли сохранить ключ
	}
}

// 4) Отправка сообщения (чистая функция)
export const sendSecretMessageAction = async (params: {
	text: string
	user: FindAllUsersQuery['findAllUsers'][number]
	chat: any
	chatId: string
	groupId: string
	userId: string
	files: SendFileType[]
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	sendMessageToClients: ReturnType<typeof useSendSecretMessageMutation>[0]
	sendSharedSecretKey: ReturnType<typeof useSendSharedSecretKeyMutation>[0]
}): Promise<{
	newMessage?: MessageType
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	needPersistKey?: boolean
	errorMessage?: string
}> => {
	const {
		text,
		user,
		chat,
		chatId,
		groupId,
		userId,
		files,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		sendMessageToClients,
		sendSharedSecretKey
	} = params

	if (!chat || (!text.trim() && files.length === 0)) return {}

	const newMessage: MessageType = {
		id: createId(),
		text,
		isEdited: false,
		user: { id: user.id, username: user.username },
		chat: { chatName: chat.chatName },
		createdAt: new Date().toISOString(),
		files: files.map(f => ({
			id: f.id || createId(),
			fileName: f.name,
			fileSize: f.size,
			fileFormat: f.name.split('.').pop() || 'file'
		}))
	}

	if (!sessionKey) {
		const recipientUserId = chat.members.find(
			(m: any) => m.user.id !== userId
		)?.user.id
		if (!recipientUserId) {
			console.error('Получатель не найден в чате')
			return { newMessage, errorMessage: 'Получатель не найден в чате' }
		}

		let existingSessionKey = await loadMyKeys(chat.id, groupId)
		if (existingSessionKey) {
			let mySecretPreKeyLocal = mySecretPreKey
			if (!mySecretPreKeyLocal) {
				const mk = await loadMyPreKeyJSON()
				if (!mk) {
					console.error('Мои PreKeys не найдены')
					return {
						newMessage,
						errorMessage: 'Мои PreKeys не найдены'
					}
				}
				mySecretPreKeyLocal = mk.toStore
			}
			const { envelope } = await buildSessionMsgEnvelope({
				plaintext: text,
				sessionKey: existingSessionKey.sessionKeyHex,
				signerIKPriv: await importPrivateRaw(
					fromHex(mySecretPreKeyLocal!.ikPriv)
				)
			})

			await sendMessageToClients({
				variables: {
					data: {
						chatId: chat.id,
						encryptedMessage: envelope.ct,
						groupId,
						iv: envelope.iv,
						ukm: null,
						sig: envelope.sig,
						toUserIds: [recipientUserId]
					}
				}
			})

			return { newMessage, sessionKey: existingSessionKey.sessionKeyHex }
		}

		let mySecretPreKeyLocal = mySecretPreKey
		if (!mySecretPreKeyLocal) {
			const mk = await loadMyPreKeyJSON()
			if (!mk) {
				console.error('Мои PreKeys не найдены')
				return { newMessage, errorMessage: 'Мои PreKeys не найдены' }
			}
			mySecretPreKeyLocal = mk.toStore
		}

		const ikPrivRaw = fromHex(mySecretPreKeyLocal!.ikPriv)
		let myIkPubHex = preKeysPub.find(pk => pk.userId === userId)?.ikPub

		if (!myIkPubHex) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getPreKeys) {
					myIkPubHex = preKeysResponse.data.getPreKeys.find(
						pk => pk.userId === userId
					)?.ikPub
				}
			} catch {}
		}
		if (!myIkPubHex) {
			console.error('Мой ikPub не найден в preKeys')
			return { newMessage, errorMessage: 'Мой ikPub не найден в preKeys' }
		}
		const ikPubRaw = fromHex(myIkPubHex)
		const IK = {
			privateKey: await importPrivateRaw(ikPrivRaw),
			publicKey: await importPublicRaw(ikPubRaw)
		} as const

		let recipientBundle = preKeysPub.find(
			pk => pk.userId === recipientUserId
		)
		if (!recipientBundle) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getPreKeys) {
					recipientBundle = preKeysResponse.data.getPreKeys.find(
						pk => pk.userId === recipientUserId
					) as any
				}
			} catch {}
		}
		if (!recipientBundle) {
			console.error('PreKeys получателя не найдены')
			return { newMessage, errorMessage: 'PreKeys получателя не найдены' }
		}

		const {
			envelope: initEnvelope,
			sessionKey: newSessionKey,
			verifiedSpk
		} = await buildInitEnvelope({
			IK,
			bobBundle: {
				ikPub: recipientBundle.ikPub,
				spkPub: recipientBundle.spkPub,
				spkSig: recipientBundle.spkSig,
				opk:
					recipientBundle.opkPubs[recipientBundle.indexOpkPub] ?? null
			},
			plaintext: text
		})
		if (!verifiedSpk) {
			console.error('Не удалось проверить подпись SPK получателя')
			return {
				newMessage,
				errorMessage: 'Не удалось проверить подпись SPK получателя'
			}
		}

		// Положим параметры начальной сессии в очередь shared-secret-key для получателя
		try {
			await sendSharedSecretKey({
				variables: {
					data: {
						chatId,
						groupId,
						toUserId: recipientUserId,
						ikPub: myIkPubHex,
						ekPub: initEnvelope.ekAPub,
						usedOpk: initEnvelope.usedOpk ?? null,
						ukm: initEnvelope.ukm,
						iv: initEnvelope.iv,
						encryptedKey: initEnvelope.ct,
						sig: initEnvelope.sig
					}
				}
			})
		} catch (e) {
			console.warn('[SecretChat] sendSharedSecretKey failed:', e)
		}

		await sendMessageToClients({
			variables: {
				data: {
					chatId: chat.id,
					encryptedMessage: initEnvelope.ct,
					groupId,
					iv: initEnvelope.iv,
					sig: initEnvelope.sig,
					ukm: initEnvelope.ukm,
					toUserIds: [recipientUserId]
				}
			}
		})

		return { newMessage, sessionKey: newSessionKey, needPersistKey: true }
	} else {
		const recipientUserId = chat.members.find(
			(m: any) => m.user.id !== userId
		)?.user.id
		if (!recipientUserId) {
			console.error('Получатель не найден в чате')
			return { newMessage, errorMessage: 'Получатель не найден в чате' }
		}

		const { envelope } = await buildSessionMsgEnvelope({
			plaintext: text,
			sessionKey,
			signerIKPriv: await importPrivateRaw(
				fromHex(mySecretPreKey!.ikPriv)
			)
		})

		await sendMessageToClients({
			variables: {
				data: {
					chatId: chat.id,
					encryptedMessage: envelope.ct,
					groupId,
					iv: envelope.iv,
					ukm: null,
					sig: envelope.sig,
					toUserIds: [recipientUserId]
				}
			}
		})
		return { newMessage }
	}
}

// 5) Удаление сообщений (чистая функция)
export const deleteMessagesAction = async (params: {
	messageIds: string[]
	messagesRef: MutableRefObject<MessageType[]>
	chatId: string
	groupId: string
}): Promise<{ nextMessages: MessageType[] }> => {
	const { messageIds, messagesRef } = params
	const next = messagesRef.current.filter(m => !messageIds.includes(m.id))
	return { nextMessages: next }
}

// 6) Выбор файла (чистая функция)
export const pickFileAction = async (): Promise<{
	newFile?: PickedFile
	errorMessage?: string
}> => {
	try {
		const res = await DocumentPicker.getDocumentAsync({
			type: '*/*',
			copyToCacheDirectory: true
		})
		if (res.canceled) return {}
		const asset = res.assets?.[0]
		if (!asset) return {}
		const name = asset.name ?? 'unknown'
		const sizeStr = String(asset.size ?? 0)
		return {
			newFile: { id: createId(), name, size: sizeStr, uri: asset.uri }
		}
	} catch (err) {
		console.error('❌ Ошибка при выборе файла:', err)
		return { errorMessage: 'Ошибка выбора файла' }
	}
}

// 7) Очистка формы (чистая функция)
export const clearFormAction = (): {
	draftText: string
	files: SendFileType[]
} => ({
	draftText: '',
	files: []
})
