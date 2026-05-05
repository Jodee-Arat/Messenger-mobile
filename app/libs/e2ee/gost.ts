// Утилиты E2EE на ГОСТ, адаптированные под React Native (Expo)
// Веб-ориентированный код переработан: безопасные для рантайма импорты, UTF-8 помощники, экспортируемые хелперы
// Важно: это демо-код; не используйте digest как MAC в продакшене.
const safeSetGlobal = (key: string, value: unknown) => {
	try {
		;(globalThis as any)[key] = value
		return true
	} catch {
		try {
			Object.defineProperty(globalThis, key, {
				value,
				configurable: true,
				writable: true
			})
			return true
		} catch {
			return false
		}
	}
}

// Даем глобальную ссылку на shim движка.
// КРИТИЧНО: gostCrypto.js проверяет именно `global.gostEngine` (не globalThis).
// В Metro `global` передаётся как параметр модуля — это тот же объект, но явно ставим на оба,
// чтобы гарантировать доступность для gost-crypto.
try {
	// console.log('[E2EE:init] ⏳ Загружаю gostEngineRN shim...')
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const engineShim = require('./gostEngineRN/index.js')
	// console.log(
	// '[E2EE:init] gostEngineRN require() OK. typeof:',
	// typeof engineShim,
	// '| keys:',
	// engineShim ? Object.keys(engineShim) : 'null'
	// )
	// console.log('[E2EE:init] engineShim.execute:', typeof engineShim?.execute)
	if (engineShim && typeof engineShim.execute === 'function') {
		safeSetGlobal('gostEngine', engineShim)
		// console.log(
		// '[E2EE:init] ✅ globalThis.gostEngine = engineShim (execute is function)'
		// )
		// `global` в Metro npm-модулях — тот же глобальный объект, но подстрахуемся
		if (typeof global !== 'undefined') {
			try {
				;(global as any).gostEngine = engineShim
			} catch {
				// Ignore read-only/non-configurable global property in RN runtime
			}
			// console.log('[E2EE:init] ✅ global.gostEngine = engineShim')
		}
		// console.log(
		// '[E2EE:init] global === globalThis:',
		// (global as any) === (globalThis as any)
		// )
	} else {
		console.warn(
			'[E2EE:init] ⚠️ gostEngine shim загружен, но не содержит execute(). Объект:',
			JSON.stringify(engineShim ? Object.keys(engineShim) : null)
		)
	}
} catch (e) {
	console.error(
		'[E2EE:init] ❌ Не удалось загрузить gostEngine:',
		(e as any)?.message || e
	)
}

// Необязательный динамический require, чтобы избежать ошибок на сборке, если зависимости ещё не установлены
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gostCrypto: any = null
try {
	// console.log('[E2EE:init] ⏳ Загружаю gost-crypto...')
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	gostCrypto = require('gost-crypto')
	// console.log(
	// '[E2EE:init] gost-crypto require() OK. typeof:',
	// typeof gostCrypto
	// )
	// console.log(
	// '[E2EE:init] gostCrypto.subtle:',
	// typeof gostCrypto?.subtle,
	// '| gostCrypto.getRandomValues:',
	// typeof gostCrypto?.getRandomValues
	// )
	if (gostCrypto?.subtle) {
		const proto = Object.getPrototypeOf(gostCrypto.subtle)
		const protoMethods = proto
			? Object.getOwnPropertyNames(proto).filter(
					(n: string) => n !== 'constructor'
				)
			: []
		// console.log(
		// '[E2EE:init] subtle own keys:',
		// Object.keys(gostCrypto.subtle).length,
		// '| prototype methods:',
		// protoMethods.join(', ')
		// )
		// console.log(
		// '[E2EE:init] ℹ️  subtle выглядит как {} в console.log — это нормально! Все методы на прототипе, а не на экземпляре.'
		// )
	}
} catch (e) {
	console.error(
		'[E2EE:init] ❌ Не удалось загрузить gost-crypto:',
		(e as any)?.message || e
	)
	gostCrypto = null
}

// Необязательная загрузка полифилла для TextEncoder/TextDecoder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FTextEncoder: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FTextDecoder: any
try {
	FTextEncoder = (globalThis as any).TextEncoder
	FTextDecoder = (globalThis as any).TextDecoder

	if (!FTextEncoder || !FTextDecoder) {
		// console.log('[E2EE:init] ⏳ Загружаю fast-text-encoding...')
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const te = require('fast-text-encoding')
		// fast-text-encoding — side-effect polyfill: он прописывает TextEncoder/TextDecoder
		// прямо в globalThis, а НЕ экспортирует их как свойства модуля.
		// Поэтому te.TextEncoder может быть undefined — это нормально.
		FTextEncoder = te.TextEncoder ?? (globalThis as any).TextEncoder
		FTextDecoder = te.TextDecoder ?? (globalThis as any).TextDecoder
	}
	// console.log(
	// '[E2EE:init] fast-text-encoding загружен (side-effect polyfill).',
	// 'Экспорт:',
	// typeof te.TextEncoder,
	// '| globalThis.TextEncoder:',
	// typeof (globalThis as any).TextEncoder,
	// '| globalThis.TextDecoder:',
	// typeof (globalThis as any).TextDecoder
	// )
	if (typeof FTextEncoder === 'function') {
		// console.log('[E2EE:init] ✅ TextEncoder доступен')
	} else {
		console.warn(
			'[E2EE:init] ⚠️ TextEncoder НЕ доступен после загрузки fast-text-encoding!'
		)
	}
} catch {
	// console.log(
	// '[E2EE:init] ℹ️  fast-text-encoding не установлен (может быть не нужен, если Hermes >= 0.74)'
	// )
}

