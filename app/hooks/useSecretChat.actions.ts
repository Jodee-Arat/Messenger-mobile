import { createId } from '@paralleldrive/cuid2'
import * as DocumentPicker from 'expo-document-picker'
import { Directory, File, Paths } from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import {
	DIRECT_CONTACT_BLOCKED_BACKEND_MESSAGE,
	getGraphQLErrorMessage,
	isDirectContactBlockedError
} from '@/hooks/useBlockedUsers'

import { bytesToBase64 } from '@/utils/math/base64'
import {
	FILE,
	fileExist,
	loadAllSecretChats,
	loadMyKeys,
	loadMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'

import { MessageFileType } from '../types/message-file.type'
import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	FindAllUsersQuery,
	GetPreKeysQuery,
	GetSecretMessageQuery,
	GetSecretMessagesQuery,
	GetSharedSecretKeyQuery,
	useDiscardSecretAttachmentMutation,
	useGetPreKeysLazyQuery,
	useGetSecretMessageLazyQuery,
	useGetSecretMessagesLazyQuery,
	useGetSharedSecretKeyLazyQuery,
	useSendSecretMessageMutation,
	useSendSharedSecretKeyMutation,
	useUploadSecretAttachmentMutation
} from '@/graphql/generated/output'
import {
	PreKeyBundleClient,
	buildInitEnvelope,
	buildSessionMsgEnvelope,
	checkMyPreKeys,
	decryptKuz,
	decryptSessionMsgEnvelope,
	encryptKuz,
	establishSessionX3DH,
	exportPublicRaw,
	finalizeFromEnvelope,
	finalizeSessionX3DH,
	fromHex,
	generateEphemeralKeyPair,
	generateKuznechikKey,
	importPrivateRaw,
	importPublicRaw,
	signBytes,
	toHex,
	verifyBytes
} from '@/libs/e2ee/gost'

export type PickedFile = SendFileType

export const DM_STORAGE_GROUP_ID = 'direct'

const SECRET_MESSAGE_PAYLOAD_KIND = 'secret-message-v2'

type SecretAttachmentPayload = {
	attachmentId: string
	fileName: string
	fileFormat: string
	fileSize: string
	fileKeyHex: string
	ivHex: string
	ciphertextSize: string
}

type SecretMessagePayloadV2 = {
	kind: typeof SECRET_MESSAGE_PAYLOAD_KIND
	version: 2
	text: string
	attachments: SecretAttachmentPayload[]
}

const getFileFormatFromName = (fileName: string) =>
	fileName.split('.').pop() || 'file'

const toMessageFile = (
	attachment: SecretAttachmentPayload
): MessageFileType => ({
	id: attachment.attachmentId,
	fileName: attachment.fileName,
	fileFormat: attachment.fileFormat,
	fileSize: attachment.fileSize,
	isSecretAttachment: true,
	fileKeyHex: attachment.fileKeyHex,
	ivHex: attachment.ivHex,
	ciphertextSize: attachment.ciphertextSize
})

const parseSecretMessageContent = (
	plaintext: string
): {
	text: string
	files: MessageFileType[]
} => {
	try {
		const parsed = JSON.parse(plaintext) as Partial<SecretMessagePayloadV2>
		if (
			parsed.kind !== SECRET_MESSAGE_PAYLOAD_KIND ||
			parsed.version !== 2 ||
			!Array.isArray(parsed.attachments)
		) {
			return { text: plaintext, files: [] }
		}

		const attachments = parsed.attachments.filter(
			attachment =>
				typeof attachment?.attachmentId === 'string' &&
				typeof attachment?.fileName === 'string' &&
				typeof attachment?.fileFormat === 'string' &&
				typeof attachment?.fileSize === 'string' &&
				typeof attachment?.fileKeyHex === 'string' &&
				typeof attachment?.ivHex === 'string' &&
				typeof attachment?.ciphertextSize === 'string'
		) as SecretAttachmentPayload[]

		return {
			text: typeof parsed.text === 'string' ? parsed.text : '',
			files: attachments.map(toMessageFile)
		}
	} catch {
		return { text: plaintext, files: [] }
	}
}

const buildSecretMessagePlaintext = (
	text: string,
	attachments: SecretAttachmentPayload[]
) => {
	if (attachments.length === 0) {
		return text
	}

	const payload: SecretMessagePayloadV2 = {
		kind: SECRET_MESSAGE_PAYLOAD_KIND,
		version: 2,
		text,
		attachments
	}

	return JSON.stringify(payload)
}

const createLocalSecretMessage = (params: {
	plaintext: string
	senderId: string
	senderUsername: string
	chatName: string
	messageId?: string
	createdAt?: string
}) => {
	const {
		plaintext,
		senderId,
		senderUsername,
		chatName,
		messageId,
		createdAt
	} = params
	const parsedContent = parseSecretMessageContent(plaintext)

	const newMessage: MessageType = {
		id: messageId ?? createId(),
		text: parsedContent.text,
		isEdited: false,
		isStarted: false,
		user: { id: senderId, username: senderUsername },
		chat: { chatName },
		createdAt: createdAt ?? new Date().toISOString(),
		files: parsedContent.files
	}

	return newMessage
}

const updateComposerFileState = (
	setFiles: Dispatch<SetStateAction<SendFileType[]>>,
	fileId: string,
	patch: Partial<SendFileType>
) => {
	setFiles(prev =>
		prev.map(file => (file.id === fileId ? { ...file, ...patch } : file))
	)
}

const cleanupUploadedSecretAttachmentsAction = async (params: {
	attachmentIds: string[]
	chatId: string
	discardSecretAttachment: ReturnType<
		typeof useDiscardSecretAttachmentMutation
	>[0]
}) => {
	const { attachmentIds, chatId, discardSecretAttachment } = params

	for (const attachmentId of attachmentIds) {
		try {
			await discardSecretAttachment({
				variables: {
					chatId,
					attachmentId
				}
			})
		} catch (error) {
			console.warn(
				'[SecretChat] Failed to discard staged secret attachment:',
				attachmentId,
				error
			)
		}
	}
}

/**
 * Шифрование и загрузка файла сразу при выборе (Signal-style encrypt-on-pick).
 * Вызывается немедленно после pickFile/pickImage, до нажатия «Отправить».
 */
