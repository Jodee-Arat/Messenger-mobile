import { File, X } from 'lucide-react-native'
import { FC } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { SendFileType } from '@/types/send-file.type'

import { formatBytes } from '@/utils/format-bytes'

interface FileItemProp {
	file: SendFileType
	onDeleteFile: () => void
	isLoadingSend: boolean
}

const FileItem: FC<FileItemProp> = ({ file, isLoadingSend, onDeleteFile }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const isBusy =
		isLoadingSend ||
		file.status === 'encrypting' ||
		file.status === 'uploading'

	const statusLabel =
		file.status === 'encrypting'
			? t('encrypting')
			: file.status === 'uploading'
				? t('uploading')
				: null

	const ext = file.name.includes('.')
		? file.name.split('.').pop()?.toUpperCase()
		: null

	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				backgroundColor: colors.backgroundSecondary,
				borderRadius: 12,
				paddingHorizontal: 10,
				paddingVertical: 8,
				gap: 8,
				minWidth: 140,
				maxWidth: 260
			}}
		>
			<View
				style={{
					width: 36,
					height: 36,
					borderRadius: 10,
					backgroundColor: file.errorMessage
						? 'hsla(0, 80%, 50%, 0.12)'
						: colors.cardHover,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				{isBusy ? (
					<ActivityIndicator size='small' color={colors.accent} />
				) : (
					<File
						size={18}
						color={
							file.errorMessage
								? colors.destructive
								: colors.accent
						}
					/>
				)}
			</View>

			<View style={{ flex: 1, minWidth: 0 }}>
				<Text
					numberOfLines={2}
					style={{
						fontSize: 12,
						fontWeight: '500',
						color: colors.text
					}}
				>
					{file.name}
				</Text>
				{file.errorMessage ? (
					<Text
						numberOfLines={1}
						style={{
							fontSize: 10,
							color: colors.destructive,
							marginTop: 2
						}}
					>
						{file.errorMessage}
					</Text>
				) : (
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							marginTop: 2,
							gap: 4
						}}
					>
						{ext && (
							<View
								style={{
									backgroundColor: colors.accent,
									borderRadius: 4,
									paddingHorizontal: 4,
									paddingVertical: 1
								}}
							>
								<Text
									style={{
										fontSize: 8,
										fontWeight: '700',
										color: '#fff'
									}}
								>
									{ext}
								</Text>
							</View>
						)}
						<Text
							numberOfLines={1}
							style={{
								fontSize: 10,
								color: colors.textSecondary
							}}
						>
							{statusLabel
								? `${statusLabel} · ${formatBytes(parseInt(file.size))}`
								: formatBytes(parseInt(file.size))}
						</Text>
					</View>
				)}
			</View>

			{!isBusy && (
				<TouchableOpacity
					onPress={onDeleteFile}
					hitSlop={8}
					style={{
						width: 22,
						height: 22,
						borderRadius: 11,
						backgroundColor: colors.cardHover,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<X size={12} color={colors.textSecondary} />
				</TouchableOpacity>
			)}
		</View>
	)
}

export default FileItem
