// Утилиты E2EE на ГОСТ, адаптированные под React Native (Expo)
// Веб-ориентированный код переработан: безопасные для рантайма импорты, UTF-8 помощники, экспортируемые хелперы
// Важно: это демо-код; не используйте digest как MAC в продакшене.
import { GetPreKeysQuery } from '@/graphql/generated/output'

// Даем глобальную ссылку на shim движка (некоторые библиотеки читают его из global)
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const engineShim = require('./gostEngineRN/index.js')
	;(globalThis as any).gostEngine = engineShim
} catch {}

// Необязательный динамический require, чтобы избежать ошибок на сборке, если зависимости ещё не установлены
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gostCrypto: any = null
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	gostCrypto = require('gost-crypto')
} catch {
	gostCrypto = null
}

// Необязательная загрузка полифилла для TextEncoder/TextDecoder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FTextEncoder: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FTextDecoder: any
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const te = require('fast-text-encoding')
	FTextEncoder = te.TextEncoder
	FTextDecoder = te.TextDecoder
} catch {
	// игнорируем, если не установлено
}

// Полифиллим глобалы при необходимости (в Hermes на RN 0.74 они скорее всего есть, но подстрахуемся)
// Обеспечиваем наличие браузероподобных глобалов
if (typeof (globalThis as any).window === 'undefined') {
	;(globalThis as any).window = globalThis as any
}
if (typeof (globalThis as any).global === 'undefined') {
	;(globalThis as any).global = globalThis as any
}
if (typeof (globalThis as any).TextEncoder === 'undefined' && FTextEncoder) {
	;(globalThis as any).TextEncoder = FTextEncoder
}
if (typeof (globalThis as any).TextDecoder === 'undefined' && FTextDecoder) {
	;(globalThis as any).TextDecoder = FTextDecoder
}

// Минимальные строительные блоки E2EE на алгоритмах ГОСТ
// - DH на ГОСТ Р 34.10 (S-256-A)
// - KDF на ГОСТ Р 34.11 (Стрибог)
// - Симметричное шифрование: ГОСТ Р 34.12 (Кузнечик) в CTR с имитацией MAC через digest (только для демо)

export type Raw = Uint8Array

type SubtleCryptoLike = {
	generateKey: (
		algo: Record<string, unknown>,
		extractable: boolean,
		usages: string[]
	) => Promise<CryptoKeyPair>
	importKey: (
		format: string,
		keyData: ArrayBuffer | ArrayBufferView,
		algo: Record<string, unknown>,
		extractable: boolean,
		keyUsages: string[]
	) => Promise<CryptoKey>
	exportKey: (format: string, key: CryptoKey) => Promise<ArrayBuffer>
	deriveBits: (
		algo: Record<string, unknown>,
		baseKey: CryptoKey,
		length: number
	) => Promise<ArrayBuffer>
	sign: (
		algo: Record<string, unknown>,
		key: CryptoKey,
		data: ArrayBuffer | ArrayBufferView
	) => Promise<ArrayBuffer>
	verify: (
		algo: Record<string, unknown>,
		key: CryptoKey,
		signature: ArrayBuffer | ArrayBufferView,
		data: ArrayBuffer | ArrayBufferView
	) => Promise<boolean>
	encrypt: (
		algo: Record<string, unknown>,
		key: CryptoKey,
		data: ArrayBuffer | ArrayBufferView
	) => Promise<ArrayBuffer>
	decrypt: (
		algo: Record<string, unknown>,
		key: CryptoKey,
		data: ArrayBuffer | ArrayBufferView
	) => Promise<ArrayBuffer>
	digest: (
		algo: Record<string, unknown>,
		data: ArrayBuffer | ArrayBufferView
	) => Promise<ArrayBuffer>
}

type GostModule = {
	subtle?: SubtleCryptoLike
	crypto?: { subtle?: SubtleCryptoLike }
	getRandomValues?: (array: Uint8Array) => void
}

