import { Directory, File, Paths } from 'expo-file-system'
import * as LegacyFS from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Alert, Platform } from 'react-native'

const DOWNLOADS_DIR_NAME = 'downloads'

const sanitizeFilename = (filename: string) =>
	filename.replace(/[<>:"/ \\|?*\u0000-\u001F]/g, '_')

const MIME_MAP: Record<string, string> = {
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	zip: 'application/zip',
	rar: 'application/x-rar-compressed',
	'7z': 'application/x-7z-compressed',
	txt: 'text/plain',
	csv: 'text/csv',
	json: 'application/json',
	xml: 'application/xml',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	avi: 'video/x-msvideo',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	svg: 'image/svg+xml'
}

export function getMimeType(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? ''
	return MIME_MAP[ext] ?? 'application/octet-stream'
}

function getDownloadsDir(): Directory {
	const dir = new Directory(Paths.document, DOWNLOADS_DIR_NAME)
	if (!dir.exists) dir.create({ idempotent: true, intermediates: true })
	return dir
}

/**
 * Android: save file via SAF (user picks directory).
 * Returns true if saved, false if cancelled or failed.
 */
async function saveViaAndroidSAF(
	sourceUri: string,
	filename: string
): Promise<boolean> {
	try {
		const permissions =
			await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync()
		if (!permissions.granted) return false

		const mimeType = getMimeType(filename)
		const destUri = await LegacyFS.StorageAccessFramework.createFileAsync(
			permissions.directoryUri,
			filename,
			mimeType
		)

		const base64 = await LegacyFS.readAsStringAsync(sourceUri, {
			encoding: LegacyFS.EncodingType.Base64
		})
		await LegacyFS.writeAsStringAsync(destUri, base64, {
			encoding: LegacyFS.EncodingType.Base64
		})

		return true
	} catch (err) {
		console.warn('[saveViaAndroidSAF] failed:', err)
		return false
	}
}

/**
 * Save a local file.
 * Android: SAF dialog → fallback to share sheet if SAF fails.
 * iOS: share sheet with "Save to Files".
 * Returns true if saved successfully.
 */
export async function saveLocalFile(
	sourceUri: string,
	filename: string
): Promise<boolean> {
	if (Platform.OS === 'android') {
		return saveViaAndroidSAF(sourceUri, filename)
	}

	// iOS — share sheet has "Save to Files"
	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(sourceUri, {
			mimeType: getMimeType(filename),
			dialogTitle: filename
		})
	}
	return true
}

export async function downloadFile(fileUrl: string, filename: string) {
	const safeFilename = sanitizeFilename(filename)
	const destinationFile = new File(getDownloadsDir(), safeFilename)
	const downloadedFile = await File.downloadFileAsync(
		fileUrl,
		destinationFile,
		{ idempotent: true }
	)

	await saveLocalFile(downloadedFile.uri, safeFilename)

	return downloadedFile.uri
}