export const encryptAndUploadFileAction = async (params: {
	chatId: string
	file: SendFileType
	setFiles: Dispatch<SetStateAction<SendFileType[]>>
	uploadSecretAttachment: ReturnType<
		typeof useUploadSecretAttachmentMutation
	>[0]
}): Promise<void> => {
	const { chatId, file, setFiles, uploadSecretAttachment } = params

	if (!file.uri) {
		updateComposerFileState(setFiles, file.id, {
			status: 'failed',
			errorMessage: 'Selected file is missing a local URI.'
		})
		return
	}

	try {
		updateComposerFileState(setFiles, file.id, {
			status: 'encrypting',
			errorMessage: undefined
		})

		const sourceFile = new File(file.uri)
		const plaintextBytes = await sourceFile.bytes()
		const { keyBytes, keyHex } = await generateKuznechikKey()
		const encryptedFile = await encryptKuz(keyBytes, plaintextBytes)
		const ciphertextBase64 = bytesToBase64(encryptedFile.ciphertext)

		updateComposerFileState(setFiles, file.id, {
			status: 'uploading',
			fileKeyHex: keyHex,
			ivHex: toHex(encryptedFile.iv),
			ciphertextBase64
		})

		const uploadResult = await uploadSecretAttachment({
			variables: {
				data: {
					chatId,
					ciphertextBase64
				}
			}
		})

		const uploadedAttachment = uploadResult.data?.uploadSecretAttachment
		if (!uploadedAttachment?.id) {
			throw new Error('Secret attachment upload did not return an id.')
		}

		// Cache the original file for instant display on sender side
		try {
			const ext = getFileFormatFromName(file.name)
			const cacheDir = new Directory(
				Paths.cache,
				'secret-attachments-cache'
			)
			if (!cacheDir.exists) cacheDir.create({ idempotent: true })
			const cachedFile = new File(
				cacheDir,
				`${uploadedAttachment.id}.${ext}`
			)
			const src = new File(file.uri)
			src.copy(cachedFile)
		} catch (e) {
			// Cache failure is non-critical
			console.warn('[SecretChat] Failed to cache original file:', e)
		}

		updateComposerFileState(setFiles, file.id, {
			status: 'uploaded',
			attachmentId: uploadedAttachment.id,
			errorMessage: undefined
		})
	} catch (error) {
		updateComposerFileState(setFiles, file.id, {
			status: 'failed',
			errorMessage:
				getGraphQLErrorMessage(error) ||
				'Failed to encrypt or upload secret attachment.'
		})
	}
}

const stageSecretAttachmentsAction = async (params: {
	chatId: string
	files: SendFileType[]
	setFiles: Dispatch<SetStateAction<SendFileType[]>>
	uploadSecretAttachment: ReturnType<
		typeof useUploadSecretAttachmentMutation
	>[0]
}): Promise<SecretAttachmentPayload[]> => {
	const { chatId, files, setFiles, uploadSecretAttachment } = params
	const stagedAttachments: SecretAttachmentPayload[] = []

	for (const file of files) {
		// Файл уже зашифрован и загружен через encrypt-on-pick
		if (
			file.status === 'uploaded' &&
			file.attachmentId &&
			file.fileKeyHex &&
			file.ivHex
		) {
			stagedAttachments.push({
				attachmentId: file.attachmentId,
				fileName: file.name,
				fileFormat: getFileFormatFromName(file.name),
				fileSize: file.size,
				fileKeyHex: file.fileKeyHex,
				ivHex: file.ivHex,
				ciphertextSize: file.ciphertextBase64
					? String(Math.ceil((file.ciphertextBase64.length * 3) / 4))
					: file.size
			})
			continue
		}

		// Fallback: файл ещё не зашифрован (не должно случаться при нормальном flow)
		if (!file.uri) {
			updateComposerFileState(setFiles, file.id, {
				status: 'failed',
				errorMessage: 'Selected file is missing a local URI.'
			})
			throw new Error('Selected file is missing a local URI.')
		}

		try {
			updateComposerFileState(setFiles, file.id, {
				status: 'encrypting',
				errorMessage: undefined
			})

			const sourceFile = new File(file.uri)
			const plaintextBytes = await sourceFile.bytes()
			const { keyBytes, keyHex } = await generateKuznechikKey()
			const encryptedFile = await encryptKuz(keyBytes, plaintextBytes)
			const ciphertextBase64 = bytesToBase64(encryptedFile.ciphertext)

			updateComposerFileState(setFiles, file.id, {
				status: 'uploading'
			})

			const uploadResult = await uploadSecretAttachment({
				variables: {
					data: {
						chatId,
						ciphertextBase64
					}
				}
			})

			const uploadedAttachment = uploadResult.data?.uploadSecretAttachment
			if (!uploadedAttachment?.id) {
				throw new Error(
					'Secret attachment upload did not return an id.'
				)
			}

			stagedAttachments.push({
				attachmentId: uploadedAttachment.id,
				fileName: file.name,
				fileFormat: getFileFormatFromName(file.name),
				fileSize: file.size,
				fileKeyHex: keyHex,
				ivHex: toHex(encryptedFile.iv),
				ciphertextSize:
					uploadedAttachment.ciphertextSize ||
					String(encryptedFile.ciphertext.byteLength)
			})

			updateComposerFileState(setFiles, file.id, {
				status: 'uploaded',
				errorMessage: undefined
			})
		} catch (error) {
			updateComposerFileState(setFiles, file.id, {
				status: 'failed',
				errorMessage:
					getGraphQLErrorMessage(error) ||
					'Failed to encrypt or upload secret attachment.'
			})
			throw error
		}
	}

	return stagedAttachments
}

/**
 * Убедиться, что директория для хранения DM-секретного чата существует
 */
export async function ensureDirectChatDirectory(chatId: string) {
	const chatDirectory = new Directory(
		Paths.document,
		DM_STORAGE_GROUP_ID,
		chatId
	)
	if (!chatDirectory.exists) {
		chatDirectory.create({ intermediates: true, idempotent: true })
	}
}

/**
 * Загрузка ключей для DM-режима
 */
export const loadDMKeysAction = async (params: {
	chatId: string
	userId: string
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
}): Promise<{
	mySecretPreKey?: PreKeyBundleClient | null
	preKeysPub?: GetPreKeysQuery['getPreKeys']
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	errorMessage?: string
}> => {
	const { chatId, userId, getPreKeys } = params
	const groupId = DM_STORAGE_GROUP_ID

	try {
		await ensureDirectChatDirectory(chatId)

		const haveMyKeys = await fileExist(chatId, groupId, FILE.MY_KEYS)

		if (!haveMyKeys) {
			const preKeysResponse = await getPreKeys({ variables: { chatId } })
			if (preKeysResponse.error) {
				if (isDirectContactBlockedError(preKeysResponse.error)) {
					return {
						errorMessage: DIRECT_CONTACT_BLOCKED_BACKEND_MESSAGE
					}
				}
				console.error(
					'[SecretChat][DM] Ошибка при получении PreKeys:',
					preKeysResponse.error
				)
				return { errorMessage: 'Ошибка при получении PreKeys' }
			}
			const preKeys = preKeysResponse.data?.getPreKeys
			if (!preKeys || preKeys.length === 0) {
				return { errorMessage: 'PreKeys не найдены' }
			}
			const myPreKeys = await loadMyPreKeyJSON()
			if (!myPreKeys) {
				return { errorMessage: 'Мои PreKeys не найдены' }
			}
			let isMyPreKeys = false
			for (const pk of preKeys) {
				if (pk.userId === userId) {
					isMyPreKeys = await checkMyPreKeys(myPreKeys.toServer, pk)
					break
				}
			}
			if (!isMyPreKeys) {
				return { errorMessage: 'Мои PreKeys не совпадают с серверными' }
			}
			return {
				mySecretPreKey: myPreKeys.toStore,
				preKeysPub: preKeys,
				sessionKey: null
			}
		} else {
			const mySessionKeys = await loadMyKeys(chatId, groupId)
			if (!mySessionKeys) {
				return { errorMessage: 'Мои ключи сессии не найдены' }
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
			return {
				mySecretPreKey: myPreKeys?.toStore ?? null,
				preKeysPub,
				sessionKey: mySessionKeys.sessionKeyHex
			}
		}
	} catch (e) {
		console.error('[SecretChat][DM] Ошибка загрузки ключей:', e)
		return { errorMessage: 'Ошибка загрузки ключей чата' }
	}
}

/**
 * Загрузка состояния чата и ключей (для группового режима)
 */
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

const findOpkIndexForUser = (
	bundles: GetPreKeysQuery['getPreKeys'],
	userId: string,
	usedOpk: string
) => {
	const myBundle = bundles.find(pk => pk.userId === userId)
	if (!myBundle) return -1

	return myBundle.opkPubs.findIndex(
		opk => opk?.toLowerCase() === usedOpk.toLowerCase()
	)
}

const resolveMyUsedOpkPrivateKey = async (params: {
	chatId: string
	userId: string
	usedOpk?: string | null
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
}) => {
	const { chatId, userId, usedOpk, mySecretPreKey, preKeysPub, getPreKeys } =
		params

	if (!usedOpk) return undefined

	let opkIndex = findOpkIndexForUser(preKeysPub, userId, usedOpk)

	if (opkIndex < 0 && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({
				variables: { chatId }
			})
			const fresh = preKeysResponse.data?.getPreKeys || []
			const freshBundle = fresh.find(pk => pk.userId === userId)

			if (
				freshBundle &&
				freshBundle.opkPubs.length === mySecretPreKey.opkPriv.length
			) {
				opkIndex = findOpkIndexForUser(fresh, userId, usedOpk)
			}
		} catch (e) {
			console.warn(
				'[SecretChat] resolveMyUsedOpkPrivateKey refresh failed:',
				e
			)
		}
	}

	if (opkIndex < 0) {
		console.warn(
			`[SecretChat] usedOpk ${usedOpk.slice(0, 16)}... not found for user ${userId}`
		)
		return undefined
	}

	const opkPrivHex = mySecretPreKey.opkPriv?.[opkIndex]
	if (!opkPrivHex) {
		console.warn(
			`[SecretChat] missing local opkPriv for index ${opkIndex} and user ${userId}`
		)
		return undefined
	}

	try {
		return await importPrivateRaw(fromHex(opkPrivHex))
	} catch (e) {
		console.warn('[SecretChat] failed to import local opkPriv:', e)
		return undefined
	}
}

