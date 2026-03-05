import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { useChangeProfileInfoMutation } from '@/graphql/generated/output'
import {
	ChangeInfoProfileSchema,
	TypeChangeInfoProfileSchema
} from '@/schemas/user/change-info-profile.schema'

const ChangeInfoForm = () => {
	const { user, isLoadingProfile, refetch } = useCurrentUser()
	const { colors } = useTheme()
	const { t } = useTranslation()

	const { control, handleSubmit, formState, reset } =
		useForm<TypeChangeInfoProfileSchema>({
			resolver: zodResolver(ChangeInfoProfileSchema),
			defaultValues: {
				username: '',
				bio: ''
			}
		})

	useEffect(() => {
		if (user) {
			reset({
				username: user.username ?? '',
				bio: user.bio ?? ''
			})
		}
	}, [user, reset])

	const [update, { loading: isLoadingInfoUpdate }] =
		useChangeProfileInfoMutation({
			onCompleted() {
				refetch()
				Toast.show({
					type: 'success',
					text1: t('profileUpdated'),
					text2: t('profileUpdateSuccess')
				})
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: t('updateFailed'),
					text2: error.message
				})
			}
		})

	const onSubmit = (data: TypeChangeInfoProfileSchema) => {
		update({ variables: { data } })
	}

	if (isLoadingProfile) {
		return (
			<View
				style={{
					height: 200,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	const canSubmit =
		formState.isValid && formState.isDirty && !isLoadingInfoUpdate

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
					marginBottom: 20
				}}
			>
				{t('personalInfo')}
			</Text>

			{/* Username */}
			<View style={{ marginBottom: 18 }}>
				<Text
					style={{
						fontSize: 13,
						fontWeight: '600',
						color: colors.textSecondary,
						marginBottom: 8
					}}
				>
					{t('username')}
				</Text>
				<Controller
					control={control}
					name='username'
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={{
								backgroundColor: colors.inputBg,
								borderRadius: 12,
								paddingHorizontal: 16,
								paddingVertical: 12,
								color: colors.text,
								fontSize: 15,
								borderWidth: 1,
								borderColor: colors.border
							}}
							placeholder={t('usernamePlaceholder')}
							placeholderTextColor={colors.textMuted}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							editable={!isLoadingInfoUpdate}
						/>
					)}
				/>
			</View>

			{/* Bio */}
			<View style={{ marginBottom: 20 }}>
				<Text
					style={{
						fontSize: 13,
						fontWeight: '600',
						color: colors.textSecondary,
						marginBottom: 8
					}}
				>
					{t('bio')}
				</Text>
				<Controller
					control={control}
					name='bio'
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={{
								backgroundColor: colors.inputBg,
								borderRadius: 12,
								paddingHorizontal: 16,
								paddingVertical: 12,
								color: colors.text,
								fontSize: 15,
								borderWidth: 1,
								borderColor: colors.border,
								height: 90,
								textAlignVertical: 'top'
							}}
							placeholder={t('bioPlaceholder')}
							placeholderTextColor={colors.textMuted}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							multiline
							editable={!isLoadingInfoUpdate}
						/>
					)}
				/>
			</View>

			{/* Submit */}
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={handleSubmit(onSubmit)}
				disabled={!canSubmit}
				style={{
					backgroundColor: canSubmit
						? colors.accent
						: colors.backgroundTertiary,
					borderRadius: 12,
					paddingVertical: 14,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: canSubmit ? 1 : 0.5
				}}
			>
				{isLoadingInfoUpdate ? (
					<ActivityIndicator color='#fff' />
				) : (
					<>
						<Save
							size={16}
							color='#fff'
							style={{ marginRight: 8 }}
						/>
						<Text
							style={{
								color: '#fff',
								fontSize: 14,
								fontWeight: '600'
							}}
						>
							{t('save')}
						</Text>
					</>
				)}
			</TouchableOpacity>
		</View>
	)
}

export default ChangeInfoForm
