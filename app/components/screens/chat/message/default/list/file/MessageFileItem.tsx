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

	const [download, { loading: isLoadingDownload }] = useDownloadFileMutation({
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
				Toast.show({ type: 'error', text1: t('fileDownloadFailed') })
			}
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

	const handleImagePress = () => {
		if (isSelected) return
		if (imageUrl) {
			setFullscreenVisible(true)
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
					</Pressable>
				</Modal>
			</>
		)
	}

	// Non-image file — original file icon
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
