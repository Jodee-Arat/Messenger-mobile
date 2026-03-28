import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const DOWNLOADS_DIR_NAME = 'downloads'

const sanitizeFilename = (filename: string) =>
	filename.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')

export async function downloadFile(fileUrl: string, filename: string) {
	const downloadsDirectory = new Directory(Paths.document, DOWNLOADS_DIR_NAME)
	if (!downloadsDirectory.exists) {
		downloadsDirectory.create({ idempotent: true, intermediates: true })
	}

	const safeFilename = sanitizeFilename(filename)
	const destinationFile = new File(downloadsDirectory, safeFilename)
	const downloadedFile = await File.downloadFileAsync(
		fileUrl,
		destinationFile,
		{ idempotent: true }
	)

	console.log('Файл скачан локально:', downloadedFile.uri)

	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(downloadedFile.uri, {
			dialogTitle: safeFilename
		})
	}

	return downloadedFile.uri
}
