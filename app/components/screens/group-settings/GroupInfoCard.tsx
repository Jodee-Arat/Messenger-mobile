import * as ImagePicker from 'expo-image-picker'
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

import { FindGroupByGroupIdQuery } from '@/graphql/generated/output'

interface GroupInfoCardProps {
	group?: FindGroupByGroupIdQuery['findGroupByGroupId']
	isFindGroupByGroupIdLoading: boolean
	canChangeGroupInfo?: boolean
	onSaveInfo?: (groupName: string, description: string) => void
	onChangeAvatar?: (file: any) => void
	onRemoveAvatar?: () => void
	isSaving?: boolean
}

const GroupInfoCard: FC<GroupInfoCardProps> = ({
	group,
	isFindGroupByGroupIdLoading,
	canChangeGroupInfo = false,
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

	useEffect(() => {
		if (group) {
			setEditName(group.groupName || '')
			setEditDescription(group.description || '')
		}
	}, [group])

	const hasChanges =
		editName !== (group?.groupName || '') ||
		editDescription !== (group?.description || '')

	const handleSave = () => {
		if (!editName.trim()) return
		onSaveInfo?.(editName.trim(), editDescription.trim())
		setIsEditing(false)
	}

	const handlePickAvatar = async () => {
		setIsPicking(true)
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				quality: 0.8
			})

			if (!result.canceled) {
				const asset = result.assets[0]
				const file = {
					uri: asset.uri,
					type: 'image/jpeg',
					name: 'group-avatar.jpg'
				} as any
				onChangeAvatar?.(file)
			}
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

	return (
		<View
			className='mx-4 mt-4 p-4 rounded-2xl'
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderWidth: 1,
				borderColor: colors.border
			}}
		>
			{/* Avatar + Name header */}
			<View
				style={{
					backgroundColor: colors.accent
				}}
				className='flex-row items-center rounded-2xl p-1.5'
			>
				<TouchableOpacity
					className='w-14 h-14 rounded-2xl items-center justify-center mr-4'
					onPress={canChangeGroupInfo ? handlePickAvatar : undefined}
					activeOpacity={canChangeGroupInfo ? 0.7 : 1}
					disabled={isPicking}
				>
					{isPicking ? (
						<ActivityIndicator size='small' color={colors.text} />
					) : (
						<>
							<EntityAvatar
								avatarUrl={group?.avatarUrl}
								name={group?.groupName}
								size={'lg'}
							/>
							{canChangeGroupInfo && (
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
					{isEditing ? (
						<TextInput
							value={editName}
							onChangeText={setEditName}
							className='text-lg font-bold border-2 rounded-xl mr-1.5 p-1'
							style={{
								color: colors.text,
								padding: 0,
								borderColor: colors.background
							}}
							placeholder={t('groupNamePlaceholder')}
							placeholderTextColor={colors.textMuted}
						/>
					) : (
						<Text
							className='text-lg font-bold'
							style={{ color: colors.text }}
						>
							{group?.groupName}
						</Text>
					)}
				</View>
				{canChangeGroupInfo && (
					<TouchableOpacity
						onPress={() =>
							isEditing ? handleSave() : setIsEditing(true)
						}
						activeOpacity={0.7}
						className='w-9 h-9 rounded-full items-center justify-center'
						style={{
							backgroundColor: colors.backgroundSecondary
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

			{/* Description */}
			{(isEditing || group?.description) && (
				<View className='mt-3'>
					<Text
						className='text-xs font-semibold uppercase tracking-wider mb-1'
						style={{ color: colors.textSecondary }}
					>
						{t('description')}
					</Text>
					{isEditing ? (
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

			{/* Avatar actions when editing */}
			{isEditing && canChangeGroupInfo && group?.avatarUrl && (
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

			{/* Save button */}
			{isEditing && hasChanges && (
				<TouchableOpacity
					onPress={handleSave}
					activeOpacity={0.7}
					disabled={isSaving || !editName.trim()}
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
