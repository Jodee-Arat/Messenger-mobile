import { QueryHookOptions } from '@apollo/client'
import { useCallback, useMemo } from 'react'

import {
	GetBlockedUsersQuery,
	GetBlockedUsersQueryVariables,
	useGetBlockedUsersQuery
} from '@/graphql/generated/output'

export const DIRECT_CONTACT_BLOCKED_BACKEND_MESSAGE =
	'Direct contact is unavailable because one of the users has blocked the other'
export const CHAT_MEMBERSHIP_REVOKED_BACKEND_MESSAGE =
	'Chat not found or user is not a member'
export const GROUP_MEMBERSHIP_REVOKED_BACKEND_MESSAGE =
	'Group not found or user is not a member'
export const UNAUTHORIZED_BACKEND_MESSAGES = [
	'Unauthorized',
	'User is not authorized',
	'Пользователь не авторизован'
]

type UseBlockedUsersOptions = Omit<
	QueryHookOptions<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>,
	'variables'
>

export const getGraphQLErrorMessage = (error: unknown): string => {
	if (!error) return ''
	if (typeof error === 'string') return error

	if (error instanceof Error) {
		return error.message
	}

	const candidate = error as {
		message?: unknown
		graphQLErrors?: Array<{ message?: unknown }>
		networkError?: {
			result?: {
				errors?: Array<{ message?: unknown }>
			}
		}
	}

	if (typeof candidate.message === 'string') {
		return candidate.message
	}

	const graphQlMessage = candidate.graphQLErrors?.find(
		item => typeof item?.message === 'string'
	)?.message
	if (typeof graphQlMessage === 'string') {
		return graphQlMessage
	}

	const networkMessage = candidate.networkError?.result?.errors?.find(
		item => typeof item?.message === 'string'
	)?.message
	if (typeof networkMessage === 'string') {
		return networkMessage
	}

	return ''
}

export const isDirectContactBlockedError = (error: unknown) =>
	getGraphQLErrorMessage(error).includes(
		DIRECT_CONTACT_BLOCKED_BACKEND_MESSAGE
	)

export const isChatMembershipRevokedError = (error: unknown) =>
	getGraphQLErrorMessage(error).includes(
		CHAT_MEMBERSHIP_REVOKED_BACKEND_MESSAGE
	)

export const isGroupMembershipRevokedError = (error: unknown) =>
	getGraphQLErrorMessage(error).includes(
		GROUP_MEMBERSHIP_REVOKED_BACKEND_MESSAGE
	)

export const isUnauthorizedError = (error: unknown) => {
	const message = getGraphQLErrorMessage(error)
	return UNAUTHORIZED_BACKEND_MESSAGES.some(item => message.includes(item))
}

export const useBlockedUsers = (options?: UseBlockedUsersOptions) => {
	const query = useGetBlockedUsersQuery({
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		...options
	})

	const blockedUsers = query.data?.getBlockedUsers ?? []

	const blockedUserIds = useMemo(
		() => new Set(blockedUsers.map(item => item.friendId)),
		[blockedUsers]
	)

	const isBlockedByMe = useCallback(
		(userId?: string | null) => !!userId && blockedUserIds.has(userId),
		[blockedUserIds]
	)

	const getBlockedFriendship = useCallback(
		(userId?: string | null) =>
			blockedUsers.find(item => item.friendId === userId),
		[blockedUsers]
	)

	return {
		...query,
		blockedUsers,
		blockedUserIds,
		isBlockedByMe,
		getBlockedFriendship
	}
}
