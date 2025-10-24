import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { Platform } from 'react-native'

export async function downloadFile(fileUrl: string, filename: string) {
	try {
		// Запрашиваем разрешение на доступ к галерее
		const { status } = await MediaLibrary.requestPermissionsAsync()
		if (status !== 'granted') {
			console.warn('Permission to access media library denied')
			return
		}

		// Путь во временную папку приложения
		const fileUri = FileSystem.cacheDirectory + filename

		// Скачиваем файл
		const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri)
		console.log('Файл скачан во временное хранилище:', uri)

		// Сохраняем в галерею
		const asset = await MediaLibrary.createAssetAsync(uri)

		// На Android можно указать папку (опционально)
		if (Platform.OS === 'android') {
			const album = await MediaLibrary.getAlbumAsync('Download')
			if (album == null) {
				await MediaLibrary.createAlbumAsync('Download', asset, false)
			} else {
				await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
			}
		}

		console.log('Файл сохранён в галерею:', asset.uri)
	} catch (err) {
		console.error('Ошибка при сохранении изображения:', err)
	}
}