function subtle(): SubtleCryptoLike {
	// 1) Глобальный gostCrypto
	const gAny: any = globalThis as any
	if (gAny.gostCrypto?.subtle)
		return gAny.gostCrypto.subtle as SubtleCryptoLike

	// 2) Пытаемся подключить модуль 'gost-crypto'
	let mod: GostModule | null = null
	try {
		mod =
			(gostCrypto as GostModule) || (require('gost-crypto') as GostModule)
	} catch {
		mod = null
	}
	// Дополнительные прямые пути-фолбэки для Metro/Hermes
	if (!mod || (!mod.subtle && !(mod.crypto && mod.crypto.subtle))) {
		try {
			mod = require('gost-crypto/lib/index.js') as GostModule
		} catch {}
	}
	if (!mod || (!mod.subtle && !(mod.crypto && mod.crypto.subtle))) {
		try {
			mod = require('gost-crypto/lib/gostCrypto.js') as GostModule
		} catch {}
	}
	let s: SubtleCryptoLike | undefined =
		mod?.subtle ??
		mod?.crypto?.subtle ??
		(mod as any)?.default?.subtle ??
		(mod as any)?.default?.crypto?.subtle
	if (s) {
		// кэшируем глобально
		;(globalThis as any).gostCrypto = { subtle: s }
		return s
	}

	// 3) Фолбэк: пакет 'crypto-gost' (альтернативная сборка)
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const cg: any = require('crypto-gost')
		// некоторые сборки экспортируют напрямую, некоторые через default, некоторые кладут в global
		s =
			cg?.subtle ||
			cg?.crypto?.subtle ||
			cg?.default?.subtle ||
			cg?.default?.crypto?.subtle
		if (!s && (globalThis as any).gostCrypto?.subtle) {
			s = (globalThis as any).gostCrypto.subtle
		}
		if (s) {
			;(globalThis as any).gostCrypto = { subtle: s }
			return s
		}
	} catch {
		// ignore
	}

	throw new Error(
		"gost-crypto subtle is not available. Установите одну из библиотек: 'gost-crypto' или 'crypto-gost' (npm install gost-crypto fast-text-encoding --save), перезапустите Expo с -c, и убедитесь, что 'gostEngine' подхватился."
	)
}

