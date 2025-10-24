import { Ionicons } from '@expo/vector-icons'
import { FC } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useAuth } from '@/hooks/useAuth'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

const Header: FC = () => {
	const { navigate } = useTypedNavigation()
	const { exit } = useAuth()

	return (
		<View className='flex-row justify-between items-center'>
			<Text className='font-medium text-2xl text-foreground-dark'>
				Hello, {'jodee'}!
			</Text>

			<Pressable
				onPress={() => {
					exit()
					navigate('Auth')
				}}
			>
				<Text>X</Text>
			</Pressable>

			<Pressable onPress={() => navigate('Cart')}>
				<Ionicons name='cart' size={26} color='#6d7279' />
			</Pressable>
		</View>
	)
}

export default Header
