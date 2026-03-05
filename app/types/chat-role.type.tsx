import {
	Edit3,
	Eye,
	Hash,
	MessageSquare,
	Pin,
	Shield,
	ShieldCheck,
	Trash2,
	UserPlus,
	Users
} from 'lucide-react-native'
import React from 'react'

import type { ThemeColors } from '@/hooks/useTheme'

import {
	ChatPermissionEnum,
	GetChatRolesQuery
} from '@/graphql/generated/output'

/* ─── Route params ─── */
export type ChatSettingsRouteParams = {
	chatId: string
}

/* ─── Permission UI descriptor ─── */
export interface ChatPermission {
	key: ChatPermissionEnum
	label: string
	description: string
	icon: React.ReactNode
}

export type ChatRoleData = GetChatRolesQuery['getChatRoles'][0]

/* ─── Palette for role colors ─── */
export const CHAT_ROLE_COLORS = [
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
export const getChatPermissions = (
	colors: ThemeColors,
	t: (key: string) => string
): ChatPermission[] => [
	{
		key: ChatPermissionEnum.SendMessages,
		label: t('canSendMessages'),
		description: t('canSendMessagesDesc'),
		icon: <MessageSquare size={18} color={colors.accent} />
	},
	{
		key: ChatPermissionEnum.EditMessages,
		label: t('canEditMessages'),
		description: t('canEditMessagesDesc'),
		icon: <Hash size={18} color={colors.accent} />
	},
	{
		key: ChatPermissionEnum.DeleteMessages,
		label: t('canDeleteMessages'),
		description: t('canDeleteMessagesDesc'),
		icon: <Trash2 size={18} color={colors.destructive} />
	},
	{
		key: ChatPermissionEnum.PinMessages,
		label: t('canPinMessages'),
		description: t('canPinMessagesDesc'),
		icon: <Pin size={18} color={colors.warning} />
	},
	{
		key: ChatPermissionEnum.InviteMembers,
		label: t('canInviteMembers'),
		description: t('canInviteMembersDesc'),
		icon: <UserPlus size={18} color={colors.success} />
	},
	{
		key: ChatPermissionEnum.RemoveMembers,
		label: t('canManageMembers'),
		description: t('canManageMembersDesc'),
		icon: <Users size={18} color={colors.success} />
	},
	{
		key: ChatPermissionEnum.ManageRoles,
		label: t('canManageRoles'),
		description: t('canManageRolesDesc'),
		icon: <ShieldCheck size={18} color={colors.accent} />
	},
	{
		key: ChatPermissionEnum.CreateRoles,
		label: t('canCreateRoles'),
		description: t('canCreateRolesDesc'),
		icon: <Shield size={18} color={colors.accent} />
	},
	{
		key: ChatPermissionEnum.ChangeChatInfo,
		label: t('canChangeChatInfo'),
		description: t('canChangeChatInfoDesc'),
		icon: <Eye size={18} color={colors.textSecondary} />
	},
	// {
	// 	key: ChatPermissionEnum.SecretChat,
	// 	label: t('canSecretChat'),
	// 	description: t('canSecretChatDesc'),
	// 	icon: <Lock size={18} color={colors.accent} />
	// },
	{
		key: ChatPermissionEnum.ChangeChatName,
		label: t('canChangeChatName'),
		description: t('canChangeChatNameDesc'),
		icon: <Edit3 size={18} color={colors.textSecondary} />
	},
	{
		key: ChatPermissionEnum.ChangeChatAvatar,
		label: t('canChangeChatAvatar'),
		description: t('canChangeChatAvatarDesc'),
		icon: <Edit3 size={18} color={colors.textSecondary} />
	},
	{
		key: ChatPermissionEnum.ChangeRoleInfo,
		label: t('canChangeRoleInfo'),
		description: t('canChangeRoleInfoDesc'),
		icon: <Edit3 size={18} color={colors.textSecondary} />
	},
	{
		key: ChatPermissionEnum.DeleteRoles,
		label: t('canDeleteRoles'),
		description: t('canDeleteRolesDesc'),
		icon: <Trash2 size={18} color={colors.warning} />
	}
]