export function utf8(str: string): Uint8Array {
	const GE: any = (globalThis as any).TextEncoder || FTextEncoder
	if (GE) return new GE().encode(str)
	// Запасной энкодер
	// попробовать это убрать
	const utf8: number[] = []
	for (let i = 0; i < str.length; i++) {
		let charcode = str.charCodeAt(i)
		if (charcode < 0x80) utf8.push(charcode)
		else if (charcode < 0x800)
			utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
		else if (charcode < 0xd800 || charcode >= 0xe000)
			utf8.push(
				0xe0 | (charcode >> 12),
				0x80 | ((charcode >> 6) & 0x3f),
				0x80 | (charcode & 0x3f)
			)
		else {
			// суррогатная пара
			i++
			// UTF-16 кодирует 0x10000-0x10FFFF, вычитая 0x10000 и разбивая на пару
			charcode =
				0x10000 +
				(((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
			utf8.push(
				0xf0 | (charcode >> 18),
				0x80 | ((charcode >> 12) & 0x3f),
				0x80 | ((charcode >> 6) & 0x3f),
				0x80 | (charcode & 0x3f)
			)
		}
	}
	return new Uint8Array(utf8)
}

export function decodeUtf8(bytes: Uint8Array): string {
	const GD: any = (globalThis as any).TextDecoder || FTextDecoder
	if (GD) return new GD('utf-8').decode(bytes)
	let out = '',
		i = 0
	while (i < bytes.length) {
		const c = bytes[i++]
		if (c < 128) out += String.fromCharCode(c)
		else if (c > 191 && c < 224) {
			const c2 = bytes[i++]
			out += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
		} else if (c > 239 && c < 365) {
			// суррогатная пара
			const c2 = bytes[i++]
			const c3 = bytes[i++]
			const c4 = bytes[i++]
			let u =
				((c & 7) << 18) |
				((c2 & 63) << 12) |
				((c3 & 63) << 6) |
				(c4 & 63)
			u -= 0x10000
			out += String.fromCharCode(0xd800 + (u >> 10))
			out += String.fromCharCode(0xdc00 + (u & 1023))
		} else {
			const c2 = bytes[i++]
			const c3 = bytes[i++]
			out += String.fromCharCode(
				((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
			)
		}
	}
	return out
}

export function toHex(u8: Uint8Array): string {
	return Array.from(u8)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
}

export function fromHex(hex: string): Uint8Array {
	const s = hex.replace(/\s+/g, '').toLowerCase()
	if (s.length % 2 !== 0) throw new Error('fromHex: invalid length')
	const out = new Uint8Array(s.length / 2)
	for (let i = 0; i < out.length; i++) {
		out[i] = parseInt(s.substr(i * 2, 2), 16)
	}
	return out
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
	const len = parts.reduce((n, p) => n + p.byteLength, 0)
	const out = new Uint8Array(len)
	let off = 0
	for (const p of parts) {
		out.set(p, off)
		off += p.byteLength
	}
	return out
}

async function hmacStreebog(
	key: Uint8Array,
	data: Uint8Array,
	tagLen = 32
): Promise<Uint8Array> {
	// Manual HMAC with Streebog, block size 64 bytes
	const blockSize = 64
	const hashAlgo = { name: 'GOST R 34.11' } as const
	let k = key
	if (k.byteLength > blockSize) {
		const kd = new Uint8Array(await subtle().digest(hashAlgo, k))
		// Use full digest then pad/truncate to blockSize
		k = kd
	}
	if (k.byteLength < blockSize) {
		const tmp = new Uint8Array(blockSize)
		tmp.set(k)
		k = tmp
	}
	const ipad = new Uint8Array(blockSize).fill(0x36)
	const opad = new Uint8Array(blockSize).fill(0x5c)
	const kip = new Uint8Array(blockSize)
	const kop = new Uint8Array(blockSize)
	for (let i = 0; i < blockSize; i++) {
		kip[i] = k[i] ^ ipad[i]
		kop[i] = k[i] ^ opad[i]
	}
	const inner = new Uint8Array(
		await subtle().digest(hashAlgo, concatBytes(kip, data))
	)
	const outer = new Uint8Array(
		await subtle().digest(hashAlgo, concatBytes(kop, inner))
	)
	return outer.slice(0, tagLen)
}

function toExactArrayBuffer(u8: Uint8Array): ArrayBuffer {
	const ab = new ArrayBuffer(u8.byteLength)
	new Uint8Array(ab).set(u8)
	return ab
}

function fillRandom(iv: Uint8Array) {
	const mod = gostCrypto as unknown as GostModule
	if (typeof mod.getRandomValues === 'function') {
		mod.getRandomValues(iv)
	} else if ((globalThis as any).crypto?.getRandomValues) {
		;(globalThis as any).crypto.getRandomValues(iv)
	} else {
		for (let i = 0; i < iv.length; i++)
			iv[i] = Math.floor(Math.random() * 256)
	}
}

export async function generateLongTermKeyPair(): Promise<CryptoKeyPair> {
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	// Ключ идентичности используется для подписи и как участник DH в X3DH
	return await subtle().generateKey(algo, true, [
		'sign',
		'verify',
		'deriveBits'
	])
}
//
// Генерация эфемерной пары ключей. Эфемерный означает, что ключ используется только для одной сессии/сообщения.
export async function generateEphemeralKeyPair(): Promise<CryptoKeyPair> {
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	return await subtle().generateKey(algo, true, ['deriveBits', 'sign'])
}

export async function exportPublicRaw(pub: CryptoKey): Promise<Raw> {
	const raw = await subtle().exportKey('raw', pub)
	return new Uint8Array(raw)
}

export async function importPublicRaw(raw: any): Promise<CryptoKey> {
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	const u8 =
		raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer)
	return await subtle().importKey('raw', u8 as any, algo, true, [
		'deriveBits',
		'verify'
	])
}

export async function importPrivateRaw(raw: any): Promise<CryptoKey> {
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	const u8 =
		raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer)
	return await subtle().importKey('raw', u8 as any, algo, true, [
		'deriveBits',
		'sign'
	])
}

export async function signBytes(
	priv: CryptoKey,
	data: Uint8Array
): Promise<Uint8Array> {
	const sig = await subtle().sign(
		{ name: 'GOST R 34.10' },
		priv,
		new Uint8Array(data)
	)
	return new Uint8Array(sig)
}

export async function verifyBytes(
	pub: CryptoKey,
	data: Uint8Array,
	sig: Uint8Array
): Promise<boolean> {
	return await subtle().verify(
		{ name: 'GOST R 34.10' },
		pub,
		new Uint8Array(sig),
		new Uint8Array(data)
	)
}

export async function deriveSharedSecret(
	ourPriv: CryptoKey,
	theirPubRaw: ArrayBuffer,
	ukm: Uint8Array
): Promise<Uint8Array> {
	const theirPub = await importPublicRaw(theirPubRaw)
	const alg = {
		name: 'GOST R 34.10',
		public: theirPub,
		ukm,
		hash: { name: 'GOST R 34.11' }
	} as const
	const bits = await subtle().deriveBits(alg, ourPriv, 256)
	return new Uint8Array(bits)
}

// Полноценный KDF на ГОСТ Р 34.11-2012 (Стрибог) — контр. режим
// Блок: H( i_BE32 || Z || label || 0x00 || context || L_bits_BE32 )
export async function kdfStreebog(
	ikm: Uint8Array,
	info: Uint8Array | null,
	outLen = 32,
	opts?: { ukm?: Uint8Array; label?: Uint8Array }
): Promise<Uint8Array> {
	const hashAlgo = { name: 'GOST R 34.11' } as const
	const label = opts?.label ?? utf8('E2EE')
	const context = opts?.ukm
		? info
			? concatBytes(opts.ukm, info)
			: opts.ukm
		: (info ?? new Uint8Array())
	const Lbits = outLen * 8
	const Lbe = new Uint8Array(4)
	new DataView(Lbe.buffer).setUint32(0, Lbits, false)

	const chunks: Uint8Array[] = []
	let produced = 0
	for (let i = 1; produced < outLen; i++) {
		if (i > 0xffffffff) throw new Error('kdf counter overflow')
		const ibe = new Uint8Array(4)
		new DataView(ibe.buffer).setUint32(0, i, false)
		const sep = new Uint8Array([0x00])
		const data = concatBytes(ibe, ikm, label, sep, context, Lbe)
		const digestBuf = await subtle().digest(hashAlgo, data)
		const digest = new Uint8Array(digestBuf)
		chunks.push(digest)
		produced += digest.length
	}
	const out = chunks.length === 1 ? chunks[0] : concatBytes(...chunks)
	return out.slice(0, outLen)
}

export async function deriveSymKey(
	shared: Uint8Array,
	context = 'e2ee-v1',
	ukm?: Uint8Array,
	label?: string
): Promise<Uint8Array> {
	return await kdfStreebog(shared, utf8(context), 32, {
		ukm,
		label: label ? utf8(label) : undefined
	})
}

export async function encryptKuz(cipherKey: Uint8Array, plaintext: Uint8Array) {
	// 1) Пробуем Кузнечик (ГОСТ Р 34.12) CTR
	try {
		const iv = new Uint8Array(16)
		fillRandom(iv)
		const algEnc1 = {
			name: 'GOST R 34.12',
			block: 'CTR',
			length: 64,
			sBox: 'E-Z',
			iv
		} as const
		const key1 = await subtle().importKey(
			'raw',
			new Uint8Array(cipherKey),
			algEnc1,
			false,
			['encrypt']
		)
		const ctBuf1 = await subtle().encrypt(
			algEnc1,
			key1,
			new Uint8Array(plaintext)
		)
		return { iv, ciphertext: new Uint8Array(ctBuf1) }
	} catch {
		// 2) Фолбэк: Магма (ГОСТ 28147) CTR
		const iv = new Uint8Array(8)
		fillRandom(iv)
		const algEnc2 = {
			name: 'GOST 28147',
			block: 'CTR',
			sBox: 'E-A',
			iv
		} as const
		const key2 = await subtle().importKey(
			'raw',
			new Uint8Array(cipherKey),
			algEnc2,
			false,
			['encrypt']
		)
		const ctBuf2 = await subtle().encrypt(
			algEnc2,
			key2,
			new Uint8Array(plaintext)
		)
		return { iv, ciphertext: new Uint8Array(ctBuf2) }
	}
}

export async function decryptKuz(
	cipherKey: Uint8Array,
	iv: Uint8Array,
	ciphertext: Uint8Array
) {
	// Сначала пробуем Кузнечик CTR, затем Магму CTR
	try {
		const alg1 = {
			name: 'GOST R 34.12',
			block: 'CTR',
			length: 64,
			sBox: 'E-Z',
			iv
		} as const
		const key1 = await subtle().importKey(
			'raw',
			new Uint8Array(cipherKey),
			alg1,
			false,
			['decrypt']
		)
		const pt1 = await subtle().decrypt(
			alg1,
			key1,
			new Uint8Array(ciphertext)
		)
		return new Uint8Array(pt1)
	} catch {
		const alg2 = {
			name: 'GOST 28147',
			block: 'CTR',
			sBox: 'E-A',
			iv
		} as const
		const key2 = await subtle().importKey(
			'raw',
			new Uint8Array(cipherKey),
			alg2,
			false,
			['decrypt']
		)
		const pt2 = await subtle().decrypt(
			alg2,
			key2,
			new Uint8Array(ciphertext)
		)
		return new Uint8Array(pt2)
	}
}

// устаревший exampleAliceBob удалён; используйте exampleAliceBobX3DH

// ===== Демо X3DH (похоже на Signal) на примитивах ГОСТ =====
// Этот раздел показывает, как начать чат, когда получатель офлайн.
// Роли и границы хранения отмечены явно:
// - СЕРВЕР: хранит только публичный пакет Боба (IK_B_pub, SPK_B_pub, SIG_IK_B(SPK_B), пул OPK_B_pub)
// - УСТРОЙСТВО БОБА: хранит приватные ключи (IK_B_priv, SPK_B_priv, OPK_B_priv[]). Сервер не видит приватные ключи.
// - УСТРОЙСТВО АЛИСЫ: имеет IK_A, генерирует EK_A для первого сообщения, получает пакет Боба с СЕРВЕРА,
//   проверяет подпись, вычисляет DH1..DH4, выводит сессионный ключ, шифрует и отправляет первое сообщение
//   с EK_A_pub, идентификаторами и IV+шифртекстом. Боб может быть офлайн на этом шаге.

type KeyPairWithId = CryptoKeyPair
type OpkPubRecord = { id: string; key: string }

export type PreKeyBundleServer = {
	ikPub: string
	spkPub: string
	spkSig: string // SIG_IK_B(SPK_B_pub) в hex
	opkPubs: string[] // сервер выдаёт один и удаляет его из пула
}

export type PreKeyBundleClient = {
	ikPriv: string
	spkPriv: string
	opkPriv: string[] // сервер выдаёт один и удаляет его из пула
}

function concatMany(parts: Uint8Array[]): Uint8Array {
	return concatBytes(...parts)
}

export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
	// Псевдоним для долгоживущего ключа идентичности
	return await generateLongTermKeyPair()
}

export async function generateSignedPreKeyPair(
	identityPriv: CryptoKey
): Promise<{ kp: CryptoKeyPair; pubRaw: Raw; sig: Raw }> {
	const kp = await generateEphemeralKeyPair()
	const pubRaw = await exportPublicRaw(kp.publicKey)
	const sig = await signBytes(identityPriv, pubRaw)
	return { kp, pubRaw, sig }
}

export async function generateOneTimePreKeys(
	count: number
): Promise<CryptoKeyPair[]> {
	const res: CryptoKeyPair[] = []
	for (let i = 0; i < count; i++) {
		const kp = await generateEphemeralKeyPair()
		res.push(kp)
	}
	return res
}

// establishSessionX3DH: вывод ключа на стороне Алисы, используя серверный пакет Боба
export async function establishSessionX3DH(params: {
	IK: CryptoKeyPair
	aliceEK: CryptoKeyPair
	bobBundle: {
		ikPub: string
		spkPub: string
		spkSig: string
		opk?: string | null
	}
	ukm?: Uint8Array // соль сессии; если не передана — будет случайные 8 байт
}): Promise<{
	sessionKey: Uint8Array
	ukm: Uint8Array
	verifiedSpk: boolean
}> {
	const { IK, aliceEK, bobBundle } = params
	const ukm =
		params.ukm ??
		(() => {
			const u = new Uint8Array(8)
			fillRandom(u)
			return u
		})()

	// 1) Проверяем подпись Signed PreKey Боба с помощью IK_B_pub
	const ikPub = await importPublicRaw(fromHex(bobBundle.ikPub))
	const verifiedSpk = await verifyBytes(
		ikPub,
		fromHex(bobBundle.spkPub),
		fromHex(bobBundle.spkSig)
	)

	// 2) Вычисляем DH1..DH4 согласно X3DH (порядок важен для входа KDF)
	const DH1 = await deriveSharedSecret(
		IK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.spkPub)),
		ukm
	) // IK_A × SPK_B
	const DH2 = await deriveSharedSecret(
		aliceEK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.ikPub)),
		ukm
	) // EK_A × IK_B
	const DH3 = await deriveSharedSecret(
		aliceEK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.spkPub)),
		ukm
	) // EK_A × SPK_B
	let DH4: Uint8Array | undefined
	if (bobBundle.opk) {
		const opkBuf = toExactArrayBuffer(fromHex(bobBundle.opk))
		DH4 = await deriveSharedSecret(aliceEK.privateKey, opkBuf, ukm) // EK_A × OPK_B
	}
	const mix = concatMany([DH1, DH2, DH3, DH4 ?? new Uint8Array()])
	const sessionKey = await kdfStreebog(mix, utf8('X3DH-GOST'), 32, {
		ukm,
		label: utf8('X3DH')
	})
	return { sessionKey, ukm, verifiedSpk }
}

