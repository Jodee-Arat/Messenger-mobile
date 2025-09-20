'use client'

import { useFindGroupByGroupIdQuery } from '../graphql/generated/output'

export function useCurrentGroup(groupId: string) {
	const { data, loading, refetch, error } = useFindGroupByGroupIdQuery({
		variables: {
			groupId
		}
	})

	return {
		group: data?.findGroupByGroupId,
		isLoadingGroup: loading,
		refetch
	}
}
