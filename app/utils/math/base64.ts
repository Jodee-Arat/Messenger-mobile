const BASE64_ALPHABET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export const bytesToBase64 = (bytes: Uint8Array): string => {
	let output = ''

	for (let i = 0; i < bytes.length; i += 3) {
		const byte1 = bytes[i] ?? 0
		const byte2 = bytes[i + 1] ?? 0
		const byte3 = bytes[i + 2] ?? 0

		const chunk = (byte1 << 16) | (byte2 << 8) | byte3

		output += BASE64_ALPHABET[(chunk >> 18) & 63]
		output += BASE64_ALPHABET[(chunk >> 12) & 63]
		output += i + 1 < bytes.length ? BASE64_ALPHABET[(chunk >> 6) & 63] : '='
		output += i + 2 < bytes.length ? BASE64_ALPHABET[chunk & 63] : '='
	}

	return output
}

export const base64ToBytes = (value: string): Uint8Array => {
	const sanitized = value.replace(/\s+/g, '')
	if (sanitized.length % 4 !== 0) {
		throw new Error('Invalid base64 length')
	}

	const lookup = new Map<string, number>()
	for (let i = 0; i < BASE64_ALPHABET.length; i++) {
		lookup.set(BASE64_ALPHABET[i], i)
	}

	const padding =
		(sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0)
	const outputLength = (sanitized.length / 4) * 3 - padding
	const output = new Uint8Array(outputLength)

	let outputIndex = 0
	for (let i = 0; i < sanitized.length; i += 4) {
		const c1 = sanitized[i]
		const c2 = sanitized[i + 1]
		const c3 = sanitized[i + 2]
		const c4 = sanitized[i + 3]

		const v1 = lookup.get(c1)
		const v2 = lookup.get(c2)
		const v3 = c3 === '=' ? 0 : lookup.get(c3)
		const v4 = c4 === '=' ? 0 : lookup.get(c4)

		if (
			v1 === undefined ||
			v2 === undefined ||
			(c3 !== '=' && v3 === undefined) ||
			(c4 !== '=' && v4 === undefined)
		) {
			throw new Error('Invalid base64 character')
		}

		const chunk = (v1 << 18) | (v2 << 12) | ((v3 ?? 0) << 6) | (v4 ?? 0)

		output[outputIndex++] = (chunk >> 16) & 255
		if (c3 !== '=' && outputIndex <= outputLength) {
			output[outputIndex++] = (chunk >> 8) & 255
		}
		if (c4 !== '=' && outputIndex <= outputLength) {
			output[outputIndex++] = chunk & 255
		}
	}

	return output
}