// Конверт первого сообщения (все поля — hex-строки)
export type InitEnvelope = {
	ikAPub: string
	ekAPub: string
	usedOpk?: string | null
	ukm: string
	iv: string
	ct: string
	sig: string
}

// Формирование конверта первого сообщения на стороне Алисы
export async function buildInitEnvelope(params: {
	IK: CryptoKeyPair
	bobBundle: {
		ikPub: string
		spkPub: string
		spkSig: string
		opk?: string | null
	}
	plaintext: string | Uint8Array
	ukm?: Uint8Array
}): Promise<{
	envelope: InitEnvelope
	sessionKey: Uint8Array
	encKey: Uint8Array
	ukm: Uint8Array
	verifiedSpk: boolean
}> {
	const { IK, bobBundle } = params

	// Одноразовый эфемерный ключ инициатора
	const aliceEK = await generateEphemeralKeyPair()

	// Устанавливаем X3DH-сессию (проверка подписи SPK внутри establishSessionX3DH)
	const { sessionKey, ukm, verifiedSpk } = await establishSessionX3DH({
		IK,
		aliceEK,
		bobBundle: {
			ikPub: bobBundle.ikPub,
			spkPub: bobBundle.spkPub,
			spkSig: bobBundle.spkSig,
			opk: bobBundle.opk ?? null
		},
		ukm: params.ukm
	})

	// Выводим ключи для шифрования первого сообщения
	const keyMat = await kdfStreebog(sessionKey, utf8('MSG-KEYS'), 64, {
		ukm,
		label: utf8('X3DH-MSG')
	})
	const encKey = keyMat.slice(0, 32)

	// Подготавливаем полезную нагрузку
	const plaintextU8 =
		typeof params.plaintext === 'string'
			? utf8(params.plaintext)
			: params.plaintext
	const enc = await encryptKuz(encKey, plaintextU8)

	// AAD и подпись отправителя (IK_A)
	const ikAPubRaw = await exportPublicRaw(IK.publicKey)
	const ekAPubRaw = await exportPublicRaw(aliceEK.publicKey)
	const aad = concatBytes(utf8('X3DHv1'), ikAPubRaw, ekAPubRaw)
	const signature = await signBytes(
		IK.privateKey,
		concatBytes(aad, enc.iv, enc.ciphertext)
	)

	const envelope: InitEnvelope = {
		ikAPub: toHex(ikAPubRaw),
		ekAPub: toHex(ekAPubRaw),
		usedOpk: bobBundle.opk ?? null,
		ukm: toHex(ukm),
		iv: toHex(enc.iv),
		ct: toHex(enc.ciphertext),
		sig: toHex(signature)
	}

	return { envelope, sessionKey, encKey, ukm, verifiedSpk }
}

