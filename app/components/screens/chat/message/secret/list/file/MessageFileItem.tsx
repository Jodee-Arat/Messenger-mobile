import { Directory, File as ExpoFile, Paths } from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { Download, File } from 'lucide-react-native'
import React, { FC, useState } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	Image,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { MessageFileType } from '@/types/message-file.type'

import { downloadFile, saveLocalFile } from '@/utils/download-file'
import { formatBytes } from '@/utils/format-bytes'
import { base64ToBytes } from '@/utils/math/base64'

import {
	useDownloadFileMutation,
	useDownloadSecretAttachmentMutation
} from '@/graphql/generated/output'
import { decryptKuz, fromHex } from '@/libs/e2ee/gost'

const IMAGE_EXTENSIONS = [
	'jpg',
	'jpeg',
	'png',
	'gif',
	'webp',
	'bmp',
	'heic',
	'heif'
]

const isImageFile = (format: string) =>
	IMAGE_EXTENSIONS.includes(format.toLowerCase())

/** Disk cache for decrypted secret attachments */
const SECRET_CACHE_DIR_NAME = 'secret-attachments-cache'

const getCacheFile = (attachmentId: string, format: string) => {
	const dir = new Directory(Paths.cache, SECRET_CACHE_DIR_NAME)
	if (!dir.exists) dir.create({ idempotent: true })
	return new ExpoFile(dir, `${attachmentId}.${format}`)
}

