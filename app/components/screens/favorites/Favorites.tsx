import { CommonActions } from '@react-navigation/native'
import { FC, useState } from 'react'
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

import { exampleAliceBobX3DH } from '@/libs/e2ee/gost'

const Favorites: FC = () => {
	const navigation = useTypedNavigation()
	const { user, isLoadingProfile } = useCurrentUser()
	const [running, setRunning] = useState(false)

	const handleEditProfile = () => {
		// navigation.navigate('EditProfile');
	}

	const handleRunE2EE = async () => {
		try {
			setRunning(true)
			const res = await exampleAliceBobX3DH()
			console.log('[X3DH GOST] verifiedSpk:', res.verifiedSpk)
			console.log('[X3DH GOST] sharedMatches:', res.sharedMatches)
			console.log('[X3DH GOST] sigOk:', res.sigOk)
			console.log('[X3DH GOST] ivHex:', res.ivHex)
			console.log(
				'[X3DH GOST] ctHex(first48):',
				res.ctHex.slice(0, 48),
				'len=',
				res.ctHex.length
			)
			console.log('[X3DH GOST] decrypted:', res.decrypted)
		} catch (e: any) {
			console.error('[X3DH GOST] Ошибка:', e?.message ?? String(e))
		} finally {
			setRunning(false)
		}
	}

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
				<Button onPress={handleRunE2EE} className='mb-4 bg-green-600'>
					<Text className='text-white'>
						{running ? 'Запуск…' : 'Проверить X3DH (ГОСТ)'}
					</Text>
				</Button>

				<Button
					onPress={async () => await handleLogout()}
					className='bg-red-500'
				>
					<Text className='text-white'>Выйти</Text>
				</Button>
			</View>
		</Layout>
	)
}

export default Favorites