const recoverDirectSessionFromSharedPacketsAction = async (params: {
	chatId: string
	userId: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getSharedSecretKey: ReturnType<typeof useGetSharedSecretKeyLazyQuery>[0]
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike>
	packets: GetSharedSecretKeyQuery['getSharedSecretKey']
	usedPacketIds: string[]
}> => {
	const {
		chatId,
		userId,
		mySecretPreKey,
		preKeysPub,
		getSharedSecretKey,
		getPreKeys
	} = params

	const response = await getSharedSecretKey({
		variables: { chatId },
		fetchPolicy: 'network-only'
	})
	const packets =
		response.data?.getSharedSecretKey
			?.filter(packet => packet.toUserId === userId)
			.slice()
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
			) ?? []

	if (packets.length === 0) {
		return { packets: [], usedPacketIds: [] }
	}

	const ikPrivHex = mySecretPreKey.ikPriv || ''
	const spkPrivHex = mySecretPreKey.spkPriv || ''
	if (!ikPrivHex || !spkPrivHex) {
		return { packets, usedPacketIds: [] }
	}

	const ikPriv = await importPrivateRaw(fromHex(ikPrivHex))
	const spkPriv = await importPrivateRaw(fromHex(spkPrivHex))

	for (const packet of packets) {
		try {
			const opkPriv = await resolveMyUsedOpkPrivateKey({
				chatId,
				userId,
				usedOpk: packet.usedOpk ?? null,
				mySecretPreKey,
				preKeysPub,
				getPreKeys
			})

			const { sessionKey } = await finalizeSessionX3DH({
				bobIKPriv: ikPriv,
				bobSPKPriv: spkPriv,
				opkPriv,
				envelope: {
					ikAPub: packet.ikPub,
					ekAPub: packet.ekPub,
					usedOpk: packet.usedOpk ?? null,
					ukm: packet.ukm
				}
			})

			return {
				sessionKey,
				packets,
				usedPacketIds: [packet.id]
			}
		} catch (error) {
			console.warn(
				`[SecretQueue][Shared][Recover][Mobile] chat=${chatId} user=${userId} packet=${packet.id} failed:`,
				error
			)
		}
	}

	return { packets, usedPacketIds: [] }
}

/**
 * Обработка сообщения из подписки
 */
