import { ComponentType } from 'react'

export type TypeRootStackParamList = {
	Auth: undefined
	Home: undefined
	Favorites: undefined
	Search: undefined
	Profile: undefined
	Explorer: undefined
	Cart: undefined
	ChatsList: { groupId: string; groupName: string }
	Groups: undefined
	UserSettings: undefined
	Chat: { chatId: string; chatName: string }
	ChatSettings: { chatId: string }
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