// Полифиллим глобалы при необходимости (в Hermes на RN 0.74 они вроде есть)
// Обеспечиваем наличие браузероподобных глобалов
if (typeof (globalThis as any).window === 'undefined') {
	safeSetGlobal('window', globalThis as any)
}
if (typeof (globalThis as any).global === 'undefined') {
	safeSetGlobal('global', globalThis as any)
}
if (typeof (globalThis as any).TextEncoder === 'undefined' && FTextEncoder) {
	safeSetGlobal('TextEncoder', FTextEncoder)
}
if (typeof (globalThis as any).TextDecoder === 'undefined' && FTextDecoder) {
	safeSetGlobal('TextDecoder', FTextDecoder)
}

// === Итоговый отчёт инициализации ===
// console.log('\n========== [E2EE:init] ИТОГО ==========')
// console.log(
// '[E2EE:init] gostEngine loaded:',
// !!(global as any).gostEngine,
// '| execute:',
// typeof (global as any)?.gostEngine?.execute
// )
// console.log(
// '[E2EE:init] gostCrypto loaded:',
// !!gostCrypto,
// '| subtle:',
// typeof gostCrypto?.subtle
// )
// console.log(
// '[E2EE:init] TextEncoder:',
// typeof (globalThis as any).TextEncoder,
// '| TextDecoder:',
// typeof (globalThis as any).TextDecoder
// )
// console.log(
// '[E2EE:init] global.crypto:',
// typeof (globalThis as any).crypto,
// '| getRandomValues:',
// typeof (globalThis as any).crypto?.getRandomValues
// )
// console.log('========================================\n')

// Минимальные строительные блоки E2EE на алгоритмах ГОСТ
// - DH на ГОСТ Р 34.10 (S-256-A)
// - KDF на ГОСТ Р 34.11 (Стрибог)
// - Симметричное шифрование: ГОСТ Р 34.12 (Кузнечик) в CTR с имитацией MAC через digest

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

// Кешируем SubtleCrypto после первого успешного получения
let _cachedSubtle: SubtleCryptoLike | null = null

function subtle(): SubtleCryptoLike {
	if (_cachedSubtle) {
		// console.log('[E2EE:subtle] ⭐ Использую кешированный SubtleCrypto')
		return _cachedSubtle
	}

	// console.log('[E2EE:subtle] Первый вызов — ищу SubtleCrypto...')

	// 1) Основной путь: gostCrypto (require('gost-crypto')) уже загружен в начале файла
	let s: SubtleCryptoLike | undefined =
		(gostCrypto as GostModule)?.subtle ??
		(gostCrypto as GostModule)?.crypto?.subtle

	if (s) {
		// console.log(
		// '[E2EE:subtle] ✅ SubtleCrypto найден через основной путь (gostCrypto.subtle)'
		// )
	} else {
		// console.log(
		// '[E2EE:subtle] Основной путь не дал subtle, пробую fallback...'
		// )
	}
	if (!s) {
		// console.log('[E2EE:subtle] Пробую fallback: require(gost-crypto)...')
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const mod = require('gost-crypto') as GostModule
			s =
				mod?.subtle ??
				mod?.crypto?.subtle ??
				(mod as any)?.default?.subtle
			// if (s)
			// console.log(
			// '[E2EE:subtle] ✅ SubtleCrypto найден через fallback require(gost-crypto)'
			// )
		} catch (e) {
			console.warn(
				'[E2EE:subtle] fallback require(gost-crypto) упал:',
				(e as any)?.message
			)
		}
	}
	if (!s) {
		// console.log(
		// '[E2EE:subtle] Пробую fallback: require(gost-crypto/lib/gostCrypto.js)...'
		// )
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const mod = require('gost-crypto/lib/gostCrypto.js') as GostModule
			s =
				mod?.subtle ??
				mod?.crypto?.subtle ??
				(mod as any)?.default?.subtle
			if (s) {
			}
			// console.log(
			// '[E2EE:subtle] ✅ SubtleCrypto найден через fallback require(gostCrypto.js)'
			// )
		} catch (e) {
			console.warn(
				'[E2EE:subtle] fallback require(gostCrypto.js) упал:',
				(e as any)?.message
			)
		}
	}

	if (s) {
		// Проверяем, что методы SubtleCrypto реально доступны (они на прототипе, а не на экземпляре)
		const methods = [
			'encrypt',
			'decrypt',
			'sign',
			'verify',
			'digest',
			'generateKey',
			'importKey',
			'exportKey',
			'deriveBits'
		]
		const available = methods.filter(
			m => typeof (s as any)[m] === 'function'
		)
		const missing = methods.filter(m => typeof (s as any)[m] !== 'function')

		if (missing.length > 0) {
			console.warn(
				'[E2EE:subtle] ⚠️ SubtleCrypto получен, но отсутствуют методы:',
				missing.join(', ')
			)
			console.warn(
				'[E2EE:subtle] Доступные методы:',
				available.join(', ')
			)
			console.warn(
				'[E2EE:subtle] global.gostEngine.execute:',
				typeof (global as any)?.gostEngine?.execute
			)
		} else {
			// console.log(
			// `[E2EE:subtle] ✅ SubtleCrypto ГОСТ готов к работе! ${available.length}/${methods.length} методов:`,
			// available.join(', ')
			// )
		}

		_cachedSubtle = s
		return s
	}

	// Диагностика: почему не нашли subtle
	const diag: string[] = []
	diag.push(`gostCrypto loaded: ${!!gostCrypto}`)
	diag.push(
		`global.gostEngine: ${typeof (global as any)?.gostEngine?.execute}`
	)
	diag.push(
		`globalThis.gostEngine: ${typeof (globalThis as any)?.gostEngine?.execute}`
	)

	throw new Error(
		`gost-crypto subtle is not available.\n` +
			`Диагностика: ${diag.join(', ')}\n` +
			`Установите: npm install gost-crypto fast-text-encoding --save\n` +
			`Перезапустите Expo с -c и убедитесь, что gostEngine подхватился.`
	)
}

