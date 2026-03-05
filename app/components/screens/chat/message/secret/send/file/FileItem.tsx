import { File, Loader2, X } from 'lucide-react-native'
import { useTheme } from '@/hooks/useTheme'
import { FC } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button/Button'

import { formatBytes } from '@/utils/format-bytes'

interface FileItemProp {
	file: { name: string; size: string }
	onDeleteFile: () => void
	isLoadingSend: boolean
}

const FileItem: FC<FileItemProp> = ({ file, isLoadingSend, onDeleteFile }) => {
	const { colors } = useTheme()
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
				</View>
				{isLoadingSend ? (
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
