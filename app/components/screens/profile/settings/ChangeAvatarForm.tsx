import { Trash2, Upload } from 'lucide-react-native'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { pickAvatarImage } from '@/utils/avatar-image-picker'
import { createImageUploadFile } from '@/utils/create-image-upload-file'
import { getMediaSource } from '@/utils/get-media-source'

import {
	useChangeProfileAvatarMutation,
	useRemoveProfileAvatarMutation
} from '@/graphql/generated/output'

const ChangeAvatarForm = () => {
	const { user, isLoadingProfile, refetch } = useCurrentUser()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [isPicking, setIsPicking] = useState(false)

	const [update, { loading: isUpdating }] = useChangeProfileAvatarMutation()

	const [remove, { loading: isRemoving }] = useRemoveProfileAvatarMutation()

	const pickImage = async () => {
		setIsPicking(true)
		try {
			const result = await pickAvatarImage()

			if (result.canceled || !result.assets?.[0]) return

			const file = createImageUploadFile(result.assets[0], 'avatar.jpg')

			await update({ variables: { avatar: file } })
			await refetch()
		} catch {
			Alert.alert(t('error'), t('errorUpdatingAvatar'))
		} finally {
			setIsPicking(false)
		}
	}

	const handleConfirmRemove = async () => {
		try {
			await remove()
			await refetch()
		} catch {
			Alert.alert(t('error'), t('errorRemovingAvatar'))
		}
	}

	const handleRemove = () => {
		Alert.alert(t('removeAvatar'), t('removeAvatarConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('remove'),
				style: 'destructive',
				onPress: () => void handleConfirmRemove()
			}
		])
	}

	const busy = isPicking || isUpdating || isRemoving
	const firstLetter = user?.username?.[0]?.toUpperCase() ?? '?'

	if (isLoadingProfile) {
		return (
			<View
				style={{
					height: 120,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	return (
		<View
			style={{
				marginHorizontal: 16,
				backgroundColor: colors.card,
				borderRadius: 16,
				borderWidth: 1,
				borderColor: colors.border,
				padding: 20
			}}
		>
			<Text
				style={{
					fontSize: 11,
					fontWeight: '700',
					letterSpacing: 1,
					textTransform: 'uppercase',
					color: colors.textSecondary,
					marginBottom: 16
				}}
			>
				{t('changeAvatar')}
			</Text>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center'
				}}
			>
				{/* Avatar preview */}
				<View
					style={{
						width: 76,
						height: 76,
						borderRadius: 38,
						borderWidth: 2,
						borderColor: colors.accent,
						padding: 2,
						marginRight: 18
					}}
				>
					<View
						style={{
							width: '100%',
							height: '100%',
							borderRadius: 36,
							overflow: 'hidden',
							backgroundColor: colors.backgroundTertiary,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{user?.avatarUrl ? (
							<Image
								source={{
									uri: getMediaSource(user.avatarUrl)
								}}
								resizeMode='cover'
								style={{ width: '100%', height: '100%' }}
							/>
						) : (
							<Text
								style={{
									fontSize: 28,
									fontWeight: '700',
									color: colors.accent
								}}
							>
								{firstLetter}
							</Text>
						)}
					</View>
				</View>

				{/* Actions */}
				<View style={{ flex: 1, gap: 8 }}>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={pickImage}
						disabled={busy}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: colors.accent,
							borderRadius: 10,
							paddingVertical: 10,
							paddingHorizontal: 14,
							opacity: busy ? 0.5 : 1
						}}
					>
						{isUpdating || isPicking ? (
							<ActivityIndicator size='small' color='#fff' />
						) : (
							<>
								<Upload
									size={16}
									color='#fff'
									style={{ marginRight: 8 }}
								/>
								<Text
									style={{
										color: '#fff',
										fontSize: 13,
										fontWeight: '600'
									}}
								>
									{user?.avatarUrl
										? t('changeAvatar')
										: t('uploadAvatar')}
								</Text>
							</>
						)}
					</TouchableOpacity>

					{user?.avatarUrl && (
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={handleRemove}
							disabled={busy}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: 'hsla(0, 80%, 50%, 0.1)',
								borderRadius: 10,
								paddingVertical: 10,
								paddingHorizontal: 14,
								opacity: busy ? 0.5 : 1
							}}
						>
							{isRemoving ? (
								<ActivityIndicator
									size='small'
									color={colors.destructive}
								/>
							) : (
								<>
									<Trash2
										size={16}
										color={colors.destructive}
										style={{ marginRight: 8 }}
									/>
									<Text
										style={{
											color: colors.destructive,
											fontSize: 13,
											fontWeight: '600'
										}}
									>
										{t('removeAvatar')}
									</Text>
								</>
							)}
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	)
}

export default ChangeAvatarForm
