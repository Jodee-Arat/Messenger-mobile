import { useRoute } from '@react-navigation/native'
import { Trash2 } from 'lucide-react-native'
import React, { useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import SettingsSkeleton from '@/components/ui/SettingsSkeleton'

import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

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
	useFindGroupByGroupIdQuery,
	useGetMemberRoleQuery
} from '@/graphql/generated/output'

const GroupSettings = () => {
	const route = useRoute()
	const navigation = useTypedNavigation()
	const { groupId, groupName } = route.params as GroupSettingsRouteParams

	const { colors } = useTheme()
	const { t } = useTranslation()
	const PERMISSIONS = getPermissions(colors, t)

	const [isInviteOpen, setIsInviteOpen] = useState(false)

	const { data: dataFindGroup, loading: isFindGroupByGroupId } =
		useFindGroupByGroupIdQuery({
			variables: { groupId },
			fetchPolicy: 'network-only'
		})
	const group = dataFindGroup?.findGroupByGroupId

	const { data: currentRoleData, loading: isLoadingGetMemberRole } =
		useGetMemberRoleQuery({
			variables: { groupId },
			fetchPolicy: 'network-only'
		})

	const currentRole = currentRoleData?.getMemberRole

	const canManageRoles =
		currentRole?.permissions.includes(GroupPermissionEnum.ManageRoles) ||
		currentRole?.isCreator

	const canCreateRole =
		currentRole?.permissions.includes(GroupPermissionEnum.CreateRoles) ||
		currentRole?.isCreator

	const canChangeRoleInfo =
		currentRole?.permissions.includes(GroupPermissionEnum.ChangeRoleInfo) ||
		currentRole?.isCreator

	const canDeleteRoles =
		currentRole?.permissions.includes(GroupPermissionEnum.DeleteRoles) ||
		currentRole?.isCreator

	const canChangeGroupInfo =
		currentRole?.permissions.includes(
			GroupPermissionEnum.ChangeGroupInfo
		) || currentRole?.isCreator

	const canInviteMembers =
		currentRole?.permissions.includes(GroupPermissionEnum.InviteMembers) ||
		currentRole?.isCreator

	const canRemoveMembers =
		currentRole?.permissions.includes(GroupPermissionEnum.RemoveMembers) ||
		currentRole?.isCreator

	const canDeleteGroup =
		currentRole?.permissions.includes(GroupPermissionEnum.DeleteGroup) ||
		currentRole?.isCreator

	const {
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
		isChangingInfo,
		isChangingAvatar,
		isRemovingAvatar,
		isDeletingGroup,
		getRoleForUser,
		getMembersWithRole
	} = useGroupSettings(groupId)

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
			<GroupSettingsHeader groupName={groupName} />
			{isLoadingGetMemberRole || isFindGroupByGroupId ? (
				<SettingsSkeleton />
			) : (
				<>
					<ScrollView
						className='flex-1'
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 40 }}
					>
						<GroupInfoCard
							group={group}
							isFindGroupByGroupIdLoading={isFindGroupByGroupId}
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