export const processSecretSubscriptionAction = async (params: {
	msg: any
	chat: any
	chatId: string
	groupId: string
	userId: string
	sessionKey: Uint8Array<ArrayBufferLike> | null
	preKeysPub: GetPreKeysQuery['getPreKeys']
	mySecretPreKey: PreKeyBundleClient | null
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	getSharedSecretKey: ReturnType<typeof useGetSharedSecretKeyLazyQuery>[0]
	getSecretMessage: ReturnType<typeof useGetSecretMessageLazyQuery>[0]
	processedRef?: MutableRefObject<Set<string>>
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	newMessage?: MessageType
	needPersistKey?: boolean
	ackMessageIds?: string[]
	ackSharedKeyIds?: string[]
}> => {
	const {
		msg,
		chat,
		chatId,
		groupId,
		userId,
		sessionKey,
		preKeysPub,
		mySecretPreKey,
		getPreKeys,
		getSecretMessage,
		processedRef,
		getSharedSecretKey
	} = params

	if (!msg || !chat || preKeysPub.length === 0 || !mySecretPreKey) return {}

	try {
		const key = `${msg.iv}.${msg.sig}`
		if (processedRef?.current?.has(key)) {
			return {}
		}
	} catch {}

	let currentSession = sessionKey
	let recoveredSharedPackets: GetSharedSecretKeyQuery['getSharedSecretKey'] =
		[]
	let ackSharedKeyIds: string[] = []
	if (!currentSession) {
		const fromDisk = await loadMyKeys(chatId, groupId)
		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex
		} else if (mySecretPreKey) {
			try {
				const recovered = await recoverDirectSessionFromSharedPacketsAction(
					{
						chatId,
						userId,
						mySecretPreKey,
						preKeysPub,
						getSharedSecretKey,
						getPreKeys
					}
				)
				recoveredSharedPackets = recovered.packets
				ackSharedKeyIds = recovered.usedPacketIds
				if (recovered.sessionKey) {
					currentSession = recovered.sessionKey
				}
				if (msg?.ukm) {
					const ikPrivHex = mySecretPreKey.ikPriv || ''
					const spkPrivHex = mySecretPreKey.spkPriv || ''
					if (!ikPrivHex || !spkPrivHex) {
						console.warn(
							'[SecretChat][Sub] mySecretPreKey is missing private keys'
						)
						return {}
					}
					const ikPriv = await importPrivateRaw(fromHex(ikPrivHex))
					const spkPriv = await importPrivateRaw(fromHex(spkPrivHex))
					let senderIkPub =
						recoveredSharedPackets.find(
							packet =>
								packet.fromUserId === msg.fromUserId &&
								packet.ukm === msg.ukm
						)?.ikPub ||
						preKeysPub.find(pk => pk.userId === msg.fromUserId)
							?.ikPub ||
						undefined
					if (!senderIkPub && getPreKeys) {
						try {
							const preKeysResponse = await getPreKeys({
								variables: { chatId }
							})
							const fresh = preKeysResponse.data?.getPreKeys || []
							senderIkPub = fresh.find(
								pk => pk.userId === msg.fromUserId
							)?.ikPub
						} catch (e) {
							console.warn(
								'[SecretChat][Sub] getPreKeys refresh failed:',
								e
							)
						}
					}
					if (!senderIkPub) {
						console.warn(
							'[SecretChat][Sub] senderIkPub missing; abort finalize'
						)
						return {}
					}
					const envelope = {
						// reuse the original shared-key packet metadata for init-envelope decrypt
						ikAPub: senderIkPub,
						ekAPub: recoveredSharedPackets.find(
							packet =>
								packet.fromUserId === msg.fromUserId &&
								packet.ukm === msg.ukm
						)?.ekPub!,
						usedOpk: recoveredSharedPackets.find(
							packet =>
								packet.fromUserId === msg.fromUserId &&
								packet.ukm === msg.ukm
						)?.usedOpk ?? null,
						ukm: msg.ukm,
						iv: msg.iv,
						ct: msg.encryptedMessage,
						sig: msg.sig
					}
					const opkPriv = await resolveMyUsedOpkPrivateKey({
						chatId,
						userId,
						usedOpk: envelope.usedOpk,
						mySecretPreKey,
						preKeysPub,
						getPreKeys
					})
					const finalize = await finalizeFromEnvelope({
						bobIKPriv: ikPriv,
						bobSPKPriv: spkPriv,
						opkPriv,
						envelope
					})
					currentSession = finalize.sessionKey
					try {
						processedRef?.current?.add(`${msg.iv}.${msg.sig}`)
					} catch {}
					const sender = chat.members.find(
						(m: any) => m.user.id === msg.fromUserId
					)?.user
					const firstMessage = createLocalSecretMessage({
						plaintext: finalize.decrypted,
						senderId: msg.fromUserId,
						senderUsername: sender?.username || 'user',
						chatName: chat.chatName,
						messageId: msg.id
					})

					return {
						sessionKey: currentSession,
						newMessage: firstMessage,
						needPersistKey: true,
						ackMessageIds: msg.id ? [msg.id] : [],
						ackSharedKeyIds
					}
				}
			} catch (e) {
				console.warn('[SecretChat][Sub] finalize failed:', e)
			}
		}
	}

	if (!currentSession) return {}

	let senderIkPub =
		(msg as any)?.ikPub ||
		preKeysPub.find(pk => pk.userId === msg.fromUserId)?.ikPub
	if (!senderIkPub && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({ variables: { chatId } })
			const fresh = preKeysResponse.data?.getPreKeys || []
			senderIkPub = fresh.find(pk => pk.userId === msg.fromUserId)?.ikPub
		} catch (e) {
			console.warn('[SecretChat][Sub] getPreKeys refresh failed:', e)
		}
	}
	if (!senderIkPub) return {}

	const { decrypted, sigOk } = await decryptSessionMsgEnvelope({
		sessionKey: currentSession,
		envelope: { iv: msg.iv, ct: msg.encryptedMessage, sig: msg.sig },
		senderIkPub
	})
	if (!sigOk) return {}
	try {
		processedRef?.current?.add(`${msg.iv}.${msg.sig}`)
	} catch {}

	const sender = chat.members.find(
		(m: any) => m.user.id === msg.fromUserId
	)?.user
	const newMessage = createLocalSecretMessage({
		plaintext: decrypted,
		senderId: msg.fromUserId,
		senderUsername: sender?.username || 'user',
		chatName: chat.chatName,
		messageId: msg.id
	})
	return {
		sessionKey: currentSession,
		newMessage,
		ackMessageIds: msg.id ? [msg.id] : [],
		ackSharedKeyIds
	}
}

/**
 * Пуллинг секретных сообщений
 */
