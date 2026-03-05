import { ComponentType } from 'react'

export type TypeRootStackParamList = {
	Auth: undefined
	Home: undefined
	DirectMessages: undefined
	Favorites: undefined
	Search: undefined
	Profile: undefined
	Explorer: undefined
	Cart: undefined
	ChatsList: { groupId: string; groupName: string }
	Groups: undefined
	UserSettings: undefined
	Chat: {
		chatId: string
		chatName: string
		isSecret: boolean
		groupId?: string
	}
	ChatSettings: { chatId: string }
	GroupSettings: { groupId: string; groupName: string }
	FriendProfile: {
		friendshipId: string
		username: string
		avatarUrl?: string | null
		friendUserId: string
		friendSince: string
	}
	// Thanks: undefined
	// Category: {
	// 	slug: string
	// }
	// Product: {
	// 	slug: string
	// }
}

export interface IRoute {
	name: keyof TypeRootStackParamList
	component: ComponentType
}
