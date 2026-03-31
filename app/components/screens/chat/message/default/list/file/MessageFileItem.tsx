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

import { downloadFile } from '@/utils/download-file'
import { formatBytes } from '@/utils/format-bytes'

import { useDownloadFileMutation } from '@/graphql/generated/output'

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

	const [download, { loading: isLoadingDownload }] = useDownloadFileMutation({
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
					} catch (err) {
						console.error('[MessageFileItem] download error:', err)
						Toast.show({
							type: 'error',
							text1: t('fileDownloadError')
						})
					}
				}
			} else {
				Toast.show({ type: 'error', text1: t('fileDownloadFailed') })
			}
		},
		onError: err => {
			console.error('[MessageFileItem] mutation error:', err)
			Toast.show({
				type: 'error',
				text1: t('fileDownloadFailed'),
				text2: err.message
			})
		}
	})

	// Auto-fetch image URL on mount
	React.useEffect(() => {
		if (isImageFile(file.fileFormat) && !imageUrl) {
			download({ variables: { fileId: file.id, chatId } })
		}
	}, [file.id])

	const handleDownload = () => {
		if (isSelected || isLoadingDownload) return
		download({
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
		} catch {
			Toast.show({ type: 'error', text1: t('fileDownloadError') })
		} finally {
			setIsSaving(false)
		}
	}

	// Image file — render as inline preview
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

	// Non-image file — original file icon
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
