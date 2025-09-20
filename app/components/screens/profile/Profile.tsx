import { FC } from 'react'
import { View } from 'react-native'

import Layout from '@/components/layout/Layout'
import EntityAvatar from '@/components/ui/EntityAvatar'
import Heading from '@/components/ui/Heading'
import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button/Button'

import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const Profile: FC = () => {
	const { exit } = useAuth()

	const { user, isLoadingProfile, refetch } = useCurrentUser()
	console.log(user, isLoadingProfile)

	return isLoadingProfile || !user ? (
		<Loader />
	) : (
		<Layout>
			<Heading isCenter>Profile</Heading>

			<View className='my-6 items-center justify-center'>
				<EntityAvatar
					name={user.username}
					size='xl'
					avatarUrl={user.avatarUrl}
				/>
			</View>

			<Button onPress={() => exit()} className='mt-5'>
				Logout
			</Button>
		</Layout>
	)
}

export default Profile
