import Auth from '@/components/screens/auth/Auth'
import ChatSettings from '@/components/screens/chat-settings/ChatSettings'
import Chat from '@/components/screens/chat/Chat'
import ChatsList from '@/components/screens/chats-list/ChatsList'
import DirectMessages from '@/components/screens/direct-messages/DirectMessages'
import GroupSettings from '@/components/screens/group-settings/GroupSettings'
import Home from '@/components/screens/home/Home'
import FriendProfile from '@/components/screens/home/friend/FriendProfile'
import Profile from '@/components/screens/profile/Profile'
import UserSettings from '@/components/screens/profile/settings/UserSettings'

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
	{
		name: 'ChatsList',
		component: ChatsList
	},

	{
		name: 'DirectMessages',
		component: DirectMessages
	},

	{ name: 'Chat', component: Chat },
	{ name: 'ChatSettings', component: ChatSettings },
	{ name: 'GroupSettings', component: GroupSettings },
	{ name: 'FriendProfile', component: FriendProfile },

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
	},
	{
		name: 'UserSettings',
		component: UserSettings
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
