import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { useSendSecretKey } from '@/hooks/useSendSecretKey'
import { useUser } from '@/hooks/useUser'

import '../../../types/chat-role.type'
import { ChatRoleData } from '../../../types/chat-role.type'

import {
	ChatPermissionEnum,
	useAssignRoleToUserMutation,
	useChangeChatAvatarMutation,
	useChangeChatInfoMutation,
	useChatAssignedRoleSubscription,
	useChatDeletedRoleSubscription,
	useChatRemovedRoleSubscription,
	useChatUpsertedRoleSubscription,
	useDeleteChatMutation,
	useDeleteChatRoleMutation,
	useFindChatByChatIdQuery,
	useGetChatRolesQuery,
	useGetMemberChatRoleQuery,
	useRemoveChatAvatarMutation,
	useRemoveRoleFromUserMutation,
	useUpsertChatRoleMutation
} from '@/graphql/generated/output'

// добавть graphql
const INVITE_MEMBER_TO_CHAT = gql`
	mutation InviteMemberToChat($chatId: String!, $targetUserId: String!) {
		inviteMemberToChat(chatId: $chatId, targetUserId: $targetUserId)
	}
`

const REMOVE_MEMBER_FROM_CHAT = gql`
	mutation RemoveMemberFromChat($chatId: String!, $targetUserId: String!) {
		removeMemberFromChat(chatId: $chatId, targetUserId: $targetUserId)
	}
`

