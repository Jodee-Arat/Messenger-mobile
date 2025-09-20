import { Ionicons } from '@expo/vector-icons'
import { FC } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

const Header: FC = () => {
	const { navigate } = useTypedNavigation()

	return (
		<View className='flex-row justify-between items-center'>
			<Text className='font-medium text-2xl text-foreground-dark'>
				Hello, {'jodee'}!
			</Text>

			<Pressable onPress={() => navigate('Cart')}>
				<Ionicons name='cart' size={26} color='#6d7279' />
			</Pressable>
		</View>
	)
}

export default Header
