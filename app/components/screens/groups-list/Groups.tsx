import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import Loader from '@/components/ui/Loader'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import CreateGroupModal from './CreateGroupModal'
import GroupDropdownTrigger from './GroupDropdownTrigger'
import {
	FindAllGroupsByUserQuery,
	useDeleteGroupMutation,
	useFindAllGroupsByUserQuery,
	useGroupAddedSubscription,
	useGroupDeletedSubscription
} from '@/graphql/generated/output'

const Groups = () => {
	const [allGroups, setAllGroups] = useState<
		FindAllGroupsByUserQuery['findAllGroupsByUser']
	>([])

	const { user } = useCurrentUser()

	const { data: allGroupsData, loading: isLoadingFindAllGroups } =
		useFindAllGroupsByUserQuery({
			variables: { filters: {} },
			skip: !user?.id,
			fetchPolicy: 'network-only'
		})

	const { data: newGroupData } = useGroupAddedSubscription({
		variables: { userId: user?.id ?? '' },
		skip: !user?.id
	})

	const [deleteGroup, { loading: isLoadingDeleteGroup }] =
		useDeleteGroupMutation({
			onCompleted() {
				Toast.show({
					type: 'success',
					text1: 'Group deleted successfully.'
				})
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: 'Error deleting group.',
					text2: error.message || 'Something went wrong'
				})
			}
		})

	const { data: deleteGroupData } = useGroupDeletedSubscription({
		variables: { userId: user?.id ?? '' }
	})

	const handleDeleteGroup = (groupId: string) => {
		deleteGroup({ variables: { groupId } })
	}

	useEffect(() => {
		if (allGroupsData?.findAllGroupsByUser) {
			setAllGroups(allGroupsData.findAllGroupsByUser)
		}
	}, [allGroupsData])

	useEffect(() => {
		if (newGroupData?.groupAdded) {
			setAllGroups(prev => [newGroupData.groupAdded, ...prev])
		}
	}, [newGroupData])

	useEffect(() => {
		if (deleteGroupData?.groupDeleted) {
			setAllGroups(prev =>
				prev.filter(
					group => group.id !== deleteGroupData.groupDeleted.id
				)
			)
		}
	}, [deleteGroupData])

	if (isLoadingFindAllGroups) {
		return <Loader />
	}

	return (
		<View className='flex py-2'>
			<Text className='text-center text-3xl text-foreground-dark mt-10'>
				Groups
			</Text>
			<ScrollView
				contentContainerStyle={{ paddingVertical: 20 }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
				nestedScrollEnabled={true} // иногда помогает на Android
			>
				{allGroups.map((group, index) => (
					<GroupDropdownTrigger
						key={group.id ?? index}
						group={group}
						deleteGroup={handleDeleteGroup}
					/>
				))}
				{!isLoadingFindAllGroups && <CreateGroupModal />}
			</ScrollView>
		</View>
	)
}

export default Groups
