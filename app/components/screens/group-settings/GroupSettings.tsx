import { useFocusEffect } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { Trash2 } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import SettingsSkeleton from '@/components/ui/SettingsSkeleton'

import { isGroupMembershipRevokedError } from '@/hooks/useBlockedUsers'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'
import { resetToHome } from '@/navigation/navigate'

import {
	type GroupSettingsRouteParams,
	getPermissions
} from '../../../types/role.type'

import AssignRoleModal from './AssignRoleModal'
import CreateRoleModal from './CreateRoleModal'
import GroupInfoCard from './GroupInfoCard'
import GroupSettingsHeader from './GroupSettingsHeader'
import InviteMemberModal from './InviteMemberModal'
import MembersSection from './MembersSection'
import RoleDetailModal from './RoleDetailModal'
import RolesSection from './RolesSection'
import { useGroupSettings } from './useGroupSettings'
import {
	GroupPermissionEnum,
	useGroupDeletedSubscription,
	useGetMemberRoleQuery
} from '@/graphql/generated/output'

const GroupSettings = () => {
	const route = useRoute()
	const navigation = useTypedNavigation()
	const { groupId, groupName } = route.params as GroupSettingsRouteParams
	const { userId } = useUser()
	const handledAccessLossRef = useRef(false)

	const { colors } = useTheme()
	const { t } = useTranslation()
	const PERMISSIONS = getPermissions(colors, t)

	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const {
		data: currentRoleData,
		loading: isLoadingGetMemberRole,
		refetch: refetchCurrentRole
	} =
		useGetMemberRoleQuery({
			variables: { groupId },
			fetchPolicy: 'network-only'
		})

	const currentRole = currentRoleData?.getMemberRole
	const groupPermissions = currentRole?.permissions ?? []
	const isCreator = !!currentRole?.isCreator

	const canManageRoles =
		groupPermissions.includes(GroupPermissionEnum.ManageRoles) || isCreator

	const canCreateRole =
		groupPermissions.includes(GroupPermissionEnum.CreateRoles) || isCreator

	const canChangeRoleInfo =
		groupPermissions.includes(GroupPermissionEnum.ChangeRoleInfo) ||
		isCreator

	const canDeleteRoles =
		groupPermissions.includes(GroupPermissionEnum.DeleteRoles) || isCreator

	const canChangeGroupInfo =
		groupPermissions.includes(GroupPermissionEnum.ChangeGroupInfo) ||
		isCreator

	const canInviteMembers =
		groupPermissions.includes(GroupPermissionEnum.InviteMembers) ||
		isCreator

	const canRemoveMembers =
		groupPermissions.includes(GroupPermissionEnum.RemoveMembers) ||
		isCreator

	const canDeleteGroup =
		groupPermissions.includes(GroupPermissionEnum.DeleteGroup) || isCreator

	const {
		group,
		groupError,
		members,
		isLoadingGroup,
		roles,
		userRoles,
		isCreateRoleOpen,
		setIsCreateRoleOpen,
		selectedRole,
		setSelectedRole,
		assignUserId,
		setAssignUserId,
		handleCreateRole,
		handleDeleteRole,
		handleTogglePermission,
		handleAssignRole,
		handleChangeGroupInfo,
		handleChangeAvatar,
		handleRemoveAvatar,
		handleDeleteGroup,
		handleInviteMember,
		handleRemoveMember,
		refreshGroupSettings,
		isChangingInfo,
		isChangingAvatar,
		isRemovingAvatar,
		isDeletingGroup,
		getRoleForUser,
		getMembersWithRole
	} = useGroupSettings(groupId)
	const resolvedGroupName = group?.groupName ?? groupName

	const handleGroupAccessLoss = useCallback(() => {
		if (handledAccessLossRef.current) return
		handledAccessLossRef.current = true
		resetToHome()
	}, [])

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await Promise.allSettled([
				refreshGroupSettings(),
				refetchCurrentRole()
			])
		} finally {
			setIsRefreshing(false)
		}
	}, [refetchCurrentRole, refreshGroupSettings])

	useEffect(() => {
		if (!isGroupMembershipRevokedError(groupError)) return
		handleGroupAccessLoss()
	}, [groupError, handleGroupAccessLoss])

	useFocusEffect(
		useCallback(() => {
			void refreshGroupSettings()
		}, [refreshGroupSettings])
	)

	useGroupDeletedSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data }) => {
			if (data.data?.groupDeleted.id !== groupId) return
			handleGroupAccessLoss()
		}
	})

	const isSavingGroupInfo =
		isChangingInfo || isChangingAvatar || isRemovingAvatar

	const onDeleteGroup = () => {
		Alert.alert(t('deleteGroup'), t('deleteGroupConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('deleteGroup'),
				style: 'destructive',
				onPress: async () => {
					const success = await handleDeleteGroup()
					if (success) {
						navigation.goBack()
					}
				}
			}
		])
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<GroupSettingsHeader groupName={resolvedGroupName} />
			{isLoadingGetMemberRole || isLoadingGroup ? (
				<SettingsSkeleton />
			) : (
				<>
					<ScrollView
						className='flex-1'
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 40 }}
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={handleRefresh}
								tintColor={colors.accent}
								colors={[colors.accent]}
								progressBackgroundColor={colors.card}
							/>
						}
					>
						<GroupInfoCard
							group={group}
							isFindGroupByGroupIdLoading={isLoadingGroup}
							canChangeGroupInfo={!!canChangeGroupInfo}
							onSaveInfo={handleChangeGroupInfo}
							onChangeAvatar={handleChangeAvatar}
							onRemoveAvatar={handleRemoveAvatar}
							isSaving={isSavingGroupInfo}
						/>

						<RolesSection
							roles={roles}
							permissions={PERMISSIONS}
							onRolePress={setSelectedRole}
							onCreatePress={() => setIsCreateRoleOpen(true)}
							canManageRoles={!!canManageRoles}
							canCreateRole={!!canCreateRole}
						/>

						<MembersSection
							members={members}
							roles={roles}
							isLoading={isLoadingGroup}
							getRoleForUser={getRoleForUser}
							onMemberPress={setAssignUserId}
							canManageRoles={!!canManageRoles}
							canInviteMembers={!!canInviteMembers}
							canRemoveMembers={!!canRemoveMembers}
							onInvitePress={() => setIsInviteOpen(true)}
							onRemoveMember={handleRemoveMember}
						/>

						{/* Delete Group */}
						{canDeleteGroup && (
							<View className='mt-6 px-4 mb-4'>
								<TouchableOpacity
									onPress={onDeleteGroup}
									activeOpacity={0.7}
									className='flex-row items-center justify-center py-3.5 rounded-xl'
									style={{
										backgroundColor:
											colors.destructiveMuted,
										borderWidth: 1,
										borderColor: colors.destructive
									}}
								>
									<Trash2
										size={18}
										color={colors.destructive}
										style={{ marginRight: 8 }}
									/>
									<Text
										className='text-sm font-bold'
										style={{ color: colors.destructive }}
									>
										{t('deleteGroup')}
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</ScrollView>

					<CreateRoleModal
						isOpen={isCreateRoleOpen}
						onClose={() => setIsCreateRoleOpen(false)}
						onCreateRole={handleCreateRole}
					/>

					<RoleDetailModal
						role={selectedRole}
						permissions={PERMISSIONS}
						onClose={() => setSelectedRole(null)}
						onDeleteRole={handleDeleteRole}
						onTogglePermission={handleTogglePermission}
						membersWithRole={
							selectedRole
								? getMembersWithRole(selectedRole.id)
								: []
						}
						canDeleteRoles={!!canDeleteRoles}
						canChangeRoleInfo={!!canChangeRoleInfo}
					/>

					<AssignRoleModal
						userId={assignUserId}
						roles={roles}
						userRoles={userRoles}
						members={members}
						onAssign={handleAssignRole}
						onClose={() => setAssignUserId(null)}
					/>

					<InviteMemberModal
						isOpen={isInviteOpen}
						onClose={() => setIsInviteOpen(false)}
						onInvite={handleInviteMember}
						existingMemberIds={members.map(m => m.user.id)}
					/>
				</>
			)}
		</View>
	)
}

export default GroupSettings