// Восстановление сессии у получателя и расшифровка сообщения
export async function finalizeFromEnvelope(params: {
	bobIKPriv: CryptoKey
	bobSPKPriv: CryptoKey
	opkPriv?: CryptoKey
	envelope: InitEnvelope
}): Promise<{
	sessionKey: Uint8Array
	encKey: Uint8Array
	sigOk: boolean
	decrypted: string
}> {
	const { bobIKPriv, bobSPKPriv, opkPriv, envelope } = params

	// DH на стороне Боба (private × raw public), тот же UKM
	const ukmU8 = fromHex(envelope.ukm)
	const DH1b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ikAPub)),
		ukmU8
	) // SPK_B × IK_A
	const DH2b = await deriveSharedSecret(
		bobIKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	) // IK_B × EK_A
	const DH3b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	) // SPK_B × EK_A
	let DH4b: Uint8Array | undefined
	if (opkPriv) {
		const ekBuf = toExactArrayBuffer(fromHex(envelope.ekAPub))
		DH4b = await deriveSharedSecret(opkPriv, ekBuf, ukmU8) // OPK_B × EK_A
	}
	const mixB = concatMany([DH1b, DH2b, DH3b, DH4b ?? new Uint8Array()])
	const sessionKey = await kdfStreebog(mixB, utf8('X3DH-GOST'), 32, {
		ukm: ukmU8,
		label: utf8('X3DH')
	})

	// Выводим encKey
	const keyMatB = await kdfStreebog(sessionKey, utf8('MSG-KEYS'), 64, {
		ukm: ukmU8,
		label: utf8('X3DH-MSG')
	})
	const encKey = keyMatB.slice(0, 32)

	// Проверяем подпись отправителя (IK_A)
	const aadB = concatBytes(
		utf8('X3DHv1'),
		fromHex(envelope.ikAPub),
		fromHex(envelope.ekAPub)
	)
	const aliceIkPubKey = await importPublicRaw(fromHex(envelope.ikAPub))
	const sigOk = await verifyBytes(
		aliceIkPubKey,
		concatBytes(aadB, fromHex(envelope.iv), fromHex(envelope.ct)),
		fromHex(envelope.sig)
	)

	// Расшифровка
	const pt = await decryptKuz(
		encKey,
		fromHex(envelope.iv),
		fromHex(envelope.ct)
	)
	const decrypted = decodeUtf8(pt)

	return { sessionKey, encKey, sigOk, decrypted }
}

