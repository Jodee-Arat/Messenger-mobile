import { File, Loader2, X } from 'lucide-react-native'
import { useTheme } from '@/hooks/useTheme'
import { FC } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button/Button'
import { SendFileType } from '@/types/send-file.type'

import { formatBytes } from '@/utils/format-bytes'

interface FileItemProp {
	file: SendFileType
	onDeleteFile: () => void
	isLoadingSend: boolean
}

const FileItem: FC<FileItemProp> = ({ file, isLoadingSend, onDeleteFile }) => {
	const { colors } = useTheme()
	const isBusy =
		isLoadingSend ||
		file.status === 'encrypting' ||
		file.status === 'uploading'
	return (
		<View>
			<View className='flex cursor-grab select-none'>
				<File color={colors.accent} size={32} />

				<View className='w-15 flex flex-col'>
					<Text
						className='truncate text-xs'
						style={{ color: colors.text }}
					>
						{file.name}
					</Text>
					<Text
						className='truncate text-xs'
						style={{ color: colors.textSecondary }}
					>
						({formatBytes(parseInt(file.size))})
					</Text>
					{file.errorMessage ? (
						<Text
							className='truncate text-[10px]'
							style={{ color: colors.destructive }}
						>
							{file.errorMessage}
						</Text>
					) : null}
				</View>
				{isBusy ? (
					<Loader2
						color={colors.accent}
						className='ml-1 size-5 animate-spin'
					/>
				) : (
					<Button
						className='ml-1 size-5 rounded-full p-0'
						onPress={onDeleteFile}
					>
						<X color={colors.textSecondary} />
					</Button>
				)}
			</View>
		</View>
	)
}

export default FileItem
