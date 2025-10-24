import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import Layout from '@/components/layout/Layout'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import Header from './Header'

type MenuItem = {
	id: string
	name: string
	onPress: () => void
}

const Home: FC = () => {
	const navigation = useTypedNavigation()

	const menuItems: MenuItem[] = [
		{
			id: '1',
			name: 'Groups',
			onPress: () => navigation.navigate('Groups')
		},
		{
			id: '2',
			name: 'Favourites',
			onPress: () => navigation.navigate('Favorites')
		},
		{
			id: '3',
			name: 'Profile',
			onPress: () => navigation.navigate('Profile')
		},
		{
			id: '4',
			name: 'Search',
			onPress: () => navigation.navigate('Search')
		},
		{
			id: '5',
			name: 'Exit',
			onPress: () => console.log('Выход из приложения')
		}
	]

	return (
		<Layout className='flex-1 bg-gray-100 p-4'>
			<Header />
			<Text className='text-xl font-bold mb-6'>Главное меню</Text>

			<View className='flex-row flex-wrap justify-center'>
				{menuItems.map(item => (
					<TouchableOpacity
						key={item.id}
						onPress={item.onPress}
						className='w-32 h-32 m-2 bg-white rounded-lg justify-center items-center shadow'
					>
						<Text className='text-center font-semibold text-lg'>
							{item.name}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</Layout>
	)
}

export default Home
