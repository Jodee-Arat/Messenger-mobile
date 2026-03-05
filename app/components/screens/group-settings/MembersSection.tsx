import { Crown, Trash2, UserPlus, Users } from 'lucide-react-native'
import { FC, useMemo } from 'react'
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { GroupRoleData } from '../../../types/role.type'

import { FindGroupByGroupIdQuery } from '@/graphql/generated/output'

interface MembersSectionProps {
	members: FindGroupByGroupIdQuery['findGroupByGroupId']['members']
	roles: GroupRoleData[]
	isLoading: boolean
	getRoleForUser: (userId: string) => GroupRoleData | undefined
	onMemberPress: (userId: string) => void
	canManageRoles?: boolean
	canInviteMembers?: boolean
	canRemoveMembers?: boolean
	onInvitePress?: () => void
	onRemoveMember?: (userId: string) => void
}

const MembersSection: FC<MembersSectionProps> = ({
	members,
	roles,
	isLoading,
	getRoleForUser,
	onMemberPress,
	canManageRoles = false,
	canInviteMembers = false,
	canRemoveMembers = false,
	onInvitePress,
	onRemoveMember
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const handleRemoveMember = (
		member: FindGroupByGroupIdQuery['findGroupByGroupId']['members'][0]
	) => {
		if (member.isCreator) return
		Alert.alert(
			t('removeMember'),
			t('removeMemberConfirm').replace('{name}', member.user.username),
			[
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('removeMember'),
					style: 'destructive',
					onPress: () => onRemoveMember?.(member.user.id)
				}
			]
		)
	}

	const renderMemberRow = (
		member: FindGroupByGroupIdQuery['findGroupByGroupId']['members'][0]
	) => (
		<TouchableOpacity
			key={member.user.id}
			activeOpacity={canManageRoles ? 0.6 : 1}
			onPress={() => canManageRoles && onMemberPress(member.user.id)}
			className='flex-row items-center px-4 py-3 rounded-xl mb-2'
			style={{
				backgroundColor: colors.backgroundSecondary,
				borderWidth: 1,
				borderColor: colors.border
			}}
		>
			<EntityAvatar
				name={member.user.username}
				avatarUrl={member.user.avatarUrl}
				size='default'
			/>
			<View className='flex-1 ml-3'>
				<View className='flex-row items-center'>
					<Text
						className='text-sm font-semibold'
						style={{ color: colors.text }}
					>
						{member.user.username}
					</Text>
					{member.isCreator && (
						<Crown
							size={14}
							color='#FFD700'
							style={{ marginLeft: 6 }}
						/>
					)}
				</View>
			</View>
			{canRemoveMembers && !member.isCreator && (
				<TouchableOpacity
					onPress={() => handleRemoveMember(member)}
					activeOpacity={0.6}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					className='ml-2 p-1.5 rounded-full'
					style={{ backgroundColor: colors.destructiveMuted }}
				>
					<Trash2 size={14} color={colors.destructive} />
				</TouchableOpacity>
			)}
		</TouchableOpacity>
	)

	// Group members by role, sorted by permissions length (desc)
	const groupedByRole = useMemo(() => {
		const sortedRoles = [...roles].sort(
			(a, b) => b.permissions.length - a.permissions.length
		)

		const groups: {
			role: GroupRoleData
			members: FindGroupByGroupIdQuery['findGroupByGroupId']['members']
		}[] = []
		const assignedUserIds = new Set<string>()

		for (const role of sortedRoles) {
			const roleMembers = members.filter(m => {
				const userRole = getRoleForUser(m.user.id)
				return userRole?.id === role.id
			})
			if (roleMembers.length > 0) {
				groups.push({ role, members: roleMembers })
				roleMembers.forEach(m => assignedUserIds.add(m.user.id))
			}
		}

		// Members without any role
		const unassigned = members.filter(m => !assignedUserIds.has(m.user.id))

		return { groups, unassigned }
	}, [members, roles, getRoleForUser])

	return (
		<View className='mt-6 px-4 mb-4'>
			<View className='flex-row items-center mb-3'>
				<Users
					size={16}
					color={colors.success}
					style={{ marginRight: 8 }}
				/>
				<Text
					className='text-xs font-semibold uppercase tracking-wider'
					style={{ color: colors.textSecondary }}
				>
					{t('members')} — {members.length}
				</Text>

				{canInviteMembers && (
					<TouchableOpacity
						onPress={onInvitePress}
						activeOpacity={0.7}
						className='ml-auto flex-row items-center px-3 py-1.5 rounded-full'
						style={{ backgroundColor: colors.accent }}
					>
						<UserPlus
							size={14}
							color={colors.text}
							style={{ marginRight: 4 }}
						/>
						<Text
							className='text-xs font-semibold'
							style={{ color: colors.text }}
						>
							{t('inviteMember')}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{isLoading ? (
				<View className='py-6 items-center'>
					<ActivityIndicator size='small' color={colors.accent} />
				</View>
			) : (
				<>
					{groupedByRole.groups.map(
						({ role, members: roleMembers }) => (
							<View key={role.id} className='mb-4'>
								<View className='flex-row items-center mb-2'>
									<View
										style={{
											width: 10,
											height: 10,
											borderRadius: 5,
											backgroundColor: role.color,
											marginRight: 8
										}}
									/>
									<Text
										className='text-xs font-semibold uppercase tracking-wider'
										style={{ color: role.color }}
									>
										{role.name} — {roleMembers.length}
									</Text>
								</View>

								{roleMembers.map(member =>
									renderMemberRow(member)
								)}
							</View>
						)
					)}

					{groupedByRole.unassigned.length > 0 && (
						<View className='mb-4'>
							<Text
								className='text-xs font-semibold uppercase tracking-wider mb-2'
								style={{ color: colors.textMuted }}
							>
								{t('noRole')} —{' '}
								{groupedByRole.unassigned.length}
							</Text>

							{groupedByRole.unassigned.map(member =>
								renderMemberRow(member)
							)}
						</View>
					)}
				</>
			)}
		</View>
	)
}

export default MembersSection