export async function generatePreKey() {
	const bobIK = await generateIdentityKeyPair()
	const bobSPK = await generateSignedPreKeyPair(bobIK.privateKey)
	const bobOPKs = await generateOneTimePreKeys(3)

	// Готовим пакет для СЕРВЕРА (только публичные данные)
	const ikPubHex = toHex(await exportPublicRaw(bobIK.publicKey))
	const spkPubHex = toHex(bobSPK.pubRaw)
	const spkSigHex = toHex(bobSPK.sig)
	const opkPubHexArr: string[] = []
	for (const opk of bobOPKs) {
		opkPubHexArr.push(toHex(await exportPublicRaw(opk.publicKey)))
	}
	const serverBundle: PreKeyBundleServer = {
		ikPub: ikPubHex,
		spkPub: spkPubHex,
		spkSig: spkSigHex,
		opkPubs: opkPubHexArr
	}

	const ikPrivateHex = toHex(await exportPublicRaw(bobIK.privateKey))
	const spkPrivateHex = toHex(await exportPublicRaw(bobSPK.kp.privateKey))
	const opkPrivHex: string[] = []
	for (const opk of bobOPKs) {
		opkPrivHex.push(toHex(await exportPublicRaw(opk.privateKey)))
	}

	const clientBundle: PreKeyBundleClient = {
		ikPriv: ikPrivateHex,
		spkPriv: spkPrivateHex,
		opkPriv: opkPrivHex
	}

	// Возвращаем разделённо: что отправляется на сервер и что сохраняется локально
	return {
		toServer: serverBundle,
		toStore: clientBundle
	}
}

