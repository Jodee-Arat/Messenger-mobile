import { gql, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import '../../../types/role.type'
import { GroupRoleData } from '../../../types/role.type'

import {
	GroupPermissionEnum,
	useAssignGroupRoleToMemberMutation,
	useChangeGroupAvatarMutation,
	useChangeGroupInfoMutation,
	useDeleteGroupMutation,
	useDeleteGroupRoleMutation,
	useFindGroupByGroupIdQuery,
	useGetGroupRolesQuery,
	useGroupAssignedRoleSubscription,
	useGroupDeletedRoleSubscription,
	useGroupRemovedRoleSubscription,
	useGroupUpsertedRoleSubscription,
	useRemoveGroupAvatarMutation,
	useRemoveGroupRoleFromMemberMutation,
	useUpsertGroupRoleMutation
} from '@/graphql/generated/output'

const INVITE_MEMBER_MUTATION = gql`
	mutation InviteMemberToGroup($groupId: String!, $targetUserId: String!) {
		inviteMemberToGroup(groupId: $groupId, targetUserId: $targetUserId)
	}
`

const REMOVE_MEMBER_MUTATION = gql`
	mutation RemoveMemberFromGroup($groupId: String!, $targetUserId: String!) {
		removeMemberFromGroup(groupId: $groupId, targetUserId: $targetUserId)
	}
`

export function useGroupSettings(groupId: string) {
	// ── Group members query ──────────────────────────────────
	const {
		data: groupData,
		loading: isLoadingGroup,
		refetch: refetchGroup
	} = useFindGroupByGroupIdQuery({
		variables: { groupId },
		fetchPolicy: 'network-only'
	})

	const members = groupData?.findGroupByGroupId?.members ?? []

	// ── Roles query ──────────────────────────────────────────
	const {
		data: rolesData,
		loading: isLoadingRoles,
		refetch: refetchRoles
	} = useGetGroupRolesQuery({
		variables: { groupId },
		fetchPolicy: 'network-only'
	})

	const [roles, setRoles] = useState<GroupRoleData[]>([])

	useEffect(() => {
		if (rolesData?.getGroupRoles) {
			setRoles(rolesData.getGroupRoles)
		}
	}, [rolesData])

	// ── Mutations ────────────────────────────────────────────
	const [upsertGroupRole, { loading: isUpserting }] =
		useUpsertGroupRoleMutation()
	const [deleteGroupRole, { loading: isDeleting }] =
		useDeleteGroupRoleMutation()
	const [assignGroupRole, { loading: isAssigning }] =
		useAssignGroupRoleToMemberMutation()
	const [removeGroupRole, { loading: isRemoving }] =
		useRemoveGroupRoleFromMemberMutation()

	// ── Group info / avatar / delete mutations ───────────────
	const [changeGroupInfo, { loading: isChangingInfo }] =
		useChangeGroupInfoMutation()
	const [changeGroupAvatar, { loading: isChangingAvatar }] =
		useChangeGroupAvatarMutation()
	const [removeGroupAvatar, { loading: isRemovingAvatar }] =
		useRemoveGroupAvatarMutation()
	const [deleteGroup, { loading: isDeletingGroup }] = useDeleteGroupMutation()

	// ── Invite / Remove member mutations ─────────────────────
	const [inviteMemberMutation, { loading: isInviting }] = useMutation(
		INVITE_MEMBER_MUTATION
	)
	const [removeMemberMutation, { loading: isRemovingMember }] = useMutation(
		REMOVE_MEMBER_MUTATION
	)

	// ── Subscriptions ────────────────────────────────────────
	useGroupUpsertedRoleSubscription({
		variables: { groupId },
		onData: ({ data: subData }) => {
			const upserted = subData.data?.groupUpsertedRole
			if (!upserted) return
			setRoles(prev => {
				const idx = prev.findIndex(r => r.id === upserted.id)
				if (idx >= 0) {
					const copy = [...prev]
					copy[idx] = upserted
					return copy
				}
				return [...prev, upserted]
			})
		}
	})

	useGroupDeletedRoleSubscription({
		variables: { groupId },
		onData: ({ data: subData }) => {
			const deleted = subData.data?.groupDeletedRole
			if (!deleted) return
			setRoles(prev => prev.filter(r => r.id !== deleted.id))
			// Clean up userRoles for deleted role
			setUserRoles(prev => {
				const copy = { ...prev }
				Object.keys(copy).forEach(uid => {
					if (copy[uid] === deleted.id) delete copy[uid]
				})
				return copy
			})
		}
	})

	useGroupAssignedRoleSubscription({
		variables: { groupId },
		onData: () => {
			// Role was assigned to some member — refetch roles and group data to stay in sync
			refetchRoles()
			refetchGroup()
		}
	})

	useGroupRemovedRoleSubscription({
		variables: { groupId },
		onData: () => {
			// Role was removed from some member — refetch roles and group data to stay in sync
			refetchRoles()
			refetchGroup()
		}
	})

	// ── Local user→role mapping (loaded from backend data) ──
	const [userRoles, setUserRoles] = useState<Record<string, string>>({})

	// Populate userRoles from members' role data
	useEffect(() => {
		if (members.length > 0) {
			const mapping: Record<string, string> = {}
			for (const member of members) {
				if (member.roles && member.roles.length > 0) {
					// Use the first assigned role
					mapping[member.user.id] = member.roles[0].id
				}
			}
			setUserRoles(mapping)
		}
	}, [members])

	// ── Modal state ──────────────────────────────────────────
	const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<GroupRoleData | null>(null)
	const [assignUserId, setAssignUserId] = useState<string | null>(null)

	// ── Handlers ─────────────────────────────────────────────
	const handleCreateRole = async (
		name: string,
		color: string,
		permissions: GroupPermissionEnum[]
	) => {
		await upsertGroupRole({
			variables: {
				groupId,
				data: { name, color, permissions }
			}
		})
	}

	const handleDeleteRole = async (roleId: string) => {
		await deleteGroupRole({
			variables: { groupId, roleId }
		})
		setSelectedRole(null)
	}

	const handleTogglePermission = async (
		role: GroupRoleData,
		permissionKey: GroupPermissionEnum
	) => {
		const hasPermission = role.permissions.includes(permissionKey)
		const newPermissions = hasPermission
			? role.permissions.filter(p => p !== permissionKey)
			: [...role.permissions, permissionKey]

		await upsertGroupRole({
			variables: {
				groupId,
				data: {
					name: role.name,
					color: role.color,
					permissions: newPermissions
				}
			}
		})

		setSelectedRole({
			...role,
			permissions: newPermissions
		})
	}

	const handleAssignRole = async (memberId: string, roleId: string) => {
		// If roleId is empty — remove existing role
		const currentRoleId = userRoles[memberId]

		if (currentRoleId) {
			await removeGroupRole({
				variables: { groupId, roleId: currentRoleId, memberId }
			})
		}

		if (roleId && roleId !== currentRoleId) {
			await assignGroupRole({
				variables: { groupId, roleId, memberId }
			})
			setUserRoles(prev => ({ ...prev, [memberId]: roleId }))
		} else {
			setUserRoles(prev => {
				const copy = { ...prev }
				delete copy[memberId]
				return copy
			})
		}

		setAssignUserId(null)
	}

	// ── Group info handlers ──────────────────────────────────
	const handleChangeGroupInfo = async (
		groupName: string,
		description: string
	) => {
		try {
			await changeGroupInfo({
				variables: {
					groupId,
					data: { groupName, description }
				}
			})
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
		}
	}

	const handleChangeAvatar = async (file: any) => {
		try {
			await changeGroupAvatar({
				variables: { groupId, avatar: file }
			})
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
		}
	}

	const handleRemoveAvatar = async () => {
		try {
			await removeGroupAvatar({ variables: { groupId } })
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
		}
	}

	const handleDeleteGroup = async () => {
		try {
			await deleteGroup({ variables: { groupId } })
			return true
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
			return false
		}
	}

	const handleInviteMember = async (targetUserId: string) => {
		try {
			await inviteMemberMutation({
				variables: { groupId, targetUserId },
				refetchQueries: ['FindGroupByGroupId']
			})
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
		}
	}

	const handleRemoveMember = async (targetUserId: string) => {
		try {
			await removeMemberMutation({
				variables: { groupId, targetUserId },
				refetchQueries: ['FindGroupByGroupId']
			})
		} catch (e) {
			Alert.alert('Error', (e as Error).message)
		}
	}

	// ── Helpers ──────────────────────────────────────────────
	const getPermCount = (role: GroupRoleData) => role.permissions.length

	const getRoleForUser = (userId: string): GroupRoleData | undefined => {
		const roleId = userRoles[userId]
		return roleId ? roles.find(r => r.id === roleId) : undefined
	}

	const getMembersWithRole = (roleId: string) =>
		members.filter(m => userRoles[m.user.id] === roleId)

	return {
		// data
		members,
		isLoadingGroup,
		roles,
		isLoadingRoles,
		userRoles,

		// mutation loading states
		isUpserting,
		isDeleting,
		isAssigning,
		isRemoving,
		isChangingInfo,
		isChangingAvatar,
		isRemovingAvatar,
		isDeletingGroup,
		isInviting,
		isRemovingMember,

		// modal state
		isCreateRoleOpen,
		setIsCreateRoleOpen,
		selectedRole,
		setSelectedRole,
		assignUserId,
		setAssignUserId,

		// handlers
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

		// helpers
		getPermCount,
		getRoleForUser,
		getMembersWithRole
	}
}
