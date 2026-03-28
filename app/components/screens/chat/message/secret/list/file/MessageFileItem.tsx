import { File } from 'lucide-react-native'
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
import { base64ToBytes, bytesToBase64 } from '@/utils/math/base64'
import { shareSecretAttachmentBytes } from '@/utils/secret-chat/secretAttachment'

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

interface MessageFileItemProp {
	file: MessageFileType
	chatId: string
	isSelected: boolean
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const MessageFileItem: FC<MessageFileItemProp> = ({
	file,
	chatId,
	isSelected
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
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
					if (isImageFile(file.fileFormat)) {
						const mimeType =
							file.fileFormat === 'png'
								? 'image/png'
								: 'image/jpeg'
						const base64 = bytesToBase64(decryptedBytes)
						setImageUrl(`data:${mimeType};base64,${base64}`)
					} else {
						await shareSecretAttachmentBytes(
							decryptedBytes,
							file.fileName
						)
					}
				} catch (error) {
					console.error(
						'[SecretChat] Failed to decrypt secret attachment:',
						error
					)
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

	// Auto-fetch image URL on mount
	React.useEffect(() => {
		if (isImageFile(file.fileFormat) && !imageUrl) {
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
	}, [file.id])

	const handleDownload = () => {
		if (isSelected || isLoadingDownload) return

		if (file.isSecretAttachment) {
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

	const handleImagePress = () => {
		if (isSelected) return
		if (imageUrl) {
			setFullscreenVisible(true)
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
					</Pressable>
				</Modal>
			</>
		)
	}

	// Non-image file
	return (
		<TouchableOpacity
			onPress={handleDownload}
			activeOpacity={0.7}
			disabled={isSelected || isLoadingDownload}
			className='flex-row items-center p-1 rounded-md bg-transparent'
		>
			{isLoadingDownload ? (
				<ActivityIndicator size='small' color={colors.accent} />
			) : (
				<File size={28} color={colors.accent} />
			)}

			<View className='ml-2 w-24'>
				<Text
					numberOfLines={1}
					className='text-xs font-medium'
					style={{ color: colors.text }}
				>
					{file.fileName}
				</Text>
				<Text
					numberOfLines={1}
					className='text-[10px]'
					style={{ color: colors.textSecondary }}
				>
					({formatBytes(parseInt(file.fileSize))})
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default MessageFileItem
