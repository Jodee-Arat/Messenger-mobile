import React from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { FindAllGroupsByUserQuery } from '@/graphql/generated/output'

interface GroupsItemProps {
	group: FindAllGroupsByUserQuery['findAllGroupsByUser'][0]
	onLongPress?: () => void
}

const GroupsItem: React.FC<GroupsItemProps> = ({ group, onLongPress }) => {
	const navigation = useTypedNavigation()
	const handlePress = () => {
		navigation.navigate('ChatsList', {
			groupId: group.id,
			groupName: group.groupName
		})
	}
	return (
		<Pressable
			onPress={handlePress}
			onLongPress={onLongPress}
			delayLongPress={500}
			className='w-full h-12 my-1.5 px-3 flex-row items-center rounded-sm shadow bg-foreground-dark'
		>
			<EntityAvatar
				name={group.groupName}
				avatarUrl={group.avatarUrl}
				size='default'
			/>
			<Text className='ml-3 text-lg font-medium text-black'>
				{group.groupName}
			</Text>
		</Pressable>
	)
}

export default GroupsItem
