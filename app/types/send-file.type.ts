export interface SendFileType {
	name: string
	size: string
	id: string
	uri?: string
	status?: 'pending' | 'encrypting' | 'uploading' | 'uploaded' | 'failed'
	errorMessage?: string
	/** Pre-encrypted data (encrypt-on-pick, Signal-style) */
	ciphertextBase64?: string
	fileKeyHex?: string
	ivHex?: string
	/** Server-side attachment ID after upload */
	attachmentId?: string
}
