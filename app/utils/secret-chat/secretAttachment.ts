import { createId } from '@paralleldrive/cuid2'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const SECRET_ATTACHMENTS_DIR_NAME = 'secret-attachments'

const sanitizeFilename = (filename: string) =>
	filename.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')

export const shareSecretAttachmentBytes = async (
	bytes: Uint8Array,
	filename: string
) => {
	const attachmentsDirectory = new Directory(
		Paths.cache,
		SECRET_ATTACHMENTS_DIR_NAME
	)
	if (!attachmentsDirectory.exists) {
		attachmentsDirectory.create({ idempotent: true, intermediates: true })
	}

	const safeFilename = sanitizeFilename(filename)
	const tempFile = new File(
		attachmentsDirectory,
		`${createId()}-${safeFilename}`
	)

	try {
		tempFile.create({ intermediates: true, overwrite: true })
		tempFile.write(bytes)

		if (!(await Sharing.isAvailableAsync())) {
			throw new Error('Sharing is unavailable on this device')
		}

		await Sharing.shareAsync(tempFile.uri, {
			dialogTitle: safeFilename
		})
	} finally {
		if (tempFile.exists) {
			tempFile.delete()
		}
	}
}
