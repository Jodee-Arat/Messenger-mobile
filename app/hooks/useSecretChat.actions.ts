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
import { loadSavedSecretLinkedWebSessionId } from '@/services/secret/saved-secret-link.service'

import { MessageFileType } from '../types/message-file.type'
import { MessageType } from '../types/message.type'
import { SendFileType } from '../types/send-file.type'

import {
	FindAllUsersQuery,
	GetSecretSessionPreKeysQuery,
	GetSessionSecretMessagesQuery,
	GetSessionSharedSecretKeysQuery,
	useDiscardSecretAttachmentMutation,
	useGetSecretSessionPreKeysLazyQuery,
	useGetSessionSecretMessagesLazyQuery,
	useGetSessionSharedSecretKeysLazyQuery,
	useSendSessionSecretMessageMutation,
	useSendSessionSharedSecretKeyMutation,
	useUploadSecretAttachmentMutation
} from '@/graphql/generated/output'
import {
	PreKeyBundleClient,
	buildSessionMsgEnvelope,
	checkMyPreKeys,
	decryptKuz,
	decryptSessionMsgEnvelope,
	encryptKuz,
	establishSessionX3DH,
	exportPublicRaw,
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

type SecretSessionPreKeyRecord =
	GetSecretSessionPreKeysQuery['getSecretSessionPreKeys'][number]
type SessionSecretMessageRecord =
	GetSessionSecretMessagesQuery['getSessionSecretMessages'][number]
type SessionSharedSecretKeyRecord =
	GetSessionSharedSecretKeysQuery['getSessionSharedSecretKeys'][number]
type SecretSessionPreKeysQueryFn =
	ReturnType<typeof useGetSecretSessionPreKeysLazyQuery>[0]
type SessionSecretMessagesQueryFn =
	ReturnType<typeof useGetSessionSecretMessagesLazyQuery>[0]
type SessionSharedSecretKeysQueryFn =
	ReturnType<typeof useGetSessionSharedSecretKeysLazyQuery>[0]
type SendSessionSecretMessageMutationFn =
	ReturnType<typeof useSendSessionSecretMessageMutation>[0]
type SendSessionSharedSecretKeyMutationFn =
	ReturnType<typeof useSendSessionSharedSecretKeyMutation>[0]

const SECRET_MESSAGE_PAYLOAD_KIND = 'secret-message-v2'
const SAVED_LOCAL_ATTACHMENT_PREFIX = 'local-mobile:'
let lastLocalSecretMessageTimestamp = 0
type SecretAttachmentPayload = {
	attachmentId: string
	fileName: string
	fileFormat: string
	fileSize: string
	fileKeyHex: string
	ivHex: string
	ciphertextSize: string
	localUri?: string
}

type SecretMessagePayloadV2 = {
	kind: typeof SECRET_MESSAGE_PAYLOAD_KIND
	version: 2
	text: string
	attachments: SecretAttachmentPayload[]
}

const getFileFormatFromName = (fileName: string) =>
	fileName.split('.').pop() || 'file'

const getMySessionBundle = (
	bundles: SecretSessionPreKeyRecord[],
	secretSessionId: string
) => bundles.find(bundle => bundle.secretSessionId === secretSessionId)

const getBundlesForUser = (
	bundles: SecretSessionPreKeyRecord[],
	targetUserId: string
) => bundles.filter(bundle => bundle.userId === targetUserId)

const getTargetBundles = (
	bundles: SecretSessionPreKeyRecord[],
	targetUserIds: string[],
	excludedSessionId?: string
) =>
	bundles.filter(
		bundle =>
			targetUserIds.includes(bundle.userId) &&
			bundle.secretSessionId !== excludedSessionId
	)

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
	ciphertextSize: attachment.ciphertextSize,
	localUri: attachment.localUri
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
				typeof attachment?.ciphertextSize === 'string' &&
				(attachment?.localUri === undefined ||
					typeof attachment.localUri === 'string')
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

const getNextLocalSecretMessageCreatedAt = () => {
	const now = Date.now()
	const nextTimestamp =
		now <= lastLocalSecretMessageTimestamp
			? lastLocalSecretMessageTimestamp + 1
			: now

	lastLocalSecretMessageTimestamp = nextTimestamp
	return new Date(nextTimestamp).toISOString()
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
		createdAt: createdAt ?? getNextLocalSecretMessageCreatedAt(),
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

const createLocalSavedSecretAttachmentsAction = async (params: {
	chatId: string
	groupId: string
	files: SendFileType[]
}): Promise<SecretAttachmentPayload[]> => {
	const { chatId, groupId, files } = params
	const localAttachments: SecretAttachmentPayload[] = []

	for (const file of files) {
		if (!file.uri) {
			continue
		}

		const fileFormat = getFileFormatFromName(file.name)
		const attachmentId = `${SAVED_LOCAL_ATTACHMENT_PREFIX}${file.id}`
		const attachmentDirectory = new Directory(
			Paths.document,
			groupId,
			chatId,
			'local-attachments'
		)
		if (!attachmentDirectory.exists) {
			attachmentDirectory.create({ intermediates: true, idempotent: true })
		}

		const destination = new File(
			attachmentDirectory,
			`${file.id}.${fileFormat}`
		)
		if (!destination.exists) {
			const source = new File(file.uri)
			source.copy(destination)
		}

		localAttachments.push({
			attachmentId,
			fileName: file.name,
			fileFormat,
			fileSize: file.size,
			fileKeyHex: '',
			ivHex: '',
			ciphertextSize: file.size,
			localUri: destination.uri
		})
	}

	return localAttachments
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
	secretSessionId: string
	getPreKeys: SecretSessionPreKeysQueryFn
}): Promise<{
	mySecretPreKey?: PreKeyBundleClient | null
	preKeysPub?: SecretSessionPreKeyRecord[]
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	errorMessage?: string
}> => {
	const { chatId, secretSessionId, getPreKeys } = params
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
			const preKeys = preKeysResponse.data?.getSecretSessionPreKeys
			if (!preKeys || preKeys.length === 0) {
				return { errorMessage: 'PreKeys не найдены' }
			}
			const myPreKeys = await loadMyPreKeyJSON()
			if (!myPreKeys) {
				return { errorMessage: 'Мои PreKeys не найдены' }
			}
			const mySessionBundle = getMySessionBundle(preKeys, secretSessionId)
			const isMyPreKeys = mySessionBundle
				? await checkMyPreKeys(myPreKeys.toServer, mySessionBundle)
				: false
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
			let preKeysPub: SecretSessionPreKeyRecord[] | undefined
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getSecretSessionPreKeys) {
					preKeysPub = preKeysResponse.data.getSecretSessionPreKeys
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
	secretSessionId: string
	getPreKeys: SecretSessionPreKeysQueryFn
}): Promise<{
	chat: any | null
	mySecretPreKey?: PreKeyBundleClient | null
	preKeysPub?: SecretSessionPreKeyRecord[]
	sessionKey?: Uint8Array<ArrayBufferLike> | null
	errorMessage?: string
}> => {
	const { chatId, groupId, secretSessionId, getPreKeys } = params
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
			const preKeys = preKeysResponse.data?.getSecretSessionPreKeys
			if (!preKeys || preKeys.length === 0) {
				console.error('PreKeys не найдены')
				return { chat: null, errorMessage: 'PreKeys не найдены' }
			}

			const myPreKeys = await loadMyPreKeyJSON()
			if (!myPreKeys) {
				console.error('Мои PreKeys не найдены')
				return { chat: null, errorMessage: 'Мои PreKeys не найдены' }
			}

			const mySessionBundle = getMySessionBundle(preKeys, secretSessionId)
			const isMyPreKeys = mySessionBundle
				? await checkMyPreKeys(myPreKeys.toServer, mySessionBundle)
				: false
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
			let preKeysPub: SecretSessionPreKeyRecord[] | undefined
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				if (preKeysResponse.data?.getSecretSessionPreKeys) {
					preKeysPub = preKeysResponse.data.getSecretSessionPreKeys
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

const findOpkIndexForSession = (
	bundles: SecretSessionPreKeyRecord[],
	secretSessionId: string,
	usedOpk: string
) => {
	const myBundle = bundles.find(
		bundle => bundle.secretSessionId === secretSessionId
	)
	if (!myBundle) return -1

	return myBundle.opkPubs.findIndex(
		opk => opk?.toLowerCase() === usedOpk.toLowerCase()
	)
}

const resolveMyUsedOpkPrivateKey = async (params: {
	chatId: string
	secretSessionId: string
	usedOpk?: string | null
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	getPreKeys?: SecretSessionPreKeysQueryFn
}) => {
	const {
		chatId,
		secretSessionId,
		usedOpk,
		mySecretPreKey,
		preKeysPub,
		getPreKeys
	} = params

	if (!usedOpk) return undefined

	let opkIndex = findOpkIndexForSession(
		preKeysPub,
		secretSessionId,
		usedOpk
	)

	if (opkIndex < 0 && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({
				variables: { chatId }
			})
			const fresh = preKeysResponse.data?.getSecretSessionPreKeys || []
			const freshBundle = fresh.find(
				bundle => bundle.secretSessionId === secretSessionId
			)

			if (
				freshBundle &&
				freshBundle.opkPubs.length === mySecretPreKey.opkPriv.length
			) {
				opkIndex = findOpkIndexForSession(
					fresh,
					secretSessionId,
					usedOpk
				)
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
			`[SecretChat] usedOpk ${usedOpk.slice(0, 16)}... not found for session ${secretSessionId}`
		)
		return undefined
	}

	const opkPrivHex = mySecretPreKey.opkPriv?.[opkIndex]
	if (!opkPrivHex) {
		console.warn(
			`[SecretChat] missing local opkPriv for index ${opkIndex} and session ${secretSessionId}`
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

const recoverSessionKeyFromSharedPacketsAction = async (params: {
	chatId: string
	secretSessionId: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	getSharedSecretKey: SessionSharedSecretKeysQueryFn
	getPreKeys?: SecretSessionPreKeysQueryFn
}): Promise<{
	sessionKey?: Uint8Array<ArrayBufferLike>
	packets: SessionSharedSecretKeyRecord[]
	usedPacketIds: string[]
}> => {
	const {
		chatId,
		secretSessionId,
		mySecretPreKey,
		preKeysPub,
		getSharedSecretKey,
		getPreKeys
	} = params

	const response = await getSharedSecretKey({
		variables: { chatId, secretSessionId },
		fetchPolicy: 'network-only'
	})
	const packets =
		response.data?.getSessionSharedSecretKeys
			?.slice()
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
				secretSessionId,
				usedOpk: packet.usedOpk ?? null,
				mySecretPreKey,
				preKeysPub,
				getPreKeys
			})

			const { sessionKey: pairSessionKey } = await finalizeSessionX3DH({
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

			const decryptedSessionKey = await decryptKuz(
				pairSessionKey,
				fromHex(packet.iv),
				fromHex(packet.encryptedKey)
			)

			return {
				sessionKey: decryptedSessionKey,
				packets,
				usedPacketIds: [packet.id]
			}
		} catch (error) {
			console.warn(
				`[SecretQueue][Shared][Recover][Mobile] chat=${chatId} session=${secretSessionId} packet=${packet.id} failed:`,
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
	msg: SessionSecretMessageRecord
	chat: any
	chatId: string
	groupId: string
	userId: string
	secretSessionId: string
	sessionKey: Uint8Array<ArrayBufferLike> | null
	preKeysPub: SecretSessionPreKeyRecord[]
	mySecretPreKey: PreKeyBundleClient | null
	getPreKeys?: SecretSessionPreKeysQueryFn
	getSharedSecretKey: SessionSharedSecretKeysQueryFn
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
		secretSessionId,
		sessionKey,
		preKeysPub,
		mySecretPreKey,
		getPreKeys,
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
	let ackSharedKeyIds: string[] = []
	if (!currentSession) {
		const fromDisk = await loadMyKeys(chatId, groupId)
		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex
		} else {
			try {
				const recovered = await recoverSessionKeyFromSharedPacketsAction(
					{
						chatId,
						secretSessionId,
						mySecretPreKey,
						preKeysPub,
						getSharedSecretKey,
						getPreKeys
					}
				)
				ackSharedKeyIds = recovered.usedPacketIds
				if (recovered.sessionKey) {
					currentSession = recovered.sessionKey
				}
			} catch (e) {
				console.warn('[SecretChat][Sub] session recovery failed:', e)
			}
		}
	}

	if (!currentSession) return {}

	let senderIkPub =
		preKeysPub.find(pk => pk.secretSessionId === msg.fromSessionId)?.ikPub ||
		(msg as { ikPub?: string | null }).ikPub ||
		preKeysPub.find(pk => pk.userId === msg.fromUserId)?.ikPub
	if (!senderIkPub && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({ variables: { chatId } })
			const fresh = preKeysResponse.data?.getSecretSessionPreKeys || []
			senderIkPub =
				fresh.find(pk => pk.secretSessionId === msg.fromSessionId)?.ikPub ||
				fresh.find(pk => pk.userId === msg.fromUserId)?.ikPub
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
		messageId: msg.id,
		createdAt: msg.createdAt
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
	secretSessionId: string
	chat: any
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: SecretSessionPreKeyRecord[]
	getSecretMessages: SessionSecretMessagesQueryFn
	getSharedSecretKey?: SessionSharedSecretKeysQueryFn
	getPreKeys?: SecretSessionPreKeysQueryFn
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
		secretSessionId,
		chat,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		getPreKeys,
		getSecretMessages,
		getSharedSecretKey,
		processedRef
	} = params

	if (!chat || preKeysPub.length === 0 || !mySecretPreKey || !chatId)
		return { newMessages: [] }

	let currentSession = sessionKey
	let needPersistKey = false
	let ackSharedKeyIds: string[] = []

	if (!currentSession) {
		const fromDisk = await loadMyKeys(chatId, groupId)

		if (fromDisk?.sessionKeyHex) {
			currentSession = fromDisk.sessionKeyHex
		} else if (getSharedSecretKey) {
			try {
				const recovered = await recoverSessionKeyFromSharedPacketsAction({
					chatId,
					secretSessionId,
					mySecretPreKey,
					preKeysPub,
					getSharedSecretKey,
					getPreKeys
				})
				ackSharedKeyIds = recovered.usedPacketIds
				if (recovered.sessionKey) {
					currentSession = recovered.sessionKey
				}
			} catch (error) {
				console.warn(
					'[SecretChat][Pull] getSessionSharedSecretKeys failed during session recovery:',
					error
				)
			}

			if (currentSession) {
				needPersistKey = true
			}
		}
	}

	if (!currentSession) {
		return {
			sessionKey: currentSession ?? undefined,
			newMessages: [],
			needPersistKey,
			ackSharedKeyIds
		}
	}

	const unreadMessagesResponse = await getSecretMessages({
		variables: { chatId, secretSessionId },
		fetchPolicy: 'network-only'
	})
	const unreadMessages =
		unreadMessagesResponse.data?.getSessionSecretMessages ?? []

	let senderBundles = preKeysPub
	const missingSenderBundle = unreadMessages.some(
		message =>
			message.fromSessionId &&
			!senderBundles.find(
				bundle => bundle.secretSessionId === message.fromSessionId
			)
	)
	if (missingSenderBundle && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({
				variables: { chatId }
			})
			if (preKeysResponse.data?.getSecretSessionPreKeys) {
				senderBundles = preKeysResponse.data.getSecretSessionPreKeys
			}
		} catch (error) {
			console.warn('[SecretChat][Pull] getPreKeys refresh failed:', error)
		}
	}

	const collected: MessageType[] = []
	const ackMessageIds: string[] = []

	for (const msg of unreadMessages) {
		const key = `${msg.iv}.${msg.sig}`
		if (processedRef?.current?.has(key)) {
			continue
		}

		const senderIkPub =
			senderBundles.find(
				bundle => bundle.secretSessionId === msg.fromSessionId
			)?.ikPub ||
			senderBundles.find(bundle => bundle.userId === msg.fromUserId)?.ikPub

		if (!senderIkPub) {
			console.warn('[SecretChat][Pull] senderIkPub missing; skip msg')
			continue
		}

		const { decrypted, sigOk } = await decryptSessionMsgEnvelope({
			sessionKey: currentSession,
			envelope: {
				iv: msg.iv,
				ct: msg.encryptedMessage,
				sig: msg.sig
			},
			senderIkPub
		})
		if (!sigOk) continue

		try {
			processedRef?.current?.add(key)
		} catch {}

		const sender = chat.members.find(
			(member: any) => member.user.id === msg.fromUserId
		)?.user
		collected.push(
			createLocalSecretMessage({
				plaintext: decrypted,
				senderId: msg.fromUserId,
				senderUsername: sender?.username || 'user',
				chatName: chat.chatName,
				messageId: msg.id,
				createdAt: msg.createdAt
			})
		)
		ackMessageIds.push(msg.id)
	}

	return {
		sessionKey: currentSession,
		newMessages: collected,
		needPersistKey,
		ackMessageIds,
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
	secretSessionId: string
	isSaved?: boolean
	files: SendFileType[]
	setFiles: Dispatch<SetStateAction<SendFileType[]>>
	sessionKey: Uint8Array<ArrayBufferLike> | null
	mySecretPreKey: PreKeyBundleClient | null
	preKeysPub: SecretSessionPreKeyRecord[]
	getPreKeys: SecretSessionPreKeysQueryFn
	sendMessageToClients: SendSessionSecretMessageMutationFn
	sendSharedSecretKey: SendSessionSharedSecretKeyMutationFn
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
		secretSessionId,
		isSaved,
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

	const recipientUserIds = Array.from(
		new Set(
			(isSaved
				? [userId]
				: (chat.members || [])
						.filter((member: any) => member.user.id !== userId)
						.map((member: any) => member.user.id)) as string[]
		)
	)
	if (recipientUserIds.length === 0) {
		console.error('Получатели не найдены в чате')
		return { errorMessage: 'Получатели не найдены в чате' }
	}

	const uploadedAttachmentIds: string[] = []

	try {
		let currentPreKeys = preKeysPub
		let targetBundles = getTargetBundles(
			currentPreKeys,
			recipientUserIds,
			secretSessionId
		)
		if (targetBundles.length === 0) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				currentPreKeys =
					preKeysResponse.data?.getSecretSessionPreKeys ?? currentPreKeys
				targetBundles = getTargetBundles(
					currentPreKeys,
					recipientUserIds,
					secretSessionId
				)
			} catch {}
		}

		if (isSaved) {
			const linkedWebSessionId = await loadSavedSecretLinkedWebSessionId()
			targetBundles = linkedWebSessionId
				? targetBundles.filter(
						bundle => bundle.secretSessionId === linkedWebSessionId
				  )
				: []
		}

		if (targetBundles.length === 0) {
			if (isSaved) {
				const localAttachments =
					files.length > 0
						? await createLocalSavedSecretAttachmentsAction({
								chatId,
								groupId,
								files
						  })
						: []
				const localPlaintext = buildSecretMessagePlaintext(
					text,
					localAttachments
				)
				const localMessage = createLocalSecretMessage({
					plaintext: localPlaintext,
					senderId: user.id,
					senderUsername: user.username,
					chatName: chat.chatName
				})

				return {
					newMessage: localMessage,
					sessionKey
				}
			}

			console.error('Session prekeys получателей не найдены')
			return {
				errorMessage: 'Session prekeys получателей не найдены'
			}
		}

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

		let activeSessionKey = sessionKey
		let needPersistKey = false
		if (!activeSessionKey) {
			const existingSessionKey = await loadMyKeys(chatId, groupId)
			if (existingSessionKey?.sessionKeyHex) {
				activeSessionKey = existingSessionKey.sessionKeyHex
			} else {
				const generatedSessionKey = await generateKuznechikKey()
				activeSessionKey = generatedSessionKey.keyBytes
				needPersistKey = true
			}
		}

		if (!activeSessionKey) {
			return {
				newMessage,
				errorMessage: 'Не удалось подготовить session key'
			}
		}

		const shouldShareSessionKey = !chat.isGroup && needPersistKey
		if (shouldShareSessionKey) {
			const shared = await shareSessionKeyWithBundlesAction({
				chatId,
				groupId,
				userId,
				fromSessionId: secretSessionId,
				sessionKey: activeSessionKey,
				mySecretPreKey: mySecretPreKeyLocal,
				preKeysPub: currentPreKeys,
				targetBundles,
				getPreKeys,
				sendSharedSecretKey
			})
			if (!shared.success) {
				return {
					newMessage,
					errorMessage: shared.errorMessage
				}
			}
		}

		const { envelope } = await buildSessionMsgEnvelope({
			plaintext,
			sessionKey: activeSessionKey,
			signerIKPriv: await importPrivateRaw(
				fromHex(mySecretPreKeyLocal.ikPriv)
			)
		})

		const targetSessionIds = Array.from(
			new Set(targetBundles.map(bundle => bundle.secretSessionId))
		)

		const sentMessage = await sendMessageToClients({
			variables: {
				data: {
					chatId,
					encryptedMessage: envelope.ct,
					groupId,
					fromSessionId: secretSessionId,
					iv: envelope.iv,
					ukm: null,
					sig: envelope.sig,
					toUserIds: recipientUserIds,
					toSessionIds: targetSessionIds,
					secretAttachmentIds: uploadedAttachmentIds
				}
			}
		})
		const serverMessage = sentMessage.data?.sendSessionSecretMessage

		return {
			newMessage: serverMessage
				? {
						...newMessage,
						id: serverMessage.id,
						createdAt: serverMessage.createdAt
				  }
				: newMessage,
			sessionKey: activeSessionKey,
			needPersistKey
		}
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

export const shareSessionKeyWithBundlesAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	fromSessionId: string
	sessionKey: Uint8Array<ArrayBufferLike>
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	targetBundles: SecretSessionPreKeyRecord[]
	getPreKeys?: SecretSessionPreKeysQueryFn
	sendSharedSecretKey: SendSessionSharedSecretKeyMutationFn
}): Promise<{
	success: boolean
	errorMessage?: string
}> => {
	const {
		chatId,
		groupId,
		userId,
		fromSessionId,
		sessionKey,
		mySecretPreKey,
		preKeysPub,
		targetBundles,
		getPreKeys,
		sendSharedSecretKey
	} = params

	const uniqueTargetBundles = Array.from(
		new Map(
			targetBundles.map(bundle => [bundle.secretSessionId, bundle])
		).values()
	)
	if (uniqueTargetBundles.length === 0) {
		return { success: false, errorMessage: 'Нет target sessions для передачи ключа' }
	}

	let allBundles = preKeysPub
	let myBundle = getMySessionBundle(allBundles, fromSessionId)

	if (!myBundle && getPreKeys) {
		try {
			const preKeysResponse = await getPreKeys({
				variables: { chatId }
			})
			allBundles = preKeysResponse.data?.getSecretSessionPreKeys ?? allBundles
			myBundle = getMySessionBundle(allBundles, fromSessionId)
		} catch {}
	}

	if (!myBundle) {
		return { success: false, errorMessage: 'Мой session prekey не найден' }
	}

	const ikPrivRaw = fromHex(mySecretPreKey.ikPriv)
	const ikPubRaw = fromHex(myBundle.ikPub)
	const IK = {
		privateKey: await importPrivateRaw(ikPrivRaw),
		publicKey: await importPublicRaw(ikPubRaw)
	} as const

	for (const recipientBundle of uniqueTargetBundles) {
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
			console.warn(
				`[SecretChat] SPK signature did not verify for session ${recipientBundle.secretSessionId}`
			)
			continue
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
					fromSessionId,
					toUserId: recipientBundle.userId,
					toSessionId: recipientBundle.secretSessionId,
					ikPub: myBundle.ikPub,
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
	}

	return { success: true }
}

/**
 * Получение и расшифровка общего ключа Кузнечика при заходе в чат.
 * Получатель: финализирует X3DH-сессию с инициатором, расшифровывает общий ключ группы.
 */
export const receiveGroupKeyAction = async (params: {
	chatId: string
	groupId: string
	userId: string
	secretSessionId: string
	preferredFromUserId?: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	getPreKeys?: SecretSessionPreKeysQueryFn
	getSharedSecretKey: SessionSharedSecretKeysQueryFn
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
		secretSessionId,
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
		const res = await getSharedSecretKey({
			variables: { chatId, secretSessionId }
		})
		const sharedKeys = res.data?.getSessionSharedSecretKeys
		if (!sharedKeys || sharedKeys.length === 0) {
			return { errorMessage: 'Общий ключ ещё не был передан' }
		}

		const packetsForUser = sharedKeys.filter(
			sharedKey => sharedKey.toSessionId === secretSessionId
		)
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
					secretSessionId,
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
					preKeysPub.find(
						bundle => bundle.secretSessionId === packet.fromSessionId
					)?.ikPub ||
					preKeysPub.find(bundle => bundle.userId === packet.fromUserId)
						?.ikPub
				if (!senderIkPub && getPreKeys) {
					try {
						const preKeysResponse = await getPreKeys({
							variables: { chatId }
						})
						const fresh =
							preKeysResponse.data?.getSecretSessionPreKeys || []
						senderIkPub =
							fresh.find(
								bundle =>
									bundle.secretSessionId === packet.fromSessionId
							)?.ikPub ||
							fresh.find(bundle => bundle.userId === packet.fromUserId)
								?.ikPub
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
	secretSessionId: string
	targetUserId: string
	sessionKey: Uint8Array<ArrayBufferLike>
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	getPreKeys: SecretSessionPreKeysQueryFn
	sendSharedSecretKey: SendSessionSharedSecretKeyMutationFn
}): Promise<{
	success: boolean
	errorMessage?: string
}> => {
	const {
		chatId,
		groupId,
		userId,
		secretSessionId,
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
		let targetBundles = getBundlesForUser(preKeysPub, targetUserId)
		if (targetBundles.length === 0) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				targetBundles = getBundlesForUser(
					preKeysResponse.data?.getSecretSessionPreKeys ?? [],
					targetUserId
				)
			} catch {}
		}
		if (targetBundles.length === 0) {
			return {
				success: false,
				errorMessage: `Session prekeys не найдены для ${targetUserId}`
			}
		}

		return shareSessionKeyWithBundlesAction({
			chatId,
			groupId,
			userId,
			fromSessionId: secretSessionId,
			sessionKey,
			mySecretPreKey,
			preKeysPub,
			targetBundles,
			getPreKeys,
			sendSharedSecretKey
		})
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
	secretSessionId: string
	mySecretPreKey: PreKeyBundleClient
	preKeysPub: SecretSessionPreKeyRecord[]
	getPreKeys: SecretSessionPreKeysQueryFn
	sendSharedSecretKey: SendSessionSharedSecretKeyMutationFn
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
		secretSessionId,
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
		let targetBundles = getTargetBundles(
			preKeysPub,
			otherMembers.map((member: any) => member.user.id),
			secretSessionId
		)
		if (targetBundles.length === 0) {
			try {
				const preKeysResponse = await getPreKeys({
					variables: { chatId }
				})
				targetBundles = getTargetBundles(
					preKeysResponse.data?.getSecretSessionPreKeys ?? [],
					otherMembers.map((member: any) => member.user.id),
					secretSessionId
				)
			} catch {}
		}
		if (targetBundles.length === 0) {
			return { errorMessage: 'Session prekeys участников не найдены' }
		}

		const shared = await shareSessionKeyWithBundlesAction({
			chatId,
			groupId,
			userId,
			fromSessionId: secretSessionId,
			sessionKey: groupKeyBytes,
			mySecretPreKey,
			preKeysPub,
			targetBundles,
			getPreKeys,
			sendSharedSecretKey
		})
		if (!shared.success) {
			return { errorMessage: shared.errorMessage }
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