export function utf8(str: string) {
	const GE: any = (globalThis as any).TextEncoder || FTextEncoder
	if (GE) {
		return new GE().encode(str)
	}
}

export function decodeUtf8(bytes: Uint8Array) {
	const GD: any = (globalThis as any).TextDecoder || FTextDecoder
	if (GD) return new GD('utf-8').decode(bytes)
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

// async function hmacStreebog(
// 	key: Uint8Array,
// 	data: Uint8Array,
// 	tagLen = 32
// ): Promise<Uint8Array> {
// 	// Manual HMAC with Streebog, block size 64 bytes
// 	const blockSize = 64
// 	const hashAlgo = { name: 'GOST R 34.11' } as const
// 	let k = key
// 	if (k.byteLength > blockSize) {
// 		const kd = new Uint8Array(await subtle().digest(hashAlgo, k))
// 		// Use full digest then pad/truncate to blockSize
// 		k = kd
// 	}
// 	if (k.byteLength < blockSize) {
// 		const tmp = new Uint8Array(blockSize)
// 		tmp.set(k)
// 		k = tmp
// 	}
// 	const ipad = new Uint8Array(blockSize).fill(0x36)
// 	const opad = new Uint8Array(blockSize).fill(0x5c)
// 	const kip = new Uint8Array(blockSize)
// 	const kop = new Uint8Array(blockSize)
// 	for (let i = 0; i < blockSize; i++) {
// 		kip[i] = k[i] ^ ipad[i]
// 		kop[i] = k[i] ^ opad[i]
// 	}
// 	const inner = new Uint8Array(
// 		await subtle().digest(hashAlgo, concatBytes(kip, data))
// 	)
// 	const outer = new Uint8Array(
// 		await subtle().digest(hashAlgo, concatBytes(kop, inner))
// 	)
// 	return outer.slice(0, tagLen)
// }

function toExactArrayBuffer(u8: Uint8Array): ArrayBuffer {
	const ab = new ArrayBuffer(u8.byteLength)
	new Uint8Array(ab).set(u8)
	return ab
}

// HMAC-Streebog (ГОСТ Р 34.11-2012) через SubtleCrypto.sign()
async function hmacStreebog(
	key: Uint8Array,
	data: Uint8Array
): Promise<Uint8Array> {
	const hmacAlgo = {
		name: 'GOST R 34.11',
		version: 2012,
		length: 256,
		mode: 'HMAC'
	}
	const cryptoKey = await subtle().importKey(
		'raw',
		toExactArrayBuffer(key),
		hmacAlgo,
		false,
		['sign']
	)
	const sig = await subtle().sign(
		hmacAlgo,
		cryptoKey,
		toExactArrayBuffer(data)
	)
	return new Uint8Array(sig)
}

function fillRandom(iv: Uint8Array) {
	const mod = gostCrypto as unknown as GostModule
	if (typeof mod.getRandomValues === 'function') {
		mod.getRandomValues(iv)
		// console.log(
		// `[E2EE:rng] fillRandom(${iv.length} байт) — источник: gostCrypto.getRandomValues`
		// )
	} else if ((globalThis as any).crypto?.getRandomValues) {
		;(globalThis as any).crypto.getRandomValues(iv)
		// console.log(
		// `[E2EE:rng] fillRandom(${iv.length} байт) — источник: globalThis.crypto.getRandomValues`
		// )
	} else {
		console.warn(
			`[E2EE:rng] ⚠️ fillRandom(${iv.length} байт) — источник: Math.random() (НЕБЕЗОПАСНО!)`
		)
		for (let i = 0; i < iv.length; i++)
			iv[i] = Math.floor(Math.random() * 256)
	}
}

export async function generateLongTermKeyPair(): Promise<CryptoKeyPair> {
	// console.log(
	// '[E2EE:keygen] Генерирую долгосрочную пару ключей (GOST R 34.10 / S-256-A)...'
	// )
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	// Ключ идентичности используется для подписи и как участник DH в X3DH
	const kp = await subtle().generateKey(algo, true, [
		'sign',
		'verify',
		'deriveBits'
	])
	// console.log(
	// '[E2EE:keygen] ✅ Долгосрочная пара создана. publicKey:',
	// !!kp.publicKey,
	// '| privateKey:',
	// !!kp.privateKey
	// )
	return kp
}
//
// Генерация эфемерной пары ключей. Эфемерный означает, что ключ используется только для одной сессии/сообщения.
export async function generateEphemeralKeyPair(): Promise<CryptoKeyPair> {
	// console.log(
	// '[E2EE:keygen] Генерирую эфемерную пару ключей (GOST R 34.10 / S-256-A)...'
	// )
	const algo = {
		name: 'GOST R 34.10',
		version: 2012,
		namedCurve: 'S-256-A'
	} as const
	const kp = await subtle().generateKey(algo, true, ['deriveBits', 'sign'])
	// console.log('[E2EE:keygen] ✅ Эфемерная пара создана')
	return kp
}

export async function exportPublicRaw(pub: CryptoKey): Promise<Raw> {
	const raw = await subtle().exportKey('raw', pub)
	const u8 = new Uint8Array(raw)
	// console.log(
	// `[E2EE:key] exportPublicRaw: ${u8.byteLength} байт | hex[0..8]: ${toHex(u8).slice(0, 16)}...`
	// )
	return u8
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
	// console.log(
	// `[E2EE:sign] Подпись ГОСТ Р 34.10: данные ${data.byteLength} байт`
	// )
	const sig = await subtle().sign(
		{ name: 'GOST R 34.10' },
		priv,
		new Uint8Array(data)
	)
	const sigU8 = new Uint8Array(sig)
	// console.log(`[E2EE:sign] ✅ Подпись создана: ${sigU8.byteLength} байт`)
	return sigU8
}

export async function verifyBytes(
	pub: CryptoKey,
	data: Uint8Array,
	sig: Uint8Array
): Promise<boolean> {
	// console.log(
	// `[E2EE:verify] Проверка подписи ГОСТ Р 34.10: данные ${data.byteLength} байт, sig ${sig.byteLength} байт`
	// )
	const ok = await subtle().verify(
		{ name: 'GOST R 34.10' },
		pub,
		new Uint8Array(sig),
		new Uint8Array(data)
	)
	// console.log(
	// `[E2EE:verify] ${ok ? '✅ Подпись верна' : '❌ Подпись НЕ верна!'}`
	// )
	return ok
}

export async function deriveSharedSecret(
	ourPriv: CryptoKey,
	theirPubRaw: ArrayBuffer,
	ukm: Uint8Array
): Promise<Uint8Array> {
	// console.log(
	// `[E2EE:dh] DH (GOST R 34.10): theirPub ${theirPubRaw.byteLength} байт, ukm ${ukm.byteLength} байт`
	// )
	const theirPub = await importPublicRaw(theirPubRaw)
	const alg = {
		name: 'GOST R 34.10',
		public: theirPub,
		ukm,
		hash: { name: 'GOST R 34.11' }
	} as const
	const bits = await subtle().deriveBits(alg, ourPriv, 256)
	const result = new Uint8Array(bits)
	// console.log(
	// `[E2EE:dh] ✅ Shared secret: ${result.byteLength} байт | hex[0..8]: ${toHex(result).slice(0, 16)}...`
	// )
	return result
}

// KDF на ГОСТ Р 34.11-2012 (Стрибог) — Р 50.1.113-2016
// Использует встроенный deriveBits библиотеки gost-crypto в режиме KDF (HMAC-Стрибог)
// Формула: HMAC(key, counter | label | 0x00 | context | L_BE16)
export async function kdfStreebog(
	ikm: Uint8Array,
	info: Uint8Array | null,
	outLen = 32,
	opts?: { ukm?: Uint8Array; label?: Uint8Array }
): Promise<Uint8Array> {
	// console.log(
	// `[E2EE:kdf] KDF Стрибог (HMAC, Р 50.1.113): ikm ${ikm.byteLength} байт, outLen ${outLen}, info ${info?.byteLength ?? 'null'} байт`
	// )
	const label = opts?.label ?? utf8('E2EE') ?? new Uint8Array()
	const context = opts?.ukm
		? info
			? concatBytes(opts.ukm, info)
			: opts.ukm
		: (info ?? new Uint8Array())

	const ctxBuf = toExactArrayBuffer(context)
	const kdfAlgo = {
		name: 'GOST R 34.11',
		version: 2012,
		length: 256,
		mode: 'KDF',
		context: ctxBuf,
		contex: ctxBuf,
		label: toExactArrayBuffer(label)
	}

	const key = await subtle().importKey(
		'raw',
		toExactArrayBuffer(ikm),
		kdfAlgo,
		false,
		['deriveBits']
	)
	const bits = await subtle().deriveBits(kdfAlgo, key, outLen * 8)
	const result = new Uint8Array(bits)
	// console.log(`[E2EE:kdf] ✅ KDF результат: ${result.byteLength} байт`)
	return result
}

// Генерация случайного 256-битного симметричного ключа для Кузнечика (ГОСТ Р 34.12).
// Ключ проверяется через тестовый импорт в SubtleCrypto, чтобы гарантировать совместимость.
export async function generateKuznechikKey(): Promise<{
	keyBytes: Uint8Array
	keyHex: string
}> {
	// console.log('[E2EE:kuz] Генерирую ключ Кузнечик (256 бит, ГОСТ Р 34.12)...')
	const keyBytes = new Uint8Array(32)
	fillRandom(keyBytes)

	// Проверяем, что ключ валиден для Кузнечика (тестовый импорт)
	// length: 128 = Кузнечик (128-бит блок); length: 64 = Магма
	const testAlgo = {
		name: 'GOST R 34.12',
		block: 'CTR',
		length: 128,
		iv: new Uint8Array(8)
	} as const
	// console.log(
	// '[E2EE:kuz] Тестовый импорт ключа:',
	// JSON.stringify({
	// name: testAlgo.name,
	// block: testAlgo.block,
	// length: testAlgo.length,
	// ivLen: testAlgo.iv.byteLength
	// })
	// )
	await subtle().importKey('raw', new Uint8Array(keyBytes), testAlgo, false, [
		'encrypt'
	])
	// console.log(
	// `[E2EE:kuz] ✅ Ключ Кузнечик создан: ${keyBytes.byteLength * 8} бит | hex[0..8]: ${toHex(keyBytes).slice(0, 16)}...`
	// )

	return { keyBytes, keyHex: toHex(keyBytes) }
}

export async function encryptKuz(cipherKey: Uint8Array, plaintext: Uint8Array) {
	// console.log(
	// `[E2EE:encrypt] encryptKuz: plaintext ${plaintext.byteLength} байт, key ${cipherKey.byteLength} байт`
	// )

	// Derive Encryption Key (32 bytes) and MAC Key (32 bytes) from the cipherKey
	const keyMat = await kdfStreebog(
		new Uint8Array(cipherKey),
		utf8('ENC-MAC-KEYS'),
		64,
		{
			label: utf8('KUZ-AUTH')
		}
	)
	const encKey = new Uint8Array(keyMat.slice(0, 32))
	const macKey = new Uint8Array(keyMat.slice(32, 64))

	// Кузнечик (ГОСТ Р 34.12, 128-бит блок) CTR
	// IV для CTR15: blockSize >> 1 = 8 байт (при length=128)
	const iv = new Uint8Array(8)
	fillRandom(iv)

	const algEnc = {
		name: 'GOST R 34.12',
		block: 'CTR',
		length: 128,
		iv
	} as const

	// console.log(
	// '[E2EE:encrypt] Кузнечик CTR + HMAC Streebog:',
	// JSON.stringify({
	// name: algEnc.name,
	// block: algEnc.block,
	// length: algEnc.length,
	// ivLen: iv.byteLength
	// })
	// )

	const key = await subtle().importKey(
		'raw',
		new Uint8Array(encKey),
		algEnc,
		false,
		['encrypt']
	)

	// 1. Encrypt
	const ctBuf = await subtle().encrypt(algEnc, key, new Uint8Array(plaintext))
	const ct = new Uint8Array(ctBuf)

	// 2. MAC (HMAC-Streebog over IV + Ciphertext)
	const macData = concatBytes(iv, ct)
	const mac = await hmacStreebog(macKey, macData)

	// 3. Return IV || MAC || Ciphertext
	// For backward compatibility in our type signatures, we return the MAC prepended to the ciphertext,
	// or we can just append it. Let's append MAC to ciphertext: [CT] [MAC (32 bytes)]
	const outCt = concatBytes(ct, mac)

	// console.log(
	// `[E2EE:encrypt] ✅ Зашифровано аутентифицированно! ciphertext (с MAC) ${outCt.byteLength} байт, iv ${iv.byteLength} байт`
	// )
	return { iv, ciphertext: outCt }
}

export async function decryptKuz(
	cipherKey: Uint8Array,
	iv: Uint8Array,
	ciphertextWithMac: Uint8Array
) {
	// console.log(
	// `[E2EE:decrypt] decryptKuz: ciphertextWithMac ${ciphertextWithMac.byteLength} байт, iv ${iv.byteLength} байт, key ${cipherKey.byteLength} байт`
	// )

	if (ciphertextWithMac.byteLength < 32) {
		throw new Error('[E2EE:decrypt] Ciphertext too short, missing MAC')
	}

	// Derive Encryption Key (32 bytes) and MAC Key (32 bytes) from the cipherKey
	const keyMat = await kdfStreebog(
		new Uint8Array(cipherKey),
		utf8('ENC-MAC-KEYS'),
		64,
		{
			label: utf8('KUZ-AUTH')
		}
	)
	const encKey = new Uint8Array(keyMat.slice(0, 32))
	const macKey = new Uint8Array(keyMat.slice(32, 64))

	// Split Ciphertext and MAC (MAC is the last 32 bytes)
	const ctLen = ciphertextWithMac.byteLength - 32
	const ct = ciphertextWithMac.slice(0, ctLen)
	const receivedMac = ciphertextWithMac.slice(ctLen)

	// 1. Verify MAC (HMAC-Streebog)
	const macData = concatBytes(iv, ct)
	const expectedMac = await hmacStreebog(macKey, macData)

	// Constant time comparison
	let macValid = true
	for (let i = 0; i < 32; i++) {
		if (receivedMac[i] !== expectedMac[i]) {
			macValid = false
		}
	}

	if (!macValid) {
		throw new Error('MAC verification failed')
	}

	// console.log('[E2EE:decrypt] ✅ MAC проверка успешна.')

	// 2. Decrypt
	const alg = {
		name: 'GOST R 34.12',
		block: 'CTR',
		length: 128,
		iv
	} as const

	const key = await subtle().importKey(
		'raw',
		new Uint8Array(encKey),
		alg,
		false,
		['decrypt']
	)
	const pt = await subtle().decrypt(alg, key, new Uint8Array(ct))
	const result = new Uint8Array(pt)
	// console.log(
	// `[E2EE:decrypt] ✅ Расшифровано Кузнечиком! plaintext ${result.byteLength} байт`
	// )
	return result
}

export type PreKeyBundleServer = {
	ikPub: string
	spkPub: string
	spkSig: string
	opkPubs: string[]
}

export type PreKeyBundleClient = {
	ikPriv: string
	spkPriv: string
	opkPriv: string[]
}

function concatMany(parts: Uint8Array[]): Uint8Array {
	return concatBytes(...parts)
}

export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
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
	// console.log(
	// '\n========== [E2EE:X3DH] Установка сессии (сторона Алисы) =========='
	// )
	// console.log(
	// '[E2EE:X3DH] Пакет Боба: ikPub',
	// params.bobBundle.ikPub.slice(0, 16) + '...',
	// '| spkPub',
	// params.bobBundle.spkPub.slice(0, 16) + '...',
	// '| opk:',
	// params.bobBundle.opk
	// ? params.bobBundle.opk.slice(0, 16) + '...'
	// : 'null'
	// )
	const { IK, aliceEK, bobBundle } = params
	const ukm =
		params.ukm ??
		(() => {
			const u = new Uint8Array(8)
			fillRandom(u)
			return u
		})()
	// console.log('[E2EE:X3DH] UKM:', toHex(ukm))

	// 1) Проверяем подпись Signed PreKey Боба с помощью IK_B_pub
	// console.log('[E2EE:X3DH] Шаг 1: Проверяю подпись SPK Боба...')
	const ikPub = await importPublicRaw(fromHex(bobBundle.ikPub))
	const verifiedSpk = await verifyBytes(
		ikPub,
		fromHex(bobBundle.spkPub),
		fromHex(bobBundle.spkSig)
	)
	// console.log(
	// `[E2EE:X3DH] Подпись SPK: ${verifiedSpk ? '✅ ВЕРНА' : '❌ НЕВЕРНА!'}`
	// )

	// 2) Вычисляем DH1..DH4 согласно X3DH (порядок важен для входа KDF)
	// console.log('[E2EE:X3DH] Шаг 2: Вычисляю DH1..DH4...')
	// console.log('[E2EE:X3DH]   DH1 = IK_A × SPK_B')
	const DH1 = await deriveSharedSecret(
		IK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.spkPub)),
		ukm
	) // IK_A × SPK_B
	// console.log('[E2EE:X3DH]   DH2 = EK_A × IK_B')
	const DH2 = await deriveSharedSecret(
		aliceEK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.ikPub)),
		ukm
	) // EK_A × IK_B
	// console.log('[E2EE:X3DH]   DH3 = EK_A × SPK_B')
	const DH3 = await deriveSharedSecret(
		aliceEK.privateKey,
		toExactArrayBuffer(fromHex(bobBundle.spkPub)),
		ukm
	) // EK_A × SPK_B
	let DH4: Uint8Array | undefined
	if (bobBundle.opk) {
		// console.log('[E2EE:X3DH]   DH4 = EK_A × OPK_B')
		const opkBuf = toExactArrayBuffer(fromHex(bobBundle.opk))
		DH4 = await deriveSharedSecret(aliceEK.privateKey, opkBuf, ukm) // EK_A × OPK_B
	} else {
		// console.log('[E2EE:X3DH]   DH4 = пропущен (нет OPK)')
	}
	// console.log('[E2EE:X3DH] Шаг 3: KDF Стрибог из DH1||DH2||DH3||DH4...')
	const mix = concatMany([DH1, DH2, DH3, DH4 ?? new Uint8Array()])
	// console.log(
	// `[E2EE:X3DH] mix: ${mix.byteLength} байт (DH1: ${DH1.byteLength}, DH2: ${DH2.byteLength}, DH3: ${DH3.byteLength}, DH4: ${DH4?.byteLength ?? 0})`
	// )
	const sessionKey = await kdfStreebog(mix, utf8('X3DH-GOST'), 32, {
		ukm,
		label: utf8('X3DH')
	})
	// console.log(
	// `[E2EE:X3DH] ✅ Сессионный ключ: ${sessionKey.byteLength} байт | hex[0..8]: ${toHex(sessionKey).slice(0, 16)}...`
	// )
	// console.log('=================================================\n')
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
	// console.log('\n========== [E2EE:envelope] buildInitEnvelope ==========')
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

	// console.log(
	// '[E2EE:envelope] ✅ Конверт сформирован:',
	// JSON.stringify({
	// ikAPub: envelope.ikAPub.slice(0, 16) + '...',
	// ekAPub: envelope.ekAPub.slice(0, 16) + '...',
	// usedOpk: envelope.usedOpk ? 'yes' : 'no',
	// ukm: envelope.ukm.slice(0, 16),
	// ivLen: envelope.iv.length / 2,
	// ctLen: envelope.ct.length / 2,
	// sigLen: envelope.sig.length / 2
	// })
	// )
	// console.log('====================================================\n')

	return { envelope, sessionKey, encKey, ukm, verifiedSpk }
}

