import { LogOut } from 'lucide-react-native'
import React, { FC } from 'react'
import {
	Animated,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import CreateGroupModal from './CreateGroupModal'
import GroupActionSheet from './GroupActionSheet'
import GroupsList from './GroupsList'
import SidebarHeader from './SidebarHeader'
import { SIDEBAR_WIDTH, useGroupsSidebar } from './useGroupsSidebar'

interface GroupsSidebarProps {
	visible: boolean
	onClose: () => void
}

const GroupsSidebar: FC<GroupsSidebarProps> = ({ visible, onClose }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const navigation = useTypedNavigation()

	const {
		slideAnim,
		fadeAnim,
		showModal,
		isCreateOpen,
		setIsCreateOpen,
		longPressGroup,
		setLongPressGroup,
		allGroups,
		isLoadingGroups,
		deleteGroup,
		user,
		exit
	} = useGroupsSidebar(visible, onClose)

	if (!showModal) return null

	return (
		<Modal transparent visible={showModal} animationType='none'>
			<View className='flex-1 flex-row'>
				{/* Sidebar panel */}
				<Animated.View
					style={{
						width: SIDEBAR_WIDTH,
						transform: [{ translateX: slideAnim }],
						backgroundColor: colors.backgroundSecondary,
						borderRightWidth: 1,
						borderRightColor: colors.border
					}}
				>
					<SidebarHeader
						username={user?.username}
						avatarUrl={user?.avatarUrl}
						onClose={onClose}
					/>

					<GroupsList
						groups={allGroups}
						isLoading={isLoadingGroups}
						onCreatePress={() => setIsCreateOpen(true)}
						onLongPress={setLongPressGroup}
						onClose={onClose}
					/>

					{/* Bottom actions */}
					<View
						className='px-5 py-4'
						style={{
							borderTopWidth: 1,
							borderTopColor: colors.border,
							paddingBottom: 32
						}}
					>
						<TouchableOpacity
							onPress={() => {
								onClose()
								exit()
								navigation.navigate('Auth')
							}}
							activeOpacity={0.6}
							className='flex-row items-center py-2'
						>
							<LogOut size={18} color={colors.destructive} />
							<Text
								className='ml-3 text-sm font-medium'
								style={{ color: colors.destructive }}
							>
								{t('logout')}
							</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>

				{/* Backdrop */}
				<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
					<Pressable
						className='flex-1'
						style={{ backgroundColor: colors.overlay }}
						onPress={onClose}
					/>
				</Animated.View>
			</View>

			{/* Long-press group bottom sheet */}
			<GroupActionSheet
				group={longPressGroup}
				onClose={() => setLongPressGroup(null)}
				onDelete={groupId => deleteGroup({ variables: { groupId } })}
			/>

			{/* Create group modal */}
			<CreateGroupModal
				isOpen={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
			/>
		</Modal>
	)
}

export default GroupsSidebar