export const pullSecretMessagesAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	chat: any
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getSecretMessage: ReturnType<typeof useGetSecretMessageLazyQuery>[0]
	getSecretMessages: ReturnType<typeof useGetSecretMessagesLazyQuery>[0]
	getSharedSecretKey?: ReturnType<typeof useGetSharedSecretKeyLazyQuery>[0]
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	processedRef?: MutableRefObject<Set<string>>
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	newMessages: MessageType[]
	needPersistKey?: boolean
	ackMessageIds?: string[]
	ackSharedKeyIds?: string[]
}> => {
	const {
		chatId,
		groupId,
		userId,
		chat,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		getSecretMessage,
		getSecretMessages,
		getSharedSecretKey,
		processedRef
	} = params

	if (!chat || preKeysPub.length === 0 || !mySecretPreKey || !chatId)
		return { newMessages: [] }

	let currentSession = sessionKey
	let needPersistKey = false
	let recoveredSharedPackets: GetSharedSecretKeyQuery['getSharedSecretKey'] =
		[]
	let ackSharedKeyIds: string[] = []

	const decryptUnreadMessagesWithSession = async (
		unreadMessages: Array<
			| NonNullable<GetSecretMessagesQuery['getSecretMessages'][number]>
			| NonNullable<GetSecretMessageQuery['getSecretMessage']>
		>,
		activeSession: Uint8Array<ArrayBufferLike>,
		initialProcessedKeys?: Set<string>
	) => {
		const collectedMessages: MessageType[] = []
		const ackMessageIds: string[] = []
		const ackRecoveredSharedKeyIds: string[] = []
		const processedKeys = initialProcessedKeys ?? new Set<string>()

		for (const msg of unreadMessages) {
			const key = `${msg.iv}.${msg.sig}`
			if (processedKeys.has(key) || processedRef?.current?.has(key)) {
				continue
			}

			if (msg.ukm) {
				const packet = recoveredSharedPackets.find(
					sharedPacket =>
						sharedPacket.fromUserId === msg.fromUserId &&
						sharedPacket.ukm === msg.ukm
				)

				if (packet) {
					const ikPrivHex = mySecretPreKey.ikPriv || ''
					const spkPrivHex = mySecretPreKey.spkPriv || ''
					if (!ikPrivHex || !spkPrivHex) {
						continue
					}

					try {
						const ikPriv = await importPrivateRaw(fromHex(ikPrivHex))
						const spkPriv = await importPrivateRaw(
							fromHex(spkPrivHex)
						)
						const opkPriv = await resolveMyUsedOpkPrivateKey({
							chatId,
							userId,
							usedOpk: packet.usedOpk ?? null,
							mySecretPreKey,
							preKeysPub,
							getPreKeys: params.getPreKeys
						})

						let senderIkPub =
							packet.ikPub ||
							preKeysPub.find(
								pk => pk.userId === msg.fromUserId
							)?.ikPub
						if (!senderIkPub && params.getPreKeys) {
							const preKeysResponse = await params.getPreKeys({
								variables: { chatId }
							})
							const fresh =
								preKeysResponse.data?.getPreKeys || []
							senderIkPub = fresh.find(
								pk => pk.userId === msg.fromUserId
							)?.ikPub
						}
						if (!senderIkPub) continue

						const finalize = await finalizeFromEnvelope({
							bobIKPriv: ikPriv,
							bobSPKPriv: spkPriv,
							opkPriv,
							envelope: {
								ikAPub: senderIkPub,
								ekAPub: packet.ekPub,
								usedOpk: packet.usedOpk ?? null,
								ukm: msg.ukm,
								iv: msg.iv,
								ct: msg.encryptedMessage,
								sig: msg.sig
							}
						})

						processedKeys.add(key)
						try {
							processedRef?.current?.add(key)
						} catch {}

						const sender = chat.members.find(
							(m: any) => m.user.id === msg.fromUserId
						)?.user
						collectedMessages.push(
							createLocalSecretMessage({
								plaintext: finalize.decrypted,
								senderId: msg.fromUserId,
								senderUsername: sender?.username || 'user',
								chatName: chat.chatName,
								messageId: msg.id,
								createdAt:
									'createdAt' in msg &&
									typeof msg.createdAt === 'string'
										? msg.createdAt
										: undefined
							})
						)
						if (msg.id) {
							ackMessageIds.push(msg.id)
						}
						ackRecoveredSharedKeyIds.push(packet.id)
						continue
					} catch {
						// Optional recovery path: if finalize-from-packet fails here,
						// fall through to the regular session decrypt path below.
					}
				}
			}

			let senderIkPub =
				(msg as { ikPub?: string | null }).ikPub ||
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
					console.warn(
						'[SecretChat][Pull] getPreKeys refresh failed:',
						e
					)
				}
			}
			if (!senderIkPub) {
				console.warn(
					'[SecretChat][Pull] senderIkPub missing; skip msg'
				)
				continue
			}

			const { decrypted, sigOk } = await decryptSessionMsgEnvelope({
				sessionKey: activeSession,
				envelope: {
					iv: msg.iv,
					ct: msg.encryptedMessage,
					sig: msg.sig
				},
				senderIkPub
			})
			if (!sigOk) continue

			processedKeys.add(key)
			try {
				processedRef?.current?.add(key)
			} catch {}

			const sender = chat.members.find(
				(m: any) => m.user.id === msg.fromUserId
			)?.user
			collectedMessages.push(
				createLocalSecretMessage({
					plaintext: decrypted,
					senderId: msg.fromUserId,
					senderUsername: sender?.username || 'user',
					chatName: chat.chatName,
					messageId: msg.id,
					createdAt:
						'createdAt' in msg && typeof msg.createdAt === 'string'
							? msg.createdAt
							: undefined
				})
			)
			if (msg.id) {
				ackMessageIds.push(msg.id)
			}
		}

		return {
			collectedMessages,
			processedKeys,
			ackMessageIds,
			ackSharedKeyIds: ackRecoveredSharedKeyIds
		}
	}

	const fetchUnreadMessages = async () => {
		try {
			const res = await getSecretMessages({
				variables: { chatId },
				fetchPolicy: 'network-only'
			})
			const unread = res.data?.getSecretMessages ?? []
			return unread
		} catch (error) {
			console.warn(
				'[SecretChat][Pull] getSecretMessages failed, falling back to single-message queue reads:',
				error
			)
			return null
		}
	}

	const fetchUnreadMessagesFallback = async () => {
		try {
			const res = await getSecretMessage({
				variables: { chatId },
				fetchPolicy: 'network-only'
			})
			const unread = res.data?.getSecretMessage
				? [res.data.getSecretMessage]
				: []
			return unread
		} catch {
			return []
		}
	}

	const recoverDirectSessionKey = async () => {
		if (chat.isGroup || !mySecretPreKey || !getSharedSecretKey) return null

		try {
			const recovered = await recoverDirectSessionFromSharedPacketsAction({
				chatId,
				userId,
				mySecretPreKey,
				preKeysPub,
				getSharedSecretKey,
				getPreKeys: params.getPreKeys
			})
			recoveredSharedPackets = recovered.packets
			ackSharedKeyIds = recovered.usedPacketIds
			if (recovered.sessionKey) {
				return recovered.sessionKey
			}
		} catch (error) {
			console.warn(
				'[SecretChat][Pull] getSharedSecretKey failed during direct session recovery:',
				error
			)
		}

		return null
	}

	if (!currentSession) {
		const fromDisk = await loadMyKeys(chatId, groupId)

		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex
		} else {
			const recoveredDirectSessionKey = await recoverDirectSessionKey()
			if (recoveredDirectSessionKey) {
				currentSession = recoveredDirectSessionKey
				needPersistKey = true
			}
		}

		if (!currentSession && mySecretPreKey) {
			try {
				const batchUnreadMessages = await fetchUnreadMessages()
				let msg:
					| GetSecretMessageQuery['getSecretMessage']
					| GetSecretMessagesQuery['getSecretMessages'][number]
					| undefined

				if (batchUnreadMessages?.length) {
					msg =
						batchUnreadMessages.find(candidate => !!candidate.ukm) ??
						batchUnreadMessages[0]
				} else {
					const resMsg = await getSecretMessage({
						variables: { chatId }
					})
					msg = resMsg.data?.getSecretMessage
				}

				if (msg && msg.ukm) {
					const ikPrivHex = mySecretPreKey.ikPriv || ''
					const spkPrivHex = mySecretPreKey.spkPriv || ''
					if (!ikPrivHex || !spkPrivHex) {
						console.warn(
							'[SecretChat][Pull] mySecretPreKey is missing private keys'
						)
						return { newMessages: [] }
					}
					const ikPriv = await importPrivateRaw(fromHex(ikPrivHex))
					const spkPriv = await importPrivateRaw(fromHex(spkPrivHex))
					let senderIkPub =
						preKeysPub.find(pk => pk.userId === msg.fromUserId)
							?.ikPub || undefined
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
							console.warn(
								'[SecretChat][Pull] getPreKeys refresh failed:',
								e
							)
						}
					}
					if (!senderIkPub) {
						console.warn(
							'[SecretChat][Pull] senderIkPub missing; abort finalize'
						)
						return { newMessages: [] }
					}
					const ek = msg.ekPub as string | undefined
					const used = (msg.usedOpk as string | undefined) ?? null
					if (!ek) {
						console.warn(
							'[SecretChat][Pull] ekPub missing in GSM payload, cannot finalize session'
						)
						return { newMessages: [] }
					}
					const envelope = {
						ikAPub: senderIkPub,
						ekAPub: ek,
						usedOpk: used,
						ukm: msg.ukm,
						iv: msg.iv,
						ct: msg.encryptedMessage,
						sig: msg.sig
					}
					const opkPriv = await resolveMyUsedOpkPrivateKey({
						chatId,
						userId,
						usedOpk: used,
						mySecretPreKey,
						preKeysPub,
						getPreKeys: params.getPreKeys
					})
					const finalize = await finalizeFromEnvelope({
						bobIKPriv: ikPriv,
						bobSPKPriv: spkPriv,
						opkPriv,
						envelope
					})
					currentSession = finalize.sessionKey
					needPersistKey = true
					const sender = chat.members.find(
						(m: any) => m.user.id === msg.fromUserId
					)?.user
					const firstMessage = createLocalSecretMessage({
						plaintext: finalize.decrypted,
						senderId: msg.fromUserId,
						senderUsername: sender?.username || 'user',
						chatName: chat.chatName,
						messageId: msg.id,
						createdAt:
							'createdAt' in msg && typeof msg.createdAt === 'string'
								? msg.createdAt
								: undefined
					})
					const collectedTail: MessageType[] = [firstMessage]
					try {
						processedRef?.current?.add(`${msg.iv}.${msg.sig}`)
					} catch {}
					const processedKeys = new Set<string>([
						`${msg.iv}.${msg.sig}`
					])
					const unreadTail =
						batchUnreadMessages ??
						(await fetchUnreadMessagesFallback())
					const {
						collectedMessages,
						ackMessageIds,
						ackSharedKeyIds: decryptedSharedKeyIds
					} =
						await decryptUnreadMessagesWithSession(
							unreadTail,
							currentSession,
							processedKeys
						)
					collectedTail.push(...collectedMessages)
					return {
						sessionKey: currentSession,
						newMessages: collectedTail,
						needPersistKey,
						ackMessageIds: [
							...(msg.id ? [msg.id] : []),
							...ackMessageIds.filter(id => id !== msg.id)
						],
						ackSharedKeyIds: Array.from(
							new Set([
								...ackSharedKeyIds,
								...decryptedSharedKeyIds
							])
						)
					}
				}
			} catch (e) {
				console.warn('[SecretChat][Pull] GSM finalize failed:', e)
			}
		}
	}

	const collected: MessageType[] = []
	const unreadMessages =
		(await fetchUnreadMessages()) ?? (await fetchUnreadMessagesFallback())
	if (currentSession) {
		const { collectedMessages, ackMessageIds } =
			await decryptUnreadMessagesWithSession(
			unreadMessages,
			currentSession
		)
		collected.push(...collectedMessages)
		return {
			sessionKey: currentSession ?? undefined,
			newMessages: collected,
			needPersistKey,
			ackMessageIds,
			ackSharedKeyIds
		}
	}
	return {
		sessionKey: currentSession ?? undefined,
		newMessages: collected,
		needPersistKey,
		ackSharedKeyIds
	}
}