export function useChatSettings(chatId: string) {
	const { userId } = useUser()

	// ── Chat info + members query ────────────────────────────
	const {
		data: chatData,
		loading: isLoadingChat,
		refetch: refetchChat
	} = useFindChatByChatIdQuery({
		variables: { chatId },
		fetchPolicy: 'network-only'
	})

	const chat = chatData?.findChatByChatId
	const members = chat?.members ?? []

	// ── Secret key sender (active only for secret chats) ─────
	const { sendKeyToNewMember } = useSendSecretKey(
		chatId,
		userId ?? '',
		(chat as any)?.groupId ?? null,
		!!chat?.isSecret && !!userId
	)

	// ── Current user role query ──────────────────────────────
	const { data: memberRoleData, loading: isLoadingMemberRole } =
		useGetMemberChatRoleQuery({
			variables: { chatId },
			fetchPolicy: 'network-only'
		})

	const currentRole = memberRoleData?.getMemberChatRole

	// ── Roles query ──────────────────────────────────────────
	const {
		data: rolesData,
		loading: isLoadingRoles,
		refetch: refetchRoles
	} = useGetChatRolesQuery({
		variables: { chatId },
		fetchPolicy: 'network-only'
	})

	const [roles, setRoles] = useState<ChatRoleData[]>([])

	useEffect(() => {
		if (rolesData?.getChatRoles) {
			setRoles(rolesData.getChatRoles)
		}
	}, [rolesData])

	// ── Mutations ────────────────────────────────────────────
	const [upsertChatRole, { loading: isUpserting }] =
		useUpsertChatRoleMutation()
	const [deleteChatRole, { loading: isDeleting }] =
		useDeleteChatRoleMutation()
	const [assignChatRole, { loading: isAssigning }] =
		useAssignRoleToUserMutation()
	const [removeChatRole, { loading: isRemoving }] =
		useRemoveRoleFromUserMutation()

	// ── Chat info / avatar / delete mutations ────────────────
	const [changeChatInfo, { loading: isChangingInfo }] =
		useChangeChatInfoMutation()
	const [changeChatAvatar, { loading: isChangingAvatar }] =
		useChangeChatAvatarMutation()
	const [removeChatAvatar, { loading: isRemovingAvatar }] =
		useRemoveChatAvatarMutation()
	const [deleteChat, { loading: isDeletingChat }] = useDeleteChatMutation()

	// ── Invite / Remove member mutations ─────────────────────
	const [inviteMemberMutation, { loading: isInviting }] = useMutation(
		INVITE_MEMBER_TO_CHAT
	)
	const [removeMemberMutation, { loading: isRemovingMember }] = useMutation(
		REMOVE_MEMBER_FROM_CHAT
	)

	// ── Subscriptions ────────────────────────────────────────
	useChatUpsertedRoleSubscription({
		variables: { chatId },
		onData: ({ data: subData }) => {
			const upserted = subData.data?.chatUpsertedRole
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

	useChatDeletedRoleSubscription({
		variables: { chatId },
		onData: ({ data: subData }) => {
			const deleted = subData.data?.chatDeletedRole
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

	useChatAssignedRoleSubscription({
		variables: { chatId },
		onData: () => {
			refetchRoles()
			refetchChat()
		}
	})

	useChatRemovedRoleSubscription({
		variables: { chatId },
		onData: () => {
			refetchRoles()
			refetchChat()
		}
	})

	// ── Local user→role mapping ──────────────────────────────
	const [userRoles, setUserRoles] = useState<Record<string, string>>({})

	// Populate userRoles from members' role data when available
	useEffect(() => {
		if (members.length > 0) {
			const mapping: Record<string, string> = {}
			for (const member of members) {
				if (member.roles && member.roles.length > 0) {
					mapping[member.user.id] = member.roles[0].id
				}
			}
			setUserRoles(mapping)
		}
	}, [members])

	// ── Modal state ──────────────────────────────────────────
	const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<ChatRoleData | null>(null)
	const [assignUserId, setAssignUserId] = useState<string | null>(null)

	// ── Handlers ─────────────────────────────────────────────
	const handleCreateRole = async (
		name: string,
		color: string,
		permissions: ChatPermissionEnum[]
	) => {
		await upsertChatRole({
			variables: {
				chatId,
				data: { name, color, permissions }
			}
		})
	}

	const handleDeleteRole = async (roleId: string) => {
		await deleteChatRole({
			variables: { chatId, roleId }
		})
		setSelectedRole(null)
	}

	const handleTogglePermission = async (
		role: ChatRoleData,
		permissionKey: ChatPermissionEnum
	) => {
		const hasPermission = role.permissions.includes(permissionKey)
		const newPermissions = hasPermission
			? role.permissions.filter(p => p !== permissionKey)
			: [...role.permissions, permissionKey]

		await upsertChatRole({
			variables: {
				chatId,
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
		const currentRoleId = userRoles[memberId]

		if (currentRoleId) {
			await removeChatRole({
				variables: { chatId, roleId: currentRoleId, memberId }
			})
		}

		if (roleId && roleId !== currentRoleId) {
			await assignChatRole({
				variables: { chatId, roleId, memberId }
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

	// ── Helpers ──────────────────────────────────────────────
	const getPermCount = (role: ChatRoleData) => role.permissions.length

	const getRoleForUser = (userId: string): ChatRoleData | undefined => {
		const roleId = userRoles[userId]
		return roleId ? roles.find(r => r.id === roleId) : undefined
	}

	const getMembersWithRole = (roleId: string) =>
		members.filter(m => userRoles[m.user.id] === roleId)

	// ── Chat info handlers ───────────────────────────────────
	const handleChangeChatInfo = async (
		chatName: string,
		description: string
	) => {
		try {
			await changeChatInfo({
				variables: { chatId, data: { chatName, description } }
			})
			refetchChat()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось обновить информацию о чате')
		}
	}

	const handleChangeAvatar = async (file: any) => {
		try {
			await changeChatAvatar({
				variables: { chatId, avatar: file }
			})
			refetchChat()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось изменить аватар')
		}
	}

	const handleRemoveAvatar = async () => {
		try {
			await removeChatAvatar({ variables: { chatId } })
			refetchChat()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось удалить аватар')
		}
	}

	const handleDeleteChat = async () => {
		try {
			await deleteChat({ variables: { chatId } })
			return true
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось удалить чат')
			return false
		}
	}

	const handleInviteMember = async (targetUserId: string) => {
		try {
			await inviteMemberMutation({
				variables: { chatId, targetUserId }
			})
			// For secret chats — send the session key to the new member
			if (chat?.isSecret) {
				try {
					await sendKeyToNewMember(targetUserId)
				} catch (keyErr) {
					console.error(
						'[useChatSettings] sendKeyToNewMember failed:',
						keyErr
					)
				}
			}
			refetchChat()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось пригласить участника')
		}
	}

	const handleRemoveMember = async (targetUserId: string) => {
		try {
			await removeMemberMutation({
				variables: { chatId, targetUserId }
			})
			refetchChat()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось удалить участника')
		}
	}

	return {
		// data
		chat,
		members,
		isLoadingChat,
		isLoadingMemberRole,
		currentRole,
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
		isDeletingChat,

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
		handleChangeChatInfo,
		handleChangeAvatar,
		handleRemoveAvatar,
		handleDeleteChat,
		handleInviteMember,
		handleRemoveMember,

		// helpers
		getPermCount,
		getRoleForUser,
		getMembersWithRole
	}
}