// Финализация X3DH на стороне Боба — только установка сессии (DH → sessionKey).
// Используется для группового ключа, где шифрование/подпись отличаются от DM.
export async function finalizeSessionX3DH(params: {
	bobIKPriv: CryptoKey
	bobSPKPriv: CryptoKey
	opkPriv?: CryptoKey
	envelope: {
		ikAPub: string
		ekAPub: string
		usedOpk?: string | null
		ukm: string
	}
}): Promise<{ sessionKey: Uint8Array }> {
	// console.log(
	// '\n========== [E2EE:finalize] finalizeSessionX3DH (только сессия) =========='
	// )
	const { bobIKPriv, bobSPKPriv, opkPriv, envelope } = params
	const ukmU8 = fromHex(envelope.ukm)

	const DH1b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ikAPub)),
		ukmU8
	)
	const DH2b = await deriveSharedSecret(
		bobIKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	)
	const DH3b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	)
	let DH4b: Uint8Array | undefined
	if (opkPriv) {
		DH4b = await deriveSharedSecret(
			opkPriv,
			toExactArrayBuffer(fromHex(envelope.ekAPub)),
			ukmU8
		)
	}
	const mixB = concatMany([DH1b, DH2b, DH3b, DH4b ?? new Uint8Array()])
	const sessionKey = await kdfStreebog(mixB, utf8('X3DH-GOST'), 32, {
		ukm: ukmU8,
		label: utf8('X3DH')
	})
	// console.log(
	// `[E2EE:finalize] ✅ sessionKey: ${sessionKey.byteLength} байт | hex[0..8]: ${toHex(sessionKey).slice(0, 16)}...`
	// )
	// console.log('=======================================================\n')
	return { sessionKey }
}

