import { ReactNativeFile } from 'extract-files'

type UploadAsset = {
	uri: string
	fileName?: string | null
	mimeType?: string | null
}

const getFilenameFromUri = (uri: string) => {
	const filename = uri.split('/').pop()
	return filename && filename.length > 0 ? filename : undefined
}

export const createImageUploadFile = (
	asset: UploadAsset,
	fallbackName: string
) =>
	new ReactNativeFile({
		uri: asset.uri,
		name: asset.fileName ?? getFilenameFromUri(asset.uri) ?? fallbackName,
		type: asset.mimeType ?? 'image/jpeg'
	})
