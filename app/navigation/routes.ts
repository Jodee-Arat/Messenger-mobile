import Auth from '@/components/screens/auth/Auth'
import Home from '@/components/screens/home/Home'
import Profile from '@/components/screens/profile/Profile'

import { IRoute } from './navigation.types'

export const routes: IRoute[] = [
	{
		name: 'Auth',
		component: Auth
	},
	{
		name: 'Home',
		component: Home
	},
	// {
	// 	name: 'Favorites',
	// 	component: Favorites
	// },
	// {
	// 	name: 'Search',
	// 	component: Search
	// },
	// {
	// 	name: 'Explorer',
	// 	component: Explorer
	// },
	{
		name: 'Profile',
		component: Profile
	}
	// {
	// 	name: 'Cart',
	// 	component: Cart
	// },
	// {
	// 	name: 'Category',
	// 	component: Category
	// },
	// {
	// 	name: 'Product',
	// 	component: Product
	// },
	// {
	// 	name: 'Thanks',
	// 	component: Thanks
	// }
]
