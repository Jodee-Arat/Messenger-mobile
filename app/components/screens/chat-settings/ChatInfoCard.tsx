import * as ImagePicker from 'expo-image-picker'
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

import { createImageUploadFile } from '@/utils/create-image-upload-file'

import { FindChatByChatIdQuery } from '@/graphql/generated/output'

interface ChatInfoCardProps {
	chat?: FindChatByChatIdQuery['findChatByChatId']
	isLoading: boolean
	membersCount: number
	canChangeChatInfo?: boolean
	canChangeChatAvatar?: boolean
	onSaveInfo?: (
		chatName: string,
		description: string
	) => Promise<boolean> | boolean
	onChangeAvatar?: (file: ReactNativeFile) => Promise<void> | void
	onRemoveAvatar?: () => Promise<void> | void
	isSaving?: boolean
}

const ChatInfoCard: FC<ChatInfoCardProps> = ({
	chat,
	isLoading,
	membersCount,
	canChangeChatInfo = false,
	canChangeChatAvatar = false,
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
	const [isPickingAvatar, setIsPickingAvatar] = useState(false)

	useEffect(() => {
		if (chat) {
			setEditName(chat.chatName || '')
			setEditDescription(chat.description || '')
		}
	}, [chat])

	const hasChanges =
		editName !== (chat?.chatName || '') ||
		editDescription !== (chat?.description || '')

	const handleSave = async () => {
		if (!editName.trim() || isSaving) return
		const isSaved = await onSaveInfo?.(
			editName.trim(),
			editDescription.trim()
		)
		if (isSaved !== false) {
			setIsEditing(false)
		}
	}

	const handlePickAvatar = async () => {
		setIsPickingAvatar(true)
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8
			})

			if (result.canceled || !result.assets?.[0]) return

			const file = createImageUploadFile(result.assets[0], 'avatar.jpg')
			await onChangeAvatar?.(file)
		} finally {
			setIsPickingAvatar(false)
		}
	}

	const handleRemoveAvatar = () => {
		Alert.alert(
			t('removeAvatar') || 'Удалить аватар',
			t('removeAvatarConfirm') || 'Вы уверены?',
			[
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('remove') || 'Удалить',
					style: 'destructive',
					onPress: () => onRemoveAvatar?.()
				}
			]
		)
	}

	if (isLoading) {
		return (
			<View
				className='mx-4 mt-4 px-4 py-4 rounded-2xl items-center justify-center'
				style={{ backgroundColor: colors.backgroundSecondary }}
			>
				<Loader2 className='animate-spin' color={colors.accent} />
			</View>
		)
	}

	const chatName = chat?.chatName ?? t('chatFallback')

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
				style={{ backgroundColor: colors.accent }}
				className='flex-row items-center rounded-2xl p-1.5'
			>
				<TouchableOpacity
					className='w-14 h-14 rounded-2xl items-center justify-center mr-4'
					onPress={canChangeChatAvatar ? handlePickAvatar : undefined}
					activeOpacity={canChangeChatAvatar ? 0.7 : 1}
					disabled={isPickingAvatar || isSaving}
				>
					{isPickingAvatar ? (
						<ActivityIndicator size='small' color={colors.text} />
					) : (
						<>
							<EntityAvatar
								avatarUrl={chat?.avatarUrl}
								name={chatName}
								size={'lg'}
							/>
							{canChangeChatAvatar && (
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
							className='text-lg font-bold'
							style={{
								color: colors.text,
								padding: 0
							}}
							placeholder={
								t('chatNamePlaceholder') || 'Название чата'
							}
							placeholderTextColor={colors.textMuted}
						/>
					) : (
						<>
							<Text
								className='text-lg font-bold'
								style={{ color: colors.text }}
								numberOfLines={1}
							>
								{chatName}
							</Text>
							<View className='flex-row items-center mt-0.5'>
								{chat?.isSecret && (
									<View
										className='px-2 py-0.5 rounded mr-2'
										style={{
											backgroundColor: colors.successMuted
										}}
									>
										<Text
											className='text-[10px] font-semibold'
											style={{ color: colors.success }}
										>
											{t('secretLabel')}
										</Text>
									</View>
								)}
								<Text
									className='text-xs'
									style={{ color: colors.text }}
								>
									{membersCount} {t('participantsCount')}
								</Text>
							</View>
						</>
					)}
				</View>
				{canChangeChatInfo && (
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

			{/* Description */}
			{(isEditing || chat?.description) && (
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
							placeholder={
								t('descriptionPlaceholder') || 'Описание'
							}
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
							{chat?.description}
						</Text>
					)}
				</View>
			)}

			{/* Avatar actions when editing */}
			{isEditing && canChangeChatAvatar && chat?.avatarUrl && (
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
						{t('removeAvatar') || 'Удалить аватар'}
					</Text>
				</TouchableOpacity>
			)}

			{/* Save button */}
			{isEditing && hasChanges && (
				<TouchableOpacity
					onPress={() => void handleSave()}
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

export default ChatInfoCard
