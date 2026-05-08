import { useEffect, useState } from 'react'
import type { ReactNativeFile } from 'extract-files'
import { Alert } from 'react-native'

import '../../../types/chat-role.type'
import { ChatRoleData } from '../../../types/chat-role.type'

import {
	ChatPermissionEnum,
	FindAllChatsByGroupDocument,
	FindAllChatsByUserDocument,
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
	useInviteMemberToChatMutation,
	useRemoveChatAvatarMutation,
	useRemoveMemberFromChatMutation,
	useRemoveRoleFromUserMutation,
	useUpsertChatRoleMutation
} from '@/graphql/generated/output'

export function useChatSettings(chatId: string) {
	const {
		data: chatData,
		error: chatError,
		loading: isLoadingChat,
		refetch: refetchChat
	} = useFindChatByChatIdQuery({
		variables: { chatId },
		fetchPolicy: 'network-only'
	})

	const chat = chatData?.findChatByChatId
	const members = chat?.members ?? []
	const isDM = !!chat && !chat.isGroup

	const {
		data: memberRoleData,
		loading: isLoadingMemberRole,
		refetch: refetchMemberRole
	} =
		useGetMemberChatRoleQuery({
			variables: { chatId },
			fetchPolicy: 'network-only',
			skip: !chat || isDM
		})

	const currentRole = memberRoleData?.getMemberChatRole

	const {
		data: rolesData,
		loading: isLoadingRoles,
		refetch: refetchRoles
	} = useGetChatRolesQuery({
		variables: { chatId },
		fetchPolicy: 'network-only',
		skip: !chat || isDM
	})

	const [roles, setRoles] = useState<ChatRoleData[]>([])

	useEffect(() => {
		if (isDM) {
			setRoles([])
			return
		}
		if (rolesData?.getChatRoles) {
			setRoles(rolesData.getChatRoles)
		}
	}, [isDM, rolesData])

	const [upsertChatRole, { loading: isUpserting }] =
		useUpsertChatRoleMutation()
	const [deleteChatRole, { loading: isDeleting }] =
		useDeleteChatRoleMutation()
	const [assignChatRole, { loading: isAssigning }] =
		useAssignRoleToUserMutation()
	const [removeChatRole, { loading: isRemoving }] =
		useRemoveRoleFromUserMutation()

	const [changeChatInfo, { loading: isChangingInfo }] =
		useChangeChatInfoMutation()
	const [changeChatAvatar, { loading: isChangingAvatar }] =
		useChangeChatAvatarMutation()
	const [removeChatAvatar, { loading: isRemovingAvatar }] =
		useRemoveChatAvatarMutation()
	const [deleteChat, { loading: isDeletingChat }] = useDeleteChatMutation()

	const [inviteMemberMutation, { loading: isInviting }] =
		useInviteMemberToChatMutation()
	const [removeMemberMutation, { loading: isRemovingMember }] =
		useRemoveMemberFromChatMutation()

	useChatUpsertedRoleSubscription({
		variables: { chatId },
		skip: isDM,
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
		skip: isDM,
		onData: ({ data: subData }) => {
			const deleted = subData.data?.chatDeletedRole
			if (!deleted) return
			setRoles(prev => prev.filter(r => r.id !== deleted.id))
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
		skip: isDM,
		onData: () => {
			refetchRoles()
			refetchChat()
		}
	})

	useChatRemovedRoleSubscription({
		variables: { chatId },
		skip: isDM,
		onData: () => {
			refetchRoles()
			refetchChat()
		}
	})

	const [userRoles, setUserRoles] = useState<Record<string, string>>({})

	useEffect(() => {
		if (isDM) {
			setUserRoles({})
			return
		}
		if (members.length > 0) {
			const mapping: Record<string, string> = {}
			for (const member of members) {
				if (member.roles && member.roles.length > 0) {
					mapping[member.user.id] = member.roles[0].id
				}
			}
			setUserRoles(mapping)
		}
	}, [isDM, members])

	const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<ChatRoleData | null>(null)
	const [assignUserId, setAssignUserId] = useState<string | null>(null)

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

	const getPermCount = (role: ChatRoleData) => role.permissions.length

	const getRoleForUser = (userId: string): ChatRoleData | undefined => {
		const roleId = userRoles[userId]
		return roleId ? roles.find(r => r.id === roleId) : undefined
	}

	const getMembersWithRole = (roleId: string) =>
		members.filter(m => userRoles[m.user.id] === roleId)

	const chatListRefetchQueries = [
		{
			query: FindAllChatsByUserDocument,
			variables: { filters: {} }
		},
		...(chat?.groupId
			? [
					{
						query: FindAllChatsByGroupDocument,
						variables: {
							groupId: chat.groupId,
							filters: {}
						}
					}
				]
			: [])
	]

	const handleChangeChatInfo = async (
		chatName: string,
		description: string
	) => {
		try {
			await changeChatInfo({
				variables: { chatId, data: { chatName, description } },
				refetchQueries: chatListRefetchQueries,
				awaitRefetchQueries: true
			})
			await refetchChat()
			return true
		} catch (error) {
			Alert.alert(
				'РћС€РёР±РєР°',
				'РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ С‡Р°С‚Рµ'
			)
			return false
		}
	}

	const handleChangeAvatar = async (file: ReactNativeFile) => {
		try {
			await changeChatAvatar({
				variables: { chatId, avatar: file },
				refetchQueries: chatListRefetchQueries,
				awaitRefetchQueries: true
			})
			await refetchChat()
		} catch (error) {
			Alert.alert('РћС€РёР±РєР°', 'РќРµ СѓРґР°Р»РѕСЃСЊ РёР·РјРµРЅРёС‚СЊ Р°РІР°С‚Р°СЂ')
		}
	}

	const handleRemoveAvatar = async () => {
		try {
			await removeChatAvatar({
				variables: { chatId },
				refetchQueries: chatListRefetchQueries,
				awaitRefetchQueries: true
			})
			await refetchChat()
		} catch (error) {
			Alert.alert('РћС€РёР±РєР°', 'РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р°РІР°С‚Р°СЂ')
		}
	}

	const handleDeleteChat = async () => {
		try {
			await deleteChat({ variables: { chatId } })
			return true
		} catch (error) {
			Alert.alert('РћС€РёР±РєР°', 'РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ С‡Р°С‚')
			return false
		}
	}

	const handleInviteMember = async (targetUserId: string) => {
		try {
			await inviteMemberMutation({
				variables: { chatId, targetUserId }
			})
			refetchChat()
		} catch (error) {
			Alert.alert(
				'РћС€РёР±РєР°',
				'РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРёРіР»Р°СЃРёС‚СЊ СѓС‡Р°СЃС‚РЅРёРєР°'
			)
		}
	}

	const handleRemoveMember = async (targetUserId: string) => {
		try {
			await removeMemberMutation({
				variables: { chatId, targetUserId }
			})
			refetchChat()
		} catch (error) {
			Alert.alert(
				'РћС€РёР±РєР°',
				'РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ СѓС‡Р°СЃС‚РЅРёРєР°'
			)
		}
	}

	const refreshChatSettings = async () => {
		const tasks: Promise<unknown>[] = [refetchChat()]
		if (!isDM) {
			tasks.push(refetchRoles(), refetchMemberRole())
		}
		await Promise.allSettled(tasks)
	}

	return {
		chat,
		chatError,
		members,
		isLoadingChat,
		isLoadingMemberRole,
		currentRole,
		roles,
		isLoadingRoles,
		userRoles,

		isUpserting,
		isDeleting,
		isAssigning,
		isRemoving,
		isChangingInfo,
		isChangingAvatar,
		isRemovingAvatar,
		isDeletingChat,

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
		handleChangeChatInfo,
		handleChangeAvatar,
		handleRemoveAvatar,
		handleDeleteChat,
		handleInviteMember,
		handleRemoveMember,
		refreshChatSettings,

		getPermCount,
		getRoleForUser,
		getMembersWithRole
	}
}