// === Сообщения после установки сессии (без повторного X3DH) ===
// Простая схема: ключ шифрования выводится из sessionKey таким же способом,
// как в первом сообщении (MSG-KEYS/X3DH-MSG), затем используется Kuznechik/Magma CTR.
export type SessionMsgEnvelope = {
	iv: string
	ct: string
	sig: string
}

export async function buildSessionMsgEnvelope(params: {
	sessionKey: Uint8Array
	plaintext: string | Uint8Array
	signerIKPriv: CryptoKey
}): Promise<{
	envelope: SessionMsgEnvelope
	encKey: Uint8Array
}> {
	const { sessionKey } = params
	const plaintextU8 =
		typeof params.plaintext === 'string'
			? utf8(params.plaintext)
			: params.plaintext

	const keyMat = await kdfStreebog(sessionKey, utf8('MSG-KEYS'), 64, {
		label: utf8('X3DH-MSG')
	})
	const encKey = keyMat.slice(0, 32)
	const enc = await encryptKuz(encKey, plaintextU8)
	const aad = utf8('MSGv1')
	const signature = await signBytes(
		params.signerIKPriv,
		concatBytes(aad, enc.iv, enc.ciphertext)
	)

	const envelope: SessionMsgEnvelope = {
		iv: toHex(enc.iv),
		ct: toHex(enc.ciphertext),
		sig: toHex(signature)
	}

	return { envelope, encKey }
}

export async function decryptSessionMsgEnvelope(params: {
	sessionKey: Uint8Array
	envelope: SessionMsgEnvelope
	senderIkPub: string | CryptoKey
}): Promise<{
	decrypted: string
	sigOk: boolean
}> {
	const { sessionKey, envelope } = params
	const keyMat = await kdfStreebog(sessionKey, utf8('MSG-KEYS'), 64, {
		label: utf8('X3DH-MSG')
	})
	const encKey = keyMat.slice(0, 32)

	const aad = utf8('MSGv1')
	const pubKey =
		typeof params.senderIkPub === 'string'
			? await importPublicRaw(fromHex(params.senderIkPub))
			: params.senderIkPub
	const sigOk = await verifyBytes(
		pubKey,
		concatBytes(aad, fromHex(envelope.iv), fromHex(envelope.ct)),
		fromHex(envelope.sig)
	)

	const pt = await decryptKuz(
		encKey,
		fromHex(envelope.iv),
		fromHex(envelope.ct)
	)
	return { decrypted: decodeUtf8(pt), sigOk }
}

const makeHash = async (data: Uint8Array) => {
	const hashBuf = await subtle().digest({ name: 'GOST R 34.11' }, data)
	return toHex(new Uint8Array(hashBuf))
}

