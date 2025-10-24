import { TypeFeatherIconNames } from '@/types/interface/icon.interface'

import { TypeRootStackParamList } from '@/navigation/navigation.types'

export interface IMenuItem {
	iconName: TypeFeatherIconNames
	path: keyof TypeRootStackParamList
}

export type TypeNavigate = (screenName: keyof TypeRootStackParamList) => void