// Восстановление сессии у получателя и расшифровка сообщения (для DM)
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
	// console.log(
	// '\n========== [E2EE:finalize] finalizeFromEnvelope (сторона Боба) =========='
	// )
	const { bobIKPriv, bobSPKPriv, opkPriv, envelope } = params
	// console.log(
	// '[E2EE:finalize] Конверт от Алисы: ikAPub',
	// envelope.ikAPub.slice(0, 16) + '...',
	// '| ekAPub',
	// envelope.ekAPub.slice(0, 16) + '...'
	// )
	// console.log('[E2EE:finalize] opkPriv:', opkPriv ? 'есть' : 'нет')

	// DH на стороне Боба (private × raw public), тот же UKM
	const ukmU8 = fromHex(envelope.ukm)
	// console.log('[E2EE:finalize] UKM:', envelope.ukm)
	// console.log('[E2EE:finalize] Вычисляю DH1..DH4 (сторона Боба)...')
	// console.log('[E2EE:finalize]   DH1b = SPK_B × IK_A')
	const DH1b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ikAPub)),
		ukmU8
	) // SPK_B × IK_A
	// console.log('[E2EE:finalize]   DH2b = IK_B × EK_A')
	const DH2b = await deriveSharedSecret(
		bobIKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	) // IK_B × EK_A
	// console.log('[E2EE:finalize]   DH3b = SPK_B × EK_A')
	const DH3b = await deriveSharedSecret(
		bobSPKPriv,
		toExactArrayBuffer(fromHex(envelope.ekAPub)),
		ukmU8
	) // SPK_B × EK_A
	let DH4b: Uint8Array | undefined
	if (opkPriv) {
		// console.log('[E2EE:finalize]   DH4b = OPK_B × EK_A')
		const ekBuf = toExactArrayBuffer(fromHex(envelope.ekAPub))
		DH4b = await deriveSharedSecret(opkPriv, ekBuf, ukmU8) // OPK_B × EK_A
	} else {
		// console.log('[E2EE:finalize]   DH4b = пропущен (нет OPK)')
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
	// console.log('[E2EE:finalize] Проверяю подпись Алисы...')
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
	// console.log('[E2EE:finalize] Расшифровываю сообщение...')
	const pt = await decryptKuz(
		encKey,
		fromHex(envelope.iv),
		fromHex(envelope.ct)
	)
	const decrypted = decodeUtf8(pt)
	// console.log(
	// `[E2EE:finalize] ✅ Результат: sigOk=${sigOk}, decrypted="${decrypted?.slice(0, 50)}${(decrypted?.length ?? 0) > 50 ? '...' : ''}"`
	// )
	// console.log('=======================================================\n')

	return { sessionKey, encKey, sigOk, decrypted }
}

