import { Trash2 } from 'lucide-react-native'
import { FC } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { FindAllGroupsByUserQuery } from '@/graphql/generated/output'

type GroupItem = FindAllGroupsByUserQuery['findAllGroupsByUser'][0]

interface GroupActionSheetProps {
	group: GroupItem | null
	onClose: () => void
	onDelete: (groupId: string) => void
}

const GroupActionSheet: FC<GroupActionSheetProps> = ({
	group,
	onClose,
	onDelete
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	if (!group) return null

	return (
		<Modal
			transparent
			visible={!!group}
			animationType='fade'
			onRequestClose={onClose}
		>
			<Pressable
				className='flex-1'
				style={{ backgroundColor: colors.overlay }}
				onPress={onClose}
			/>
			<View
				style={{
					backgroundColor: colors.backgroundTertiary,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					borderTopWidth: 1,
					borderColor: colors.borderLight,
					paddingBottom: 34,
					paddingTop: 12,
					paddingHorizontal: 16
				}}
			>
				<View
					className='mb-3 px-3 py-2 rounded-xl'
					style={{
						backgroundColor: colors.cardHover,
						borderLeftWidth: 3,
						borderLeftColor: colors.accent
					}}
				>
					<Text
						className='text-sm font-semibold'
						style={{ color: colors.text }}
					>
						{group.groupName}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => {
						onDelete(group.id)
						onClose()
					}}
					activeOpacity={0.6}
					className='flex-row items-center px-4 py-3 rounded-xl'
				>
					<View
						className='w-9 h-9 rounded-full items-center justify-center mr-3'
						style={{
							backgroundColor: 'hsla(0, 80%, 50%, 0.15)'
						}}
					>
						<Trash2 size={20} color={colors.destructive} />
					</View>
					<Text
						className='text-sm font-medium'
						style={{ color: colors.destructive }}
					>
						{t('deleteGroup')}
					</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	)
}

export default GroupActionSheet
