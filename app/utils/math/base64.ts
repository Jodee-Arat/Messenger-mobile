export const bytesToBase64 = (bytes: Uint8Array): string => {
	// Используем нативный btoa с чанкованием вместо ручного цикла.
	// String.fromCharCode(...chunk) — нативный вызов, btoa — нативный вызов.
	// Это на порядок быстрее ручной посимвольной конкатенации для больших файлов.
	const CHUNK = 8192
	let binary = ''
	for (let i = 0; i < bytes.length; i += CHUNK) {
		binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
	}
	return btoa(binary)
}

export const base64ToBytes = (value: string): Uint8Array => {
	const binary = atob(value.replace(/\s+/g, ''))
	const output = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++) {
		output[i] = binary.charCodeAt(i)
	}
	return output
}