const getFingerprint = async (ikPub: string, spkPub: string) => {
	const combined = new Uint8Array(ikPub.length + spkPub.length)
	combined.set(fromHex(ikPub), 0)
	combined.set(fromHex(spkPub), fromHex(ikPub).length)

	const hash = await makeHash(combined)
	return hash
}
// функция проверки ключей которые хранятся локально и на сервере через хэш
export async function checkMyPreKeys(
	myPreKeyFromJSON: PreKeyBundleServer,
	myPreKeyFromServer: GetPreKeysQuery['getPreKeys'][0]
) {
	const hashFromJSON = await getFingerprint(
		myPreKeyFromJSON.ikPub,
		myPreKeyFromJSON.spkPub
	)
	const hashFromServer = await getFingerprint(
		myPreKeyFromServer.ikPub,
		myPreKeyFromServer.spkPub
	)

	return hashFromJSON === hashFromServer
}

export async function exampleAliceBobX3DH() {
	// ===== УСТРОЙСТВО БОБА: генерируем идентичность, подписанный prekey и одноразовые prekey =====
	const bobIK = await generateIdentityKeyPair()
	const bobSPK = await generateSignedPreKeyPair(bobIK.privateKey)
	const bobOPKs = await generateOneTimePreKeys(3)

	// Готовим пакет для СЕРВЕРА (только публичные данные)
	const serverBundle: PreKeyBundleServer = {
		ikPub: toHex(await exportPublicRaw(bobIK.publicKey)),
		spkPub: toHex(bobSPK.pubRaw),
		spkSig: toHex(bobSPK.sig),
		opkPubs: await (async () => {
			const arr: string[] = []
			for (const o of bobOPKs) {
				arr.push(toHex(await exportPublicRaw(o.publicKey)))
			}
			return arr
		})()
	}
	// СЕРВЕР: хранит serverBundle (публичные данные). Он будет выдавать и удалять по одному OPK на инициатора.

	// Симулируем выдачу СЕРВЕРОМ одного OPK для Алисы и пометку его как использованного
	const issuedOpk = serverBundle.opkPubs.shift() || null

	// ===== УСТРОЙСТВО АЛИСЫ (БОБ ОФФЛАЙН): получаем пакет и инициируем X3DH =====
	const aliceIK = await generateIdentityKeyPair()

	// Формируем минимальный набор данных пакета Боба для инициатора
	const bobBundleForAlice = {
		ikPub: serverBundle.ikPub,
		spkPub: serverBundle.spkPub,
		spkSig: serverBundle.spkSig,
		opk: issuedOpk ? issuedOpk : null
	}

	// Конверт первого сообщения Алисы -> Бобу, с установлением сессии
	const {
		envelope: initEnvelope,
		sessionKey: aliceSessionKey,
		verifiedSpk
	} = await buildInitEnvelope({
		IK: aliceIK,
		bobBundle: bobBundleForAlice,
		plaintext: 'Hello from X3DH while Bob is offline'
	})

	// ===== УСТРОЙСТВО БОБА (позже онлайн): восстанавливаем тот же сессионный ключ и расшифровываем =====
	// Находим приватный OPK по открытому ключу из конверта (если есть)
	let opkPriv: CryptoKey | undefined
	if (initEnvelope.usedOpk) {
		for (const o of bobOPKs) {
			const pubHex = toHex(await exportPublicRaw(o.publicKey))
			if (pubHex.toLowerCase() === initEnvelope.usedOpk.toLowerCase()) {
				opkPriv = o.privateKey
				break
			}
		}
	}

	const finalize = await finalizeFromEnvelope({
		bobIKPriv: bobIK.privateKey,
		bobSPKPriv: bobSPK.kp.privateKey,
		opkPriv,
		envelope: initEnvelope
	})

	const sharedMatches = toHex(aliceSessionKey) === toHex(finalize.sessionKey)

	return {
		verifiedSpk,
		sharedMatches,
		decrypted: finalize.decrypted,
		sigOk: finalize.sigOk,
		ivHex: initEnvelope.iv,
		ctHex: initEnvelope.ct,
		// Для ясности: что где находится
		meta: {
			server: {
				stored: {
					ikPub: serverBundle.ikPub,
					spkPub: serverBundle.spkPub,
					spkSig: serverBundle.spkSig,
					opkPoolSize: serverBundle.opkPubs.length
				}
			},
			envelope: {
				hasOpkId: initEnvelope.usedOpk !== null,
				ukmHex: initEnvelope.ukm
			}
		}
	}
}