interface MessageFileItemProp {
	file: MessageFileType
	chatId: string
	isSelected: boolean
	isOwnMessage?: boolean
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const MessageFileItem: FC<MessageFileItemProp> = ({
	file,
	chatId,
	isSelected,
	isOwnMessage = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const displayName = (() => {
		try {
			return decodeURIComponent(file.fileName)
		} catch {
			return file.fileName
		}
	})()
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [fullscreenVisible, setFullscreenVisible] = useState(false)

	const [downloadSecretAttachment, { loading: isLoadingSecretAttachment }] =
		useDownloadSecretAttachmentMutation({
			onCompleted: async data => {
				const payload = data.downloadSecretAttachment

				if (!payload || !file.fileKeyHex || !file.ivHex) {
					Toast.show({
						type: 'error',
						text1: t('fileDownloadFailed')
					})
					return
				}

				try {
					const decryptedBytes = await decryptKuz(
						fromHex(file.fileKeyHex),
						fromHex(file.ivHex),
						base64ToBytes(payload.ciphertextBase64)
					)
					// Save to disk cache so we never decrypt again
					const cached = getCacheFile(file.id, file.fileFormat)

					cached.write(decryptedBytes)

					if (isImageFile(file.fileFormat)) {
						setImageUrl(cached.uri)
					} else {
						// Copy with proper filename
						const dir = new Directory(
							Paths.cache,
							'secret-download'
						)
						if (!dir.exists) dir.create({ idempotent: true })
						const dest = new ExpoFile(dir, file.fileName)
						if (dest.exists) dest.delete()
						cached.copy(dest)
						const saved = await saveLocalFile(
							dest.uri,
							file.fileName
						)
						if (saved)
							Toast.show({
								type: 'success',
								text1: t('fileSaved')
							})
					}
				} catch (error) {
					Toast.show({
						type: 'error',
						text1: t('fileDownloadError')
					})
				}
			},
			onError: error => {
				Toast.show({
					type: 'error',
					text1: t('fileDownloadFailed'),
					text2: error.message
				})
			}
		})

	const [downloadFileMutation, { loading: isLoadingRegularFile }] =
		useDownloadFileMutation({
			onCompleted: async data => {
				if (data.downloadFile) {
					const { fileUrl, filename } = data.downloadFile
					if (isImageFile(file.fileFormat)) {
						setImageUrl(fileUrl)
					} else {
						try {
							await downloadFile(fileUrl, filename)
							Toast.show({
								type: 'success',
								text1: t('fileSaved')
							})
						} catch {
							Toast.show({
								type: 'error',
								text1: t('fileDownloadError')
							})
						}
					}
				} else {
					Toast.show({
						type: 'error',
						text1: t('fileDownloadFailed')
					})
				}
			}
		})

	const isLoadingDownload = isLoadingSecretAttachment || isLoadingRegularFile

	// Auto-fetch image URL on mount (check disk cache first)
	React.useEffect(() => {
		if (isImageFile(file.fileFormat) && !imageUrl) {
			// Check disk cache first — instant display
			if (file.localUri) {
				setImageUrl(file.localUri)
				return
			}

			const cached = getCacheFile(file.id, file.fileFormat)

			if (cached.exists) {
				setImageUrl(cached.uri)
				return
			}

			if (file.isSecretAttachment) {
				if (file.fileKeyHex && file.ivHex) {
					downloadSecretAttachment({
						variables: { chatId, attachmentId: file.id }
					})
				}
			} else {
				downloadFileMutation({
					variables: { fileId: file.id, chatId }
				})
			}
		}
	}, [file.id, file.localUri])

	const handleDownload = async () => {
		if (isSelected || isLoadingDownload) return

		if (file.isSecretAttachment) {
			// Check cache first
			if (file.localUri) {
				try {
					const saved = await saveLocalFile(file.localUri, file.fileName)
					if (saved)
						Toast.show({ type: 'success', text1: t('fileSaved') })
				} catch {
					Toast.show({ type: 'error', text1: t('fileDownloadError') })
				}
				return
			}

			const cached = getCacheFile(file.id, file.fileFormat)
			if (cached.exists) {
				try {
					// Copy with proper filename
					const dir = new Directory(Paths.cache, 'secret-download')
					if (!dir.exists) dir.create({ idempotent: true })
					const dest = new ExpoFile(dir, file.fileName)
					if (dest.exists) dest.delete()
					cached.copy(dest)
					const saved = await saveLocalFile(dest.uri, file.fileName)
					if (saved)
						Toast.show({ type: 'success', text1: t('fileSaved') })
				} catch (err) {
					Toast.show({ type: 'error', text1: t('fileDownloadError') })
				}
				return
			}

			if (!file.fileKeyHex || !file.ivHex) {
				Toast.show({
					type: 'error',
					text1: t('fileDownloadFailed')
				})
				return
			}

			void downloadSecretAttachment({
				variables: {
					chatId,
					attachmentId: file.id
				}
			})
			return
		}

		void downloadFileMutation({
			variables: {
				fileId: file.id,
				chatId
			}
		})
	}

	const [isSaving, setIsSaving] = useState(false)

	const handleImagePress = () => {
		if (isSelected) return
		if (imageUrl) {
			setFullscreenVisible(true)
		}
	}

	const handleSaveImage = async () => {
		if (!imageUrl || isSaving) return
		setIsSaving(true)
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync()
			if (status !== 'granted') {
				Toast.show({ type: 'error', text1: t('permissionDenied') })
				return
			}

			if (file.isSecretAttachment) {
				// Secret image — cached file on disk, save to gallery
				await MediaLibrary.saveToLibraryAsync(imageUrl)
				Toast.show({ type: 'success', text1: t('fileSaved') })
			} else {
				// Regular image — download and save to gallery
				const dir = new Directory(Paths.cache, 'image-save')
				if (!dir.exists) dir.create({ idempotent: true })
				const safeName = `${Date.now()}_${file.fileName || `image.${file.fileFormat}`}`
				const dest = new ExpoFile(dir, safeName)
				await ExpoFile.downloadFileAsync(imageUrl, dest)
				await MediaLibrary.saveToLibraryAsync(dest.uri)
				try {
					dest.delete()
				} catch {}
				Toast.show({ type: 'success', text1: t('fileSaved') })
			}
		} catch {
			Toast.show({ type: 'error', text1: t('fileDownloadError') })
		} finally {
			setIsSaving(false)
		}
	}

	// Image file — render inline preview
	if (isImageFile(file.fileFormat)) {
		return (
			<>
				<Pressable onPress={handleImagePress} disabled={isSelected}>
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={{
								width: SCREEN_WIDTH * 0.55,
								height: SCREEN_WIDTH * 0.55,
								borderRadius: 8,
								marginTop: 4
							}}
							resizeMode='cover'
						/>
					) : (
						<View
							style={{
								width: SCREEN_WIDTH * 0.55,
								height: SCREEN_WIDTH * 0.35,
								borderRadius: 8,
								marginTop: 4,
								backgroundColor: colors.backgroundTertiary,
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<ActivityIndicator
								size='small'
								color={colors.accent}
							/>
						</View>
					)}
				</Pressable>

				<Modal
					visible={fullscreenVisible}
					transparent
					animationType='fade'
					statusBarTranslucent
					onRequestClose={() => setFullscreenVisible(false)}
				>
					<Pressable
						style={{
							flex: 1,
							backgroundColor: 'rgba(0,0,0,0.92)',
							justifyContent: 'center',
							alignItems: 'center'
						}}
						onPress={() => setFullscreenVisible(false)}
					>
						{imageUrl && (
							<Image
								source={{ uri: imageUrl }}
								style={{
									width: SCREEN_WIDTH,
									height: SCREEN_WIDTH
								}}
								resizeMode='contain'
							/>
						)}
						<TouchableOpacity
							onPress={handleSaveImage}
							disabled={isSaving}
							style={{
								position: 'absolute',
								bottom: 50,
								alignSelf: 'center',
								backgroundColor: 'rgba(255,255,255,0.15)',
								borderRadius: 24,
								paddingHorizontal: 20,
								paddingVertical: 10,
								flexDirection: 'row',
								alignItems: 'center',
								gap: 8
							}}
							activeOpacity={0.7}
						>
							{isSaving ? (
								<ActivityIndicator size='small' color='#fff' />
							) : (
								<Download size={20} color='#fff' />
							)}
							<Text
								style={{
									color: '#fff',
									fontSize: 14,
									fontWeight: '600'
								}}
							>
								{t('saveToGallery')}
							</Text>
						</TouchableOpacity>
					</Pressable>
				</Modal>
			</>
		)
	}

	// Non-image file
	const fileIconColor = isOwnMessage
		? 'rgba(255,255,255,0.85)'
		: colors.accent
	const fileTextColor = isOwnMessage ? '#fff' : colors.text
	const fileSizeColor = isOwnMessage
		? 'rgba(255,255,255,0.65)'
		: colors.textSecondary
	return (
		<TouchableOpacity
			onPress={handleDownload}
			activeOpacity={0.7}
			disabled={isSelected || isLoadingDownload}
			className='flex-row items-center p-1 rounded-md bg-transparent'
		>
			{isLoadingDownload ? (
				<ActivityIndicator size='small' color={fileIconColor} />
			) : (
				<File size={28} color={fileIconColor} />
			)}

			<View className='ml-2 w-24'>
				<Text
					numberOfLines={1}
					className='text-xs font-medium'
					style={{ color: fileTextColor }}
				>
					{displayName}
				</Text>
				<Text
					numberOfLines={1}
					className='text-[10px]'
					style={{ color: fileSizeColor }}
				>
					({formatBytes(parseInt(file.fileSize))})
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default MessageFileItem
