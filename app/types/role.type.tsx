import {
	Edit3,
	Image,
	MessageSquare,
	Settings,
	Shield,
	ShieldCheck,
	Trash2,
	Type,
	UserMinus,
	UserPlus,
	Users
} from 'lucide-react-native'
import React from 'react'

import type { ThemeColors } from '@/hooks/useTheme'

import {
	GetGroupRolesQuery,
	GroupPermissionEnum
} from '@/graphql/generated/output'

/* ─── Route params ─── */
export type GroupSettingsRouteParams = {
	groupId: string
	groupName: string
}

/* ─── Permission UI descriptor ─── */
export interface Permission {
	key: GroupPermissionEnum
	label: string
	description: string
	icon: React.ReactNode
}

export type GroupRoleData = GetGroupRolesQuery['getGroupRoles'][0]

/* ─── Palette for role colors ─── */
export const ROLE_COLORS = [
	'#5865f2',
	'#57f287',
	'#fee75c',
	'#eb459e',
	'#ed4245',
	'#ffffff',
	'#e67e22',
	'#9b59b6',
	'#1abc9c',
	'#e91e63',
	'#2ecc71',
	'#3498db'
]

/* ─── Permission definitions ─── */
export const getPermissions = (
	colors: ThemeColors,
	t: (key: string) => string
): Permission[] => [
	{
		key: GroupPermissionEnum.CreateChats,
		label: t('canCreateChats'),
		description: t('canCreateChatsDesc'),
		icon: <MessageSquare size={18} color={colors.accent} />
	},
	{
		key: GroupPermissionEnum.DeleteChats,
		label: t('canDeleteChats'),
		description: t('canDeleteChatsDesc'),
		icon: <Trash2 size={18} color={colors.destructive} />
	},
	{
		key: GroupPermissionEnum.InviteMembers,
		label: t('canInviteMembers'),
		description: t('canInviteMembersDesc'),
		icon: <UserPlus size={18} color={colors.success} />
	},
	{
		key: GroupPermissionEnum.RemoveMembers,
		label: t('canRemoveMembers'),
		description: t('canRemoveMembersDesc'),
		icon: <UserMinus size={18} color={colors.destructive} />
	},
	{
		key: GroupPermissionEnum.ManageRoles,
		label: t('canManageRoles'),
		description: t('canManageRolesDesc'),
		icon: <ShieldCheck size={18} color={colors.warning} />
	},
	{
		key: GroupPermissionEnum.CreateRoles,
		label: t('canCreateRoles'),
		description: t('canCreateRolesDesc'),
		icon: <Shield size={18} color={colors.accent} />
	},
	{
		key: GroupPermissionEnum.DeleteRoles,
		label: t('canDeleteRoles'),
		description: t('canDeleteRolesDesc'),
		icon: <Trash2 size={18} color={colors.warning} />
	},
	{
		key: GroupPermissionEnum.ChangeRoleInfo,
		label: t('canChangeRoleInfo'),
		description: t('canChangeRoleInfoDesc'),
		icon: <Edit3 size={18} color={colors.textSecondary} />
	},
	{
		key: GroupPermissionEnum.ChangeGroupInfo,
		label: t('canChangeGroupInfo'),
		description: t('canChangeGroupInfoDesc'),
		icon: <Settings size={18} color={colors.accent} />
	},
	{
		key: GroupPermissionEnum.ChangeGroupName,
		label: t('canChangeGroupName'),
		description: t('canChangeGroupNameDesc'),
		icon: <Type size={18} color={colors.textSecondary} />
	},
	{
		key: GroupPermissionEnum.ChangeGroupAvatar,
		label: t('canChangeGroupAvatar'),
		description: t('canChangeGroupAvatarDesc'),
		icon: <Image size={18} color={colors.success} />
	},
	{
		key: GroupPermissionEnum.DeleteGroup,
		label: t('canDeleteGroup'),
		description: t('canDeleteGroupDesc'),
		icon: <Trash2 size={18} color={colors.destructive} />
	}
]
