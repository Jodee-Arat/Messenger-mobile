import { File } from 'lucide-react-native'
import React, { FC } from 'react'
import {
	ActivityIndicator,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { MessageFileType } from '@/types/message-file.type'

import { downloadFile } from '@/utils/download-file'
import { formatBytes } from '@/utils/format-bytes'

import { useDownloadFileMutation } from '@/graphql/generated/output'

interface MessageFileItemProp {
	file: MessageFileType
	chatId: string
	isSelected: boolean
}

const MessageFileItem: FC<MessageFileItemProp> = ({
	file,
	chatId,
	isSelected
}) => {
	const [download, { loading: isLoadingDownload }] = useDownloadFileMutation({
		onCompleted: async data => {
			if (data.downloadFile) {
				const { fileUrl, filename } = data.downloadFile
				try {
					await downloadFile(fileUrl, filename)
				} catch {
					Toast.show({
						type: 'error',
						text1: 'Ошибка при загрузке файла'
					})
				}
			} else {
				Toast.show({ type: 'error', text1: 'Не удалось скачать файл' })
			}
		}
	})

	const handleDownload = () => {
		if (isSelected || isLoadingDownload) return
		download({
			variables: {
				fileId: file.id,
				chatId
			}
		})
	}

	return (
		<TouchableOpacity
			onPress={handleDownload}
			activeOpacity={0.7}
			disabled={isSelected || isLoadingDownload}
			className='flex-row items-center p-1 rounded-md bg-transparent'
		>
			{isLoadingDownload ? (
				<ActivityIndicator size='small' />
			) : (
				<File size={28} color='#000' />
			)}

			<View className='ml-2 w-24'>
				<Text
					numberOfLines={1}
					className='text-xs font-medium text-black'
				>
					{file.fileName}
				</Text>
				<Text numberOfLines={1} className='text-[10px] text-gray-500'>
					({formatBytes(parseInt(file.fileSize))})
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default MessageFileItem