/**
 * Отправка секретного сообщения
 */
export const sendSecretMessageAction = async (params: {
	text: string
	user: FindAllUsersQuery['findAllUsers'][number]
	chat: any
	chatId: string
	groupId: string
	userId: string
	files: SendFileType[]
	setFiles: Dispatch<SetStateAction<SendFileType[]>>
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	sendMessageToClients: ReturnType<typeof useSendSecretMessageMutation>[0]
	sendSharedSecretKey: ReturnType<typeof useSendSharedSecretKeyMutation>[0]
	uploadSecretAttachment: ReturnType<
		typeof useUploadSecretAttachmentMutation
	>[0]
	discardSecretAttachment: ReturnType<
		typeof useDiscardSecretAttachmentMutation
	>[0]
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
		setFiles,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		sendMessageToClients,
		sendSharedSecretKey,
		uploadSecretAttachment,
		discardSecretAttachment
	} = params

	if (!chat || (!text.trim() && files.length === 0)) return {}

	const recipientUserIds = (chat.members || [])
		.filter((member: any) => member.user.id !== userId)
		.map((member: any) => member.user.id) as string[]
	if (recipientUserIds.length === 0) {
		console.error('Получатели не найдены в чате')
		return { errorMessage: 'Получатели не найдены в чате' }
	}

	const uploadedAttachmentIds: string[] = []

	try {
		const stagedAttachments =
			files.length > 0
				? await stageSecretAttachmentsAction({
						chatId,
						files,
						setFiles,
						uploadSecretAttachment
					})
				: []
		uploadedAttachmentIds.push(
			...stagedAttachments.map(attachment => attachment.attachmentId)
		)

		const plaintext = buildSecretMessagePlaintext(text, stagedAttachments)
		const newMessage = createLocalSecretMessage({
			plaintext,
			senderId: user.id,
			senderUsername: user.username,
			chatName: chat.chatName
		})

		if (!sessionKey) {
			const existingSessionKey = await loadMyKeys(chatId, groupId)
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
					plaintext,
					sessionKey: existingSessionKey.sessionKeyHex,
					signerIKPriv: await importPrivateRaw(
						fromHex(mySecretPreKeyLocal!.ikPriv)
					)
				})

				await sendMessageToClients({
					variables: {
						data: {
							chatId,
							encryptedMessage: envelope.ct,
							groupId,
							iv: envelope.iv,
							ukm: null,
							sig: envelope.sig,
							toUserIds: recipientUserIds,
							secretAttachmentIds: uploadedAttachmentIds
						}
					}
				})

				return {
					newMessage,
					sessionKey: existingSessionKey.sessionKeyHex
				}
			}

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
				return {
					newMessage,
					errorMessage: 'Мой ikPub не найден в preKeys'
				}
			}
			const ikPubRaw = fromHex(myIkPubHex)
			const IK = {
				privateKey: await importPrivateRaw(ikPrivRaw),
				publicKey: await importPublicRaw(ikPubRaw)
			} as const

			let recipientBundle = preKeysPub.find(
				pk => pk.userId === recipientUserIds[0]
			)
			if (!recipientBundle) {
				try {
					const preKeysResponse = await getPreKeys({
						variables: { chatId }
					})
					if (preKeysResponse.data?.getPreKeys) {
						recipientBundle = preKeysResponse.data.getPreKeys.find(
							pk => pk.userId === recipientUserIds[0]
						) as any
					}
				} catch {}
			}
			if (!recipientBundle) {
				console.error('PreKeys получателя не найдены')
				return {
					newMessage,
					errorMessage: 'PreKeys получателя не найдены'
				}
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
						recipientBundle.opkPubs[recipientBundle.indexOpkPub] ??
						null
				},
				plaintext
			})
			if (!verifiedSpk) {
				console.error('Не удалось проверить подпись SPK получателя')
				return {
					newMessage,
					errorMessage: 'Не удалось проверить подпись SPK получателя'
				}
			}

			try {
				await sendSharedSecretKey({
					variables: {
						data: {
							chatId,
							groupId,
							toUserId: recipientUserIds[0],
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
			} catch (error) {
				console.warn('[SecretChat] sendSharedSecretKey failed:', error)
			}

			await sendMessageToClients({
				variables: {
					data: {
						chatId,
						encryptedMessage: initEnvelope.ct,
						groupId,
						iv: initEnvelope.iv,
						sig: initEnvelope.sig,
						ukm: initEnvelope.ukm,
						toUserIds: recipientUserIds,
						secretAttachmentIds: uploadedAttachmentIds
					}
				}
			})

			return {
				newMessage,
				sessionKey: newSessionKey,
				needPersistKey: true
			}
		}

		const { envelope } = await buildSessionMsgEnvelope({
			plaintext,
			sessionKey,
			signerIKPriv: await importPrivateRaw(
				fromHex(mySecretPreKey!.ikPriv)
			)
		})

		await sendMessageToClients({
			variables: {
				data: {
					chatId,
					encryptedMessage: envelope.ct,
					groupId,
					iv: envelope.iv,
					ukm: null,
					sig: envelope.sig,
					toUserIds: recipientUserIds,
					secretAttachmentIds: uploadedAttachmentIds
				}
			}
		})

		return { newMessage }
	} catch (error) {
		if (uploadedAttachmentIds.length > 0) {
			await cleanupUploadedSecretAttachmentsAction({
				attachmentIds: uploadedAttachmentIds,
				chatId,
				discardSecretAttachment
			})
		}

		setFiles(prev =>
			prev.map(file =>
				file.status === 'uploaded'
					? {
							...file,
							status: 'failed',
							errorMessage:
								file.errorMessage ||
								'Failed to send secret message with attachments.'
						}
					: file
			)
		)

		return {
			errorMessage:
				getGraphQLErrorMessage(error) || 'Failed to send secret message'
		}
	}
}

/**
 * Удаление сообщений
 */
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

/**
 * Выбор файла
 */
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
		const name = decodeURIComponent(asset.name ?? 'unknown')
		const sizeStr = String(asset.size ?? 0)
		return {
			newFile: {
				id: createId(),
				name,
				size: sizeStr,
				uri: asset.uri,
				status: 'pending'
			}
		}
	} catch (err) {
		console.error('Ошибка при выборе файла:', err)
		return { errorMessage: 'Ошибка выбора файла' }
	}
}

