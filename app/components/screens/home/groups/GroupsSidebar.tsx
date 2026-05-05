import { LogOut, Search, X } from 'lucide-react-native'
import React, { FC, useEffect, useState } from 'react'
import {
	Animated,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppModal from '@/components/ui/AppModal'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import CreateGroupModal from './CreateGroupModal'
import GroupActionSheet from './GroupActionSheet'
import GroupsList from './GroupsList'
import SidebarHeader from './SidebarHeader'
import { SIDEBAR_WIDTH, useGroupsSidebar } from './useGroupsSidebar'

interface GroupsSidebarProps {
	visible: boolean
	onClose: () => void
}

const SEARCH_DEBOUNCE_MS = 500

const GroupsSidebar: FC<GroupsSidebarProps> = ({ visible, onClose }) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { bottom } = useSafeAreaInsets()
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery)
		}, SEARCH_DEBOUNCE_MS)
		return () => clearTimeout(timer)
	}, [searchQuery])

	// Reset search when sidebar closes
	useEffect(() => {
		if (!visible) {
			setSearchQuery('')
			setDebouncedSearch('')
		}
	}, [visible])

	const {
		slideAnim,
		backdropOpacity,
		showModal,
		isCreateOpen,
		setIsCreateOpen,
		longPressGroup,
		setLongPressGroup,
		allGroups,
		isLoadingGroups,
		isRefreshingGroups,
		handleRefreshGroups,
		deleteGroup,
		user,
		exit
	} = useGroupsSidebar(visible, onClose, debouncedSearch)

	if (!showModal) return null

	return (
		<AppModal
			transparent
			visible={showModal}
			animationType='none'
			statusBarTranslucent
			navigationBarTranslucent
		>
			<View className='flex-1'>
				{/* Backdrop */}
				<Animated.View
					style={{
						...StyleSheet.absoluteFillObject,
						backgroundColor: colors.overlay,
						opacity: backdropOpacity
					}}
				>
					<Pressable className='flex-1' onPress={onClose} />
				</Animated.View>

				{/* Sidebar panel */}
				<Animated.View
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
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

					{/* Search bar */}
					<View
						className='px-4 py-2'
						style={{
							borderBottomWidth: 1,
							borderBottomColor: colors.border
						}}
					>
						<View
							className='h-9 rounded-xl flex-row items-center px-3'
							style={{
								backgroundColor: colors.backgroundTertiary,
								borderWidth: 1,
								borderColor: colors.border
							}}
						>
							<Search
								size={15}
								color={colors.textSecondary}
								style={{ marginRight: 8 }}
							/>
							<TextInput
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholder={t('searchGroupsPlaceholder')}
								placeholderTextColor={colors.textMuted}
								style={{
									flex: 1,
									color: colors.text,
									fontSize: 14,
									paddingVertical: 0
								}}
							/>
							{searchQuery.length > 0 && (
								<TouchableOpacity
									onPress={() => {
										setSearchQuery('')
										setDebouncedSearch('')
									}}
									activeOpacity={0.6}
								>
									<X size={16} color={colors.textSecondary} />
								</TouchableOpacity>
							)}
						</View>
					</View>

					<GroupsList
						groups={allGroups}
						isLoading={isLoadingGroups}
						isRefreshing={isRefreshingGroups}
						onRefresh={handleRefreshGroups}
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
							paddingBottom: bottom
						}}
					>
						<TouchableOpacity
							onPress={async () => {
								onClose()
								await exit()
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
		</AppModal>
	)
}

export default GroupsSidebar