export async function generatePreKey() {
	const bobIK = await generateIdentityKeyPair()
	const bobSPK = await generateSignedPreKeyPair(bobIK.privateKey)
	const bobOPKs = await generateOneTimePreKeys(3)

	// Готовим пакет для СЕРВЕРА
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
// как в первом сообщении (MSG-KEYS/X3DH-MSG), затем используется Kuznechik.
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

export const getFingerprint = async (ikPub: string, spkPub: string) => {
	const combined = new Uint8Array(ikPub.length + spkPub.length)
	combined.set(fromHex(ikPub), 0)
	combined.set(fromHex(spkPub), fromHex(ikPub).length)

	const hash = await makeHash(combined)
	return hash
}
// функция проверки ключей которые хранятся локально и на сервере через хэш
export async function checkMyPreKeys(
	myPreKeyFromJSON: PreKeyBundleServer,
	myPreKeyFromServer: {
		ikPub: string
		spkPub: string
	}
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
	// console.log(
	// '\n################################################################'
	// )
	// console.log('[E2EE:demo] 🚀 Запуск демо X3DH (Алиса ↔ Боб)')
	// console.log(
	// '################################################################\n'
	// )

	// ===== УСТРОЙСТВО БОБА: генерируем идентичность, подписанный prekey и одноразовые prekey =====
	// console.log('[E2EE:demo] === УСТРОЙСТВО БОБА ===')
	// console.log('[E2EE:demo] Генерирую IK Боба...')
	const bobIK = await generateIdentityKeyPair()
	// console.log('[E2EE:demo] Генерирую SPK Боба (с подписью)...')
	const bobSPK = await generateSignedPreKeyPair(bobIK.privateKey)
	// console.log('[E2EE:demo] Генерирую 3 OPK Боба...')
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
	// console.log(
	// '[E2EE:demo] Сервер выдал OPK:',
	// issuedOpk ? issuedOpk.slice(0, 16) + '...' : 'null'
	// )
	// console.log('[E2EE:demo] Осталось OPK в пуле:', serverBundle.opkPubs.length)

	// ===== УСТРОЙСТВО АЛИСЫ (БОБ ОФФЛАЙН): получаем пакет и инициируем X3DH =====
	// console.log('\n[E2EE:demo] === УСТРОЙСТВО АЛИСЫ ===')
	// console.log('[E2EE:demo] Генерирую IK Алисы...')
	const aliceIK = await generateIdentityKeyPair()

	// Формируем минимальный набор данных пакета Боба для инициатора
	const bobBundleForAlice = {
		ikPub: serverBundle.ikPub,
		spkPub: serverBundle.spkPub,
		spkSig: serverBundle.spkSig,
		opk: issuedOpk ? issuedOpk : null
	}

	// Конверт первого сообщения Алисы -> Бобу, с установлением сессии
	// console.log('[E2EE:demo] Алиса строит конверт первого сообщения...')
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
	// console.log('\n[E2EE:demo] === УСТРОЙСТВО БОБА (онлайн) ===')
	// console.log('[E2EE:demo] Боб ищет приватный OPK...')
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
	// console.log('[E2EE:demo] OPK найден:', !!opkPriv)
	// console.log('[E2EE:demo] Боб расшифровывает конверт...')

	const finalize = await finalizeFromEnvelope({
		bobIKPriv: bobIK.privateKey,
		bobSPKPriv: bobSPK.kp.privateKey,
		opkPriv,
		envelope: initEnvelope
	})

	const sharedMatches = toHex(aliceSessionKey) === toHex(finalize.sessionKey)

	// console.log(
	// '\n################################################################'
	// )
	// console.log('[E2EE:demo] 🏁 ИТОГО ДЕМО X3DH:')
	// console.log(
	// `[E2EE:demo] SPK подпись верна:         ${verifiedSpk ? '✅ ДА' : '❌ НЕТ'}`
	// )
	// console.log(
	// `[E2EE:demo] Сессионные ключи совпали: ${sharedMatches ? '✅ ДА' : '❌ НЕТ'}`
	// )
	// console.log(
	// `[E2EE:demo] Подпись Алисы верна:     ${finalize.sigOk ? '✅ ДА' : '❌ НЕТ'}`
	// )
	// console.log(`[E2EE:demo] Расшифрованный текст:   "${finalize.decrypted}"`)
	// console.log(`[E2EE:demo] IV:  ${initEnvelope.iv}`)
	// console.log(`[E2EE:demo] CT:  ${initEnvelope.ct.slice(0, 40)}...`)
	// console.log(
	// '################################################################\n'
	// )

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
