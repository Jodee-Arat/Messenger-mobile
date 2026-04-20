import type { ReactNativeFile } from 'extract-files'
import { Camera, Loader2, Pencil, Save, Trash2 } from 'lucide-react-native'
import { FC, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { pickAvatarImage } from '@/utils/avatar-image-picker'
import { createImageUploadFile } from '@/utils/create-image-upload-file'

import { FindGroupByGroupIdQuery } from '@/graphql/generated/output'

interface GroupInfoCardProps {
	group?: FindGroupByGroupIdQuery['findGroupByGroupId']
	isFindGroupByGroupIdLoading: boolean
	canChangeGroupInfo?: boolean
	canChangeGroupName?: boolean
	canChangeGroupAvatar?: boolean
	onSaveInfo?: (
		groupName: string,
		description: string
	) => Promise<boolean> | boolean
	onChangeAvatar?: (file: ReactNativeFile) => Promise<void> | void
	onRemoveAvatar?: () => Promise<void> | void
	isSaving?: boolean
}

const GroupInfoCard: FC<GroupInfoCardProps> = ({
	group,
	isFindGroupByGroupIdLoading,
	canChangeGroupInfo = false,
	canChangeGroupName = false,
	canChangeGroupAvatar = false,
	onSaveInfo,
	onChangeAvatar,
	onRemoveAvatar,
	isSaving = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState('')
	const [editDescription, setEditDescription] = useState('')
	const [isPicking, setIsPicking] = useState(false)
	const canEditGroupInfo = canChangeGroupInfo || canChangeGroupName

	useEffect(() => {
		if (group) {
			setEditName(group.groupName || '')
			setEditDescription(group.description || '')
		}
	}, [group])

	const hasChanges =
		(canChangeGroupName && editName !== (group?.groupName || '')) ||
		(canChangeGroupInfo &&
			editDescription !== (group?.description || ''))

	const handleSave = async () => {
		if ((canChangeGroupName && !editName.trim()) || isSaving || !hasChanges)
			return

		const isSaved = await onSaveInfo?.(
			editName.trim(),
			editDescription.trim()
		)
		if (isSaved !== false) {
			setIsEditing(false)
		}
	}

	const handlePickAvatar = async () => {
		setIsPicking(true)
		try {
			const result = await pickAvatarImage()

			if (result.canceled || !result.assets?.[0]) return

			const file = createImageUploadFile(
				result.assets[0],
				'group-avatar.jpg'
			)
			await onChangeAvatar?.(file)
		} finally {
			setIsPicking(false)
		}
	}

	const handleRemoveAvatar = () => {
		Alert.alert(t('removeAvatar'), t('removeAvatarConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('remove'),
				style: 'destructive',
				onPress: () => onRemoveAvatar?.()
			}
		])
	}

	if (isFindGroupByGroupIdLoading) {
		return (
			<View
				className='mx-4 mt-4 px-4 py-4 rounded-2xl items-center justify-center'
				style={{ backgroundColor: colors.backgroundSecondary }}
			>
				<Loader2 className='animate-spin' color={colors.accent} />
			</View>
		)
	}

	const groupName = group?.groupName ?? t('groupFallback')

	return (
		<View
			className='mx-4 mt-4 p-4 rounded-2xl'
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderWidth: 1,
				borderColor: colors.border
			}}
		>
			<View
				style={{ backgroundColor: colors.accent }}
				className='flex-row items-center rounded-2xl p-1.5'
			>
				<TouchableOpacity
					className='w-14 h-14 rounded-2xl items-center justify-center mr-4'
					onPress={canChangeGroupAvatar ? handlePickAvatar : undefined}
					activeOpacity={canChangeGroupAvatar ? 0.7 : 1}
					disabled={isPicking || isSaving}
				>
					{isPicking ? (
						<ActivityIndicator size='small' color={colors.text} />
					) : (
						<>
							<EntityAvatar
								avatarUrl={group?.avatarUrl}
								name={groupName}
								size='lg'
							/>
							{canChangeGroupAvatar && (
								<View
									className='absolute bottom-0 right-0 w-5 h-5 rounded-full items-center justify-center'
									style={{
										backgroundColor:
											colors.backgroundSecondary
									}}
								>
									<Camera size={12} color={colors.text} />
								</View>
							)}
						</>
					)}
				</TouchableOpacity>

				<View className='flex-1'>
					{isEditing && canChangeGroupName ? (
						<View
							className='rounded-2xl px-3 py-2'
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderWidth: 1.5,
								borderColor: colors.text,
								minHeight: 64,
								justifyContent: 'center'
							}}
						>
							<Text
								className='text-[10px] font-semibold uppercase mb-1'
								style={{ color: colors.textSecondary }}
							>
								{t('groupName')}
							</Text>
							<TextInput
								value={editName}
								onChangeText={setEditName}
								className='text-lg font-bold'
								style={{
									color: colors.text,
									paddingHorizontal: 0,
									paddingVertical: 0,
									lineHeight: 22
								}}
								placeholder={
									t('groupNamePlaceholder') || 'Название группы'
								}
								placeholderTextColor={colors.textMuted}
								textAlignVertical='center'
							/>
						</View>
					) : (
						<Text
							className='text-lg font-bold'
							style={{ color: colors.text }}
							numberOfLines={2}
						>
							{groupName}
						</Text>
					)}
				</View>

				{canEditGroupInfo && (
					<TouchableOpacity
						onPress={() =>
							isEditing ? void handleSave() : setIsEditing(true)
						}
						activeOpacity={0.7}
						disabled={isSaving}
						className='w-9 h-9 rounded-full items-center justify-center'
						style={{
							backgroundColor: colors.backgroundSecondary,
							opacity: isSaving ? 0.6 : 1
						}}
					>
						{isEditing ? (
							<Save size={16} color={colors.accent} />
						) : (
							<Pencil size={16} color={colors.text} />
						)}
					</TouchableOpacity>
				)}
			</View>

			{(group?.description || (isEditing && canChangeGroupInfo)) && (
				<View className='mt-3'>
					<Text
						className='text-xs font-semibold uppercase tracking-wider mb-1'
						style={{ color: colors.textSecondary }}
					>
						{t('description')}
					</Text>
					{isEditing && canChangeGroupInfo ? (
						<TextInput
							value={editDescription}
							onChangeText={setEditDescription}
							className='text-sm rounded-xl px-3 py-2'
							style={{
								color: colors.text,
								backgroundColor: colors.backgroundTertiary,
								borderWidth: 1,
								borderColor: colors.border
							}}
							placeholder={t('descriptionPlaceholder')}
							placeholderTextColor={colors.textMuted}
							multiline
							numberOfLines={3}
							textAlignVertical='top'
						/>
					) : (
						<Text
							className='text-sm'
							style={{ color: colors.textSecondary }}
						>
							{group?.description}
						</Text>
					)}
				</View>
			)}

			{isEditing && canChangeGroupAvatar && group?.avatarUrl && (
				<TouchableOpacity
					onPress={handleRemoveAvatar}
					activeOpacity={0.7}
					className='flex-row items-center justify-center py-2.5 rounded-xl mt-3'
					style={{
						backgroundColor: colors.destructiveMuted
					}}
				>
					<Trash2
						size={16}
						color={colors.destructive}
						style={{ marginRight: 6 }}
					/>
					<Text
						className='text-xs font-semibold'
						style={{ color: colors.destructive }}
					>
						{t('removeAvatar')}
					</Text>
				</TouchableOpacity>
			)}

			{isEditing && canEditGroupInfo && hasChanges && (
				<TouchableOpacity
					onPress={() => void handleSave()}
					activeOpacity={0.7}
					disabled={isSaving || (canChangeGroupName && !editName.trim())}
					className='flex-row items-center justify-center py-3 rounded-xl mt-3'
					style={{
						backgroundColor: colors.accent,
						opacity: isSaving || !editName.trim() ? 0.5 : 1
					}}
				>
					{isSaving ? (
						<ActivityIndicator size='small' color={colors.text} />
					) : (
						<>
							<Save
								size={16}
								color={colors.text}
								style={{ marginRight: 6 }}
							/>
							<Text
								className='text-sm font-semibold'
								style={{ color: colors.text }}
							>
								{t('saveChanges')}
							</Text>
						</>
					)}
				</TouchableOpacity>
			)}
		</View>
	)
}

export default GroupInfoCard
