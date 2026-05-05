import { Plus, Users } from 'lucide-react-native'
import { FC } from 'react'
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'
import EmptyStateCard from '@/components/ui/EmptyStateCard'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { navigate } from '@/navigation/navigate'

import GroupsListSkeleton from './GroupsListSkeleton'
import {
	FindAllGroupsByUserQuery,
	GroupPermissionEnum,
	useGetMemberRoleLazyQuery
} from '@/graphql/generated/output'

type GroupItem = FindAllGroupsByUserQuery['findAllGroupsByUser'][0]

interface GroupsListProps {
	groups: GroupItem[]
	isLoading: boolean
	isRefreshing: boolean
	onRefresh: () => void
	onCreatePress: () => void
	onLongPress: (group: GroupItem) => void
	onClose: () => void
}

const GroupsList: FC<GroupsListProps> = ({
	groups,
	isLoading,
	isRefreshing,
	onRefresh,
	onCreatePress,
	onLongPress,
	onClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const handleGroupPress = (group: GroupItem) => {
		onClose()
		setTimeout(() => {
			navigate('ChatsList', {
				groupId: group.id,
				groupName: group.groupName
			})
		}, 250)
	}

	const [getMemberRole] = useGetMemberRoleLazyQuery()

	return (
		<View className='flex-1'>
			<View className='flex-row items-center justify-between px-5 pt-4 pb-2'>
				<Text
					className='text-xs font-bold uppercase tracking-wider'
					style={{ color: colors.textMuted }}
				>
					{t('groups')}
				</Text>
				<TouchableOpacity
					onPress={onCreatePress}
					activeOpacity={0.6}
					className='w-7 h-7 rounded-full items-center justify-center'
					style={{ backgroundColor: colors.cardHover }}
				>
					<Plus size={14} color={colors.textSecondary} />
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<GroupsListSkeleton />
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 16 }}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={onRefresh}
							tintColor={colors.accent}
							colors={[colors.accent]}
							progressBackgroundColor={colors.backgroundSecondary}
						/>
					}
				>
					{groups.length === 0 && (
						<View className='px-5 pt-4'>
							<EmptyStateCard
								icon={Users}
								title={t('noGroups')}
								description={t('createGroupHint')}
							/>
						</View>
					)}
					{groups.map(group => (
						<Pressable
							key={group.id}
							onPress={() => handleGroupPress(group)}
							onLongPress={async () => {
								const { data: currentRoleData } =
									await getMemberRole({
										variables: { groupId: group.id }
									})

								const currentRole =
									currentRoleData?.getMemberRole
								const groupPermissions =
									currentRole?.permissions ?? []

								const canDeleteGroup =
									groupPermissions.includes(
										GroupPermissionEnum.DeleteGroup
									) || currentRole?.isCreator
								if (canDeleteGroup) {
									onLongPress(group)
								}
							}}
							delayLongPress={400}
							android_ripple={{
								color: 'rgba(139, 92, 246, 0.08)'
							}}
						>
							<View
								className='flex-row items-center px-5 py-3'
								style={{
									borderBottomWidth: 0.5,
									borderBottomColor: colors.border
								}}
							>
								<EntityAvatar
									name={group.groupName}
									avatarUrl={group.avatarUrl}
								/>
								<Text
									className='ml-3 text-sm font-medium flex-1'
									numberOfLines={1}
									style={{ color: colors.text }}
								>
									{group.groupName}
								</Text>
							</View>
						</Pressable>
					))}
				</ScrollView>
			)}
		</View>
	)
}

export default GroupsList
