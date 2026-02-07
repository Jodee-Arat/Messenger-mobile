declare module 'gost-crypto' {
	export interface GostAlgoBase {
		name: string
		[k: string]: unknown
	}
	export interface GostSubtle {
		generateKey(
			algo: GostAlgoBase,
			extractable: boolean,
			usages: string[]
		): Promise<CryptoKeyPair>
		importKey(
			format: string,
			keyData: ArrayBuffer | ArrayBufferView,
			algo: GostAlgoBase,
			extractable: boolean,
			keyUsages: string[]
		): Promise<CryptoKey>
		exportKey(format: string, key: CryptoKey): Promise<ArrayBuffer>
		deriveBits(
			algo: GostAlgoBase,
			baseKey: CryptoKey,
			length: number
		): Promise<ArrayBuffer>
		sign(
			algo: GostAlgoBase,
			key: CryptoKey,
			data: ArrayBuffer | ArrayBufferView
		): Promise<ArrayBuffer>
		verify(
			algo: GostAlgoBase,
			key: CryptoKey,
			signature: ArrayBuffer | ArrayBufferView,
			data: ArrayBuffer | ArrayBufferView
		): Promise<boolean>
		encrypt(
			algo: GostAlgoBase,
			key: CryptoKey,
			data: ArrayBuffer | ArrayBufferView
		): Promise<ArrayBuffer>
		decrypt(
			algo: GostAlgoBase,
			key: CryptoKey,
			data: ArrayBuffer | ArrayBufferView
		): Promise<ArrayBuffer>
		digest(
			algo: GostAlgoBase,
			data: ArrayBuffer | ArrayBufferView
		): Promise<ArrayBuffer>
	}
	const crypto: { subtle: GostSubtle }
	export default crypto
}
