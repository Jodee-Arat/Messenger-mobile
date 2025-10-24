import { Dispatch, SetStateAction } from 'react'

import { FindAllUsersQuery } from '@/graphql/generated/output'

export type TypeUserState = FindAllUsersQuery['findAllUsers'][0]['id'] | ''

export interface IContext {
	userId: TypeUserState
	setUserId: (userId: string) => void
}