export const pickImageAction = async (): Promise<{
	newFile?: PickedFile
	errorMessage?: string
}> => {
	try {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: false,
			quality: 0.8
		})

		if (result.canceled || !result.assets?.[0]) {
			return {}
		}

		const asset = result.assets[0]
		const rawName = asset.fileName ?? `image_${Date.now()}.jpg`
		const name = decodeURIComponent(rawName)
		const sizeStr = String(asset.fileSize ?? 0)

		return {
			newFile: {
				id: createId(),
				name,
				size: sizeStr,
				uri: asset.uri,
				status: 'pending'
			}
		}
	} catch (err) {
		console.error('Ошибка при выборе изображения:', err)
		return { errorMessage: 'Ошибка выбора изображения' }
	}
}

/**
 * Очистка формы
 */
export const clearFormAction = (): {
	draftText: string
	files: SendFileType[]
} => ({
	draftText: '',
	files: []
})

/**
 * Получение и расшифровка общего ключа Кузнечика при заходе в чат.
 * Получатель: финализирует X3DH-сессию с инициатором, расшифровывает общий ключ группы.
 */
export const receiveGroupKeyAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	preferredFromUserId?: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys?: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	getSharedSecretKey: ReturnType<typeof useGetSharedSecretKeyLazyQuery>[0]
}): Promise<{
	groupKey?: Uint8Array
	needPersistKey?: boolean
	ackSharedKeyIds?: string[]
	errorMessage?: string
}> => {
	const {
		chatId,
		groupId,
		userId,
		preferredFromUserId,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		getSharedSecretKey
	} = params

	if (!mySecretPreKey) {
		return { errorMessage: 'Нет приватных ключей' }
	}

	try {
		const res = await getSharedSecretKey({ variables: { chatId } })
		const sharedKeys = res.data?.getSharedSecretKey
		if (!sharedKeys || sharedKeys.length === 0) {
			return { errorMessage: 'Общий ключ ещё не был передан' }
		}

		const packetsForUser = sharedKeys.filter(sk => sk.toUserId === userId)
		if (packetsForUser.length === 0) {
			return { errorMessage: 'Общий ключ ещё не был передан вам' }
		}

		const preferredPackets = preferredFromUserId
			? packetsForUser.filter(sk => sk.fromUserId === preferredFromUserId)
			: []
		const fallbackPackets = packetsForUser.filter(
			sk => sk.fromUserId !== preferredFromUserId
		)
		const sortNewestFirst = (
			a: (typeof packetsForUser)[number],
			b: (typeof packetsForUser)[number]
		) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		const candidatePackets = [
			...preferredPackets.slice().sort(sortNewestFirst),
			...fallbackPackets.slice().sort(sortNewestFirst)
		]

		if (packetsForUser.length > 1 && candidatePackets[0]) {
			console.warn(
				`[SecretChat][ReceiveGroup] Найдено ${packetsForUser.length} пакетов sharedSecretKey для ${userId}; сначала пробую пакет от ${candidatePackets[0].fromUserId}`
			)
		}

		if (candidatePackets.length === 0) {
			return { errorMessage: 'Не удалось выбрать пакет общего ключа' }
		}

		const ikPrivHex = mySecretPreKey.ikPriv || ''
		const spkPrivHex = mySecretPreKey.spkPriv || ''
		if (!ikPrivHex || !spkPrivHex) {
			return { errorMessage: 'Мои PreKeys не содержат приватных ключей' }
		}
		const ikPriv = await importPrivateRaw(fromHex(ikPrivHex))
		const spkPriv = await importPrivateRaw(fromHex(spkPrivHex))

		for (const packet of candidatePackets) {
			try {
				const opkPriv = await resolveMyUsedOpkPrivateKey({
					chatId,
					userId,
					usedOpk: packet.usedOpk ?? null,
					mySecretPreKey,
					preKeysPub,
					getPreKeys
				})

				const { sessionKey: pairSessionKey } =
					await finalizeSessionX3DH({
						bobIKPriv: ikPriv,
						bobSPKPriv: spkPriv,
						opkPriv,
						envelope: {
							ikAPub: packet.ikPub,
							ekAPub: packet.ekPub,
							usedOpk: packet.usedOpk ?? null,
							ukm: packet.ukm
						}
					})

				const groupKeyBytes = await decryptKuz(
					pairSessionKey,
					fromHex(packet.iv),
					fromHex(packet.encryptedKey)
				)

				let senderIkPub =
					packet.ikPub ||
					preKeysPub.find(pk => pk.userId === packet.fromUserId)
						?.ikPub
				if (!senderIkPub && getPreKeys) {
					try {
						const preKeysResponse = await getPreKeys({
							variables: { chatId }
						})
						const fresh = preKeysResponse.data?.getPreKeys || []
						senderIkPub = fresh.find(
							pk => pk.userId === packet.fromUserId
						)?.ikPub
					} catch {}
				}
				if (senderIkPub) {
					const pubKey = await importPublicRaw(fromHex(senderIkPub))
					const ekAPubRaw = fromHex(packet.ekPub)
					const ikAPubRaw = fromHex(packet.ikPub)
					const aad = new Uint8Array([
						...new TextEncoder().encode('GROUPKEYv1'),
						...ikAPubRaw,
						...ekAPubRaw
					])
					const sigOk = await verifyBytes(
						pubKey,
						new Uint8Array([
							...aad,
							...fromHex(packet.iv),
							...fromHex(packet.encryptedKey)
						]),
						fromHex(packet.sig)
					)
					if (!sigOk) {
						console.warn(
							`[SecretChat][ReceiveGroup] Подпись общего ключа невалидна для пакета ${packet.id}`
						)
						continue
					}
				}

				return {
					groupKey: groupKeyBytes,
					needPersistKey: true,
					ackSharedKeyIds: [packet.id]
				}
			} catch (packetError) {
				console.warn(
					`[SecretChat][ReceiveGroup] Пакет ${packet.id} не подошёл:`,
					packetError
				)
			}
		}

		return { errorMessage: 'Не удалось расшифровать общий ключ группы' }
	} catch (e) {
		console.error('[SecretChat][ReceiveGroup] Ошибка получения ключа:', e)
		return { errorMessage: 'Ошибка получения общего ключа группы' }
	}
}

/**
 * Отправка существующего группового ключа новому участнику (при invite)
 */
export const sendGroupKeyToNewMemberAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	targetUserId: string
	sessionKey: Uint8Array<ArrayBufferLike>
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	sendSharedSecretKey: ReturnType<typeof useSendSharedSecretKeyMutation>[0]
}): Promise<{
	success: boolean
	errorMessage?: string
}> => {
	const {
		chatId,
		groupId,
		userId,
		targetUserId,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		sendSharedSecretKey
	} = params

	if (!mySecretPreKey || !sessionKey) {
		return {
			success: false,
			errorMessage: 'Нет приватных ключей или сессионного ключа'
		}
	}

	try {
		const ikPrivRaw = fromHex(mySecretPreKey.ikPriv)
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
			return { success: false, errorMessage: 'Мой ikPub не найден' }
		}
		const ikPubRaw = fromHex(myIkPubHex)
		const IK = {
			privateKey: await importPrivateRaw(ikPrivRaw),
			publicKey: await importPublicRaw(ikPubRaw)
		} as const

		let recipientBundle = preKeysPub.find(pk => pk.userId === targetUserId)
		if (!recipientBundle) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getPreKeys) {
					recipientBundle = preKeysResponse.data.getPreKeys.find(
						pk => pk.userId === targetUserId
					) as any
				}
			} catch {}
		}
		if (!recipientBundle) {
			return {
				success: false,
				errorMessage: `PreKeys не найдены для ${targetUserId}`
			}
		}

		const aliceEK = await generateEphemeralKeyPair()

		const {
			sessionKey: pairSessionKey,
			ukm,
			verifiedSpk
		} = await establishSessionX3DH({
			IK,
			aliceEK,
			bobBundle: {
				ikPub: recipientBundle.ikPub,
				spkPub: recipientBundle.spkPub,
				spkSig: recipientBundle.spkSig,
				opk:
					recipientBundle.opkPubs[recipientBundle.indexOpkPub] ?? null
			}
		})

		if (!verifiedSpk) {
			return {
				success: false,
				errorMessage: `SPK подпись не прошла для ${targetUserId}`
			}
		}

		const enc = await encryptKuz(pairSessionKey, sessionKey)

		const ikAPubRaw = await exportPublicRaw(IK.publicKey)
		const ekAPubRaw = await exportPublicRaw(aliceEK.publicKey)
		const aad = new Uint8Array([
			...new TextEncoder().encode('GROUPKEYv1'),
			...ikAPubRaw,
			...ekAPubRaw
		])
		const signature = await signBytes(
			IK.privateKey,
			new Uint8Array([...aad, ...enc.iv, ...enc.ciphertext])
		)

		await sendSharedSecretKey({
			variables: {
				data: {
					chatId,
					groupId,
					toUserId: targetUserId,
					ikPub: myIkPubHex,
					ekPub: toHex(ekAPubRaw),
					usedOpk:
						recipientBundle.opkPubs[recipientBundle.indexOpkPub] ??
						null,
					ukm: toHex(ukm),
					iv: toHex(enc.iv),
					encryptedKey: toHex(enc.ciphertext),
					sig: toHex(signature)
				}
			}
		})

		return { success: true }
	} catch (e) {
		console.error(
			'[SecretChat][InviteKey] Ошибка отправки ключа новому участнику:',
			e
		)
		return {
			success: false,
			errorMessage: 'Ошибка отправки ключа новому участнику'
		}
	}
}

/**
 * Инициализация группового секретного чата при первом заходе.
 * Устанавливает попарную X3DH-сессию с каждым участником чата,
 * генерирует один общий ключ Кузнечика (ГОСТ Р 34.12),
 * шифрует его каждым попарным сессионным ключом и рассылает участникам.
 */
export const initGroupSessionAction = async (params: {
	chat: any
	chatId: string
	groupId: string
	userId: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: GetPreKeysQuery['getPreKeys']
	getPreKeys: ReturnType<typeof useGetPreKeysLazyQuery>[0]
	sendSharedSecretKey: ReturnType<typeof useSendSharedSecretKeyMutation>[0]
}): Promise<{
	groupKey?: Uint8Array
	groupKeyHex?: string
	needPersistKey?: boolean
	errorMessage?: string
}> => {
	const {
		chat,
		chatId,
		groupId,
		userId,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		sendSharedSecretKey
	} = params

	if (!chat || !mySecretPreKey) {
		return { errorMessage: 'Нет данных чата или приватных ключей' }
	}

	const otherMembers = (chat.members || []).filter(
		(m: any) => m.user.id !== userId
	)
	if (otherMembers.length === 0) {
		return { errorMessage: 'Нет других участников в чате' }
	}

	try {
		const { keyBytes: groupKeyBytes, keyHex: groupKeyHex } =
			await generateKuznechikKey()

		const ikPrivRaw = fromHex(mySecretPreKey.ikPriv)
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
			return { errorMessage: 'Мой ikPub не найден в preKeys' }
		}
		const ikPubRaw = fromHex(myIkPubHex)
		const IK = {
			privateKey: await importPrivateRaw(ikPrivRaw),
			publicKey: await importPublicRaw(ikPubRaw)
		} as const

		for (const member of otherMembers) {
			const recipientUserId = member.user.id

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
				console.warn(
					`[SecretChat][InitGroup] PreKeys не найдены для ${recipientUserId}, пропускаем`
				)
				continue
			}

			const aliceEK = await generateEphemeralKeyPair()

			const {
				sessionKey: pairSessionKey,
				ukm,
				verifiedSpk
			} = await establishSessionX3DH({
				IK,
				aliceEK,
				bobBundle: {
					ikPub: recipientBundle.ikPub,
					spkPub: recipientBundle.spkPub,
					spkSig: recipientBundle.spkSig,
					opk:
						recipientBundle.opkPubs[recipientBundle.indexOpkPub] ??
						null
				}
			})

			if (!verifiedSpk) {
				console.warn(
					`[SecretChat][InitGroup] SPK подпись не прошла для ${recipientUserId}, пропускаем`
				)
				continue
			}

			const enc = await encryptKuz(pairSessionKey, groupKeyBytes)

			const ikAPubRaw = await exportPublicRaw(IK.publicKey)
			const ekAPubRaw = await exportPublicRaw(aliceEK.publicKey)
			const aad = new Uint8Array([
				...new TextEncoder().encode('GROUPKEYv1'),
				...ikAPubRaw,
				...ekAPubRaw
			])
			const signature = await signBytes(
				IK.privateKey,
				new Uint8Array([...aad, ...enc.iv, ...enc.ciphertext])
			)

			try {
				await sendSharedSecretKey({
					variables: {
						data: {
							chatId,
							groupId,
							toUserId: recipientUserId,
							ikPub: myIkPubHex,
							ekPub: toHex(ekAPubRaw),
							usedOpk:
								recipientBundle.opkPubs[
									recipientBundle.indexOpkPub
								] ?? null,
							ukm: toHex(ukm),
							iv: toHex(enc.iv),
							encryptedKey: toHex(enc.ciphertext),
							sig: toHex(signature)
						}
					}
				})
			} catch (e) {
				console.warn(
					`[SecretChat][InitGroup] sendSharedSecretKey failed для ${recipientUserId}:`,
					e
				)
			}
		}

		return {
			groupKey: groupKeyBytes,
			groupKeyHex: groupKeyHex,
			needPersistKey: true
		}
	} catch (e) {
		console.error('[SecretChat][InitGroup] Ошибка инициализации:', e)
		return { errorMessage: 'Ошибка инициализации группового секрета' }
	}
}
