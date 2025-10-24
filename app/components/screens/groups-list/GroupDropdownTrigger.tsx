import React, { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { Button } from '@/components/ui/button/Button'

import GroupsItem from './GroupsItem'
import { FindAllGroupsByUserQuery } from '@/graphql/generated/output'

interface GroupDropdownTriggerProps {
	group: FindAllGroupsByUserQuery['findAllGroupsByUser'][0]
	deleteGroup: (groupId: string) => void
}

const GroupDropdownTrigger: React.FC<GroupDropdownTriggerProps> = ({
	group,
	deleteGroup
}) => {
	const [modalVisible, setModalVisible] = useState(false)

	const handleLongPress = () => setModalVisible(true)
	const handleDelete = () => {
		deleteGroup(group.id)
		setModalVisible(false)
	}

	return (
		<View>
			<GroupsItem group={group} onLongPress={handleLongPress} />

			<Modal
				transparent
				visible={modalVisible}
				animationType='fade'
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable
					className='flex-1 bg-black/30 justify-center items-center'
					onPress={() => setModalVisible(false)}
				>
					<View className='w-64 bg-white rounded-xl p-4 shadow-lg'>
						<Text className='text-lg font-bold mb-3'>
							{group.groupName}
						</Text>

						<Button
							variant='destructive'
							size='default'
							onPress={handleDelete}
							className='mb-2'
						>
							Удалить группу
						</Button>

						<Button
							variant='default'
							size='default'
							onPress={() => setModalVisible(false)}
						>
							Отмена
						</Button>
					</View>
				</Pressable>
			</Modal>
		</View>
	)
}

export default GroupDropdownTrigger
