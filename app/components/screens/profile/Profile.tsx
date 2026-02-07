import { CommonActions } from '@react-navigation/native'
import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'

import Layout from '@/components/layout/Layout'
import EntityAvatar from '@/components/ui/EntityAvatar'
import Heading from '@/components/ui/Heading'
import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button/Button'

import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { handleLogout } from '@/services/auth/auth.service'

import { useLogoutUserMutation } from '@/graphql/generated/output'

const Profile: FC = () => {
	// const { exit } = useAuth()
	const navigation = useTypedNavigation()
	const { user, isLoadingProfile } = useCurrentUser()

	const handleEditProfile = () => {
		navigation.navigate('UserSettings')
	}
	const [logoutUser, { loading: isLoggingOut }] = useLogoutUserMutation({
		onCompleted: async () => {
			await handleLogout()
		},
		onError: error => {
			console.error('Logout error:', error)
		}
	})

	if (isLoadingProfile || !user) {
		return <Loader />
	}

	return (
		<Layout>
			<View className='items-center justify-center my-6'>
				<EntityAvatar
					name={user.username}
					size='xl'
					avatarUrl={user.avatarUrl}
				/>
				<Heading>{user.username}</Heading>
				{user.bio && (
					<Text className='mt-2 text-center text-base text-foreground-dark'>
						{user.bio}
					</Text>
				)}
			</View>

			<View className='mt-5 w-full'>
				<Button
					onPress={handleEditProfile}
					className='mb-4 bg-blue-500'
				>
					<Text className='text-white'>Редактировать профиль</Text>
				</Button>
				<Button onPress={logoutUser} className='bg-red-500'>
					<Text className='text-white'>Выйти</Text>
				</Button>
			</View>
		</Layout>
	)
}

export default Profile
