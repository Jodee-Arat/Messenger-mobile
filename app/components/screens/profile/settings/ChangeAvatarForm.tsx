import * as ImagePicker from 'expo-image-picker'
import { styled } from 'nativewind'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'
import Heading from '@/components/ui/Heading'
import { Button } from '@/components/ui/button/Button'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import {
	useChangeProfileAvatarMutation,
	useRemoveProfileAvatarMutation
} from '@/graphql/generated/output'

const StyledView = styled(View)
const StyledText = styled(Text)

const ChangeAvatarForm = () => {
	const { user, isLoadingProfile, refetch } = useCurrentUser()
	const [isPicking, setIsPicking] = useState(false)

	const [update, { loading: isUpdating }] = useChangeProfileAvatarMutation({
		onCompleted() {
			refetch()
			Alert.alert('Success', 'Avatar updated successfully')
		},
		onError() {
			Alert.alert('Error', 'Error updating avatar')
		}
	})

	const [remove, { loading: isRemoving }] = useRemoveProfileAvatarMutation({
		onCompleted() {
			refetch()
			Alert.alert('Success', 'Avatar removed successfully')
		},
		onError() {
			Alert.alert('Error', 'Error removing avatar')
		}
	})

	const pickImage = async () => {
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
					name: 'avatar.jpg'
				} as any

				await update({ variables: { avatar: file } })
			}
		} finally {
			setIsPicking(false)
		}
	}

	const handleRemove = () => {
		Alert.alert(
			'Remove Avatar',
			'Are you sure you want to remove your avatar?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					style: 'destructive',
					onPress: () => remove()
				}
			]
		)
	}

	if (isLoadingProfile) {
		return (
			<StyledView className='h-52 w-full items-center justify-center'>
				<ActivityIndicator size='large' />
			</StyledView>
		)
	}

	return (
		<StyledView className='px-5 pb-5'>
			<Heading>Change avatar</Heading>

			<StyledView className='mt-4 flex-row items-center space-x-6'>
				<EntityAvatar avatarUrl={user?.avatarUrl} size={'xl'} />

				<StyledView className='flex-1 space-y-3'>
					<StyledView className='flex-row items-center gap-x-3'>
						<Button
							onPress={pickImage}
							className='bg-blue-500'
							disabled={isPicking || isUpdating || isRemoving}
						>
							<StyledText className='text-white'>
								{user?.avatarUrl
									? 'Change Avatar'
									: 'Upload Avatar'}
							</StyledText>
						</Button>

						{user?.avatarUrl && (
							<TouchableOpacity
								onPress={handleRemove}
								disabled={isRemoving || isUpdating}
								className='p-2'
							>
								<StyledText className='text-red-500'>
									🗑 Remove
								</StyledText>
							</TouchableOpacity>
						)}
					</StyledView>

					<StyledText className='text-gray-500 text-sm'>
						{user?.avatarUrl
							? 'Click to change your avatar'
							: 'Upload a new avatar for your profile'}
					</StyledText>
				</StyledView>
			</StyledView>
		</StyledView>
	)
}

export default ChangeAvatarForm
