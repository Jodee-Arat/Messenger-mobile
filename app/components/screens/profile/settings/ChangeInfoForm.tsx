import { zodResolver } from '@hookform/resolvers/zod'
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

import { useChangeProfileInfoMutation } from '@/graphql/generated/output'
import {
	ChangeInfoProfileSchema,
	TypeChangeInfoProfileSchema
} from '@/schemas/user/change-info-profile.schema'

const ChangeInfoForm = () => {
	const { user, isLoadingProfile, refetch } = useCurrentUser()

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
					text1: 'Profile updated',
					text2: 'Your profile information was updated successfully'
				})
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: 'Update failed',
					text2: error.message || 'Something went wrong'
				})
			}
		})

	const onSubmit = (data: TypeChangeInfoProfileSchema) => {
		update({ variables: { data } })
	}

	if (isLoadingProfile) {
		return (
			<View className='h-96 w-full bg-gray-200 rounded-xl animate-pulse' />
		)
	}

	return (
		<View className='p-5 bg-white rounded-2xl shadow'>
			<Text className='text-lg font-bold mb-4'>
				Change Profile Information
			</Text>

			{/* Username */}
			<View className='mb-4'>
				<Text className='text-sm font-medium text-gray-700 mb-1'>
					Username
				</Text>
				<Controller
					control={control}
					name='username'
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							className='border border-gray-300 rounded-lg px-3 py-2 text-base'
							placeholder='Enter your username'
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							editable={!isLoadingInfoUpdate}
						/>
					)}
				/>
				<Text className='text-xs text-gray-500 mt-1'>
					Enter a unique username
				</Text>
			</View>

			{/* Bio */}
			<View className='mb-4'>
				<Text className='text-sm font-medium text-gray-700 mb-1'>
					Bio
				</Text>
				<Controller
					control={control}
					name='bio'
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							className='border border-gray-300 rounded-lg px-3 py- h-24'
							placeholder='Enter your bio'
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							multiline
							editable={!isLoadingInfoUpdate}
						/>
					)}
				/>
				<Text className='text-xs text-gray-500 mt-1'>
					Enter a brief bio
				</Text>
			</View>

			{/* Submit */}
			<View className='flex items-end'>
				<TouchableOpacity
					className={`px-5 py-2 rounded-lg ${
						!formState.isValid ||
						!formState.isDirty ||
						isLoadingInfoUpdate
							? 'bg-gray-300'
							: 'bg-blue-500'
					}`}
					onPress={handleSubmit(onSubmit)}
					disabled={
						!formState.isValid ||
						!formState.isDirty ||
						isLoadingInfoUpdate
					}
				>
					{isLoadingInfoUpdate ? (
						<ActivityIndicator color='#fff' />
					) : (
						<Text className='text-white font-semibold'>Submit</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default ChangeInfoForm
