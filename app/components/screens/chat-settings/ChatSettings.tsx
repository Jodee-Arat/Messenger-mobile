import { useFocusEffect, useRoute } from '@react-navigation/native'
import { LogOut, ShieldCheck, Trash2 } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import ProtectedScreenState from '@/components/ui/ProtectedScreenState'
import SettingsSkeleton from '@/components/ui/SettingsSkeleton'

import {
	getGraphQLErrorMessage,
	isChatMembershipRevokedError,
	isUnauthorizedError
} from '@/hooks/useBlockedUsers'
import { useAuth } from '@/hooks/useAuth'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'
import { goBackOrHome, resetToAuth, resetToHome } from '@/navigation/navigate'

import { chatEvents } from '@/utils/chatEvents'
import { deleteSecretChat } from '@/utils/secret-chat/secretChat'

import {
	type ChatSettingsRouteParams,
	getChatPermissions
} from '../../../types/chat-role.type'

import ChatAssignRoleModal from './ChatAssignRoleModal'
import ChatCreateRoleModal from './ChatCreateRoleModal'
import ChatInfoCard from './ChatInfoCard'
import ChatInviteMemberModal from './ChatInviteMemberModal'
import ChatMembersSection from './ChatMembersSection'
import ChatRoleDetailModal from './ChatRoleDetailModal'
import ChatRolesSection from './ChatRolesSection'
import ChatSettingsHeader from './ChatSettingsHeader'
import { useChatSettings } from './useChatSettings'
import {
	ChatPermissionEnum,
	useChatDeletedSubscription,
	useGroupDeletedSubscription,
	useLeaveChatMutation,
	useToggleChatRequireTotpMutation
} from '@/graphql/generated/output'

const ChatSettings = () => {
	const route = useRoute()
	const navigation = useTypedNavigation()
	const { chatId } = route.params as ChatSettingsRouteParams
	const { userId } = useUser()
	const { isAuthenticated } = useAuth()
	const handledAccessLossRef = useRef(false)

	const { colors } = useTheme()
	const { t } = useTranslation()
	const PERMISSIONS = getChatPermissions(colors, t)

	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [leaveChatMutation] = useLeaveChatMutation()
	const [toggleRequireTotpMutation, { loading: togglingTotp }] =
		useToggleChatRequireTotpMutation()

	const {
		chat,
		chatError,
		members,
		isLoadingChat,
		isLoadingMemberRole,
		currentRole,
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
		handleChangeChatInfo,
		handleChangeAvatar,
		handleRemoveAvatar,
		handleDeleteChat,
		handleInviteMember,
		handleRemoveMember,
		refreshChatSettings,
		isChangingInfo,
		isChangingAvatar,
		isRemovingAvatar,
		getRoleForUser,
		getMembersWithRole
	} = useChatSettings(chatId)

	const handleChatAccessLoss = useCallback(
		(scope: 'chat' | 'group') => {
			if (handledAccessLossRef.current) return
			handledAccessLossRef.current = true

			if (scope === 'group') {
				resetToHome()
				return
			}

			if (navigation.canGoBack()) {
				navigation.goBack()
				return
			}

			resetToHome()
		},
		[navigation]
	)

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await refreshChatSettings()
		} finally {
			setIsRefreshing(false)
		}
	}, [refreshChatSettings])

	useFocusEffect(
		useCallback(() => {
			void refreshChatSettings()
		}, [refreshChatSettings])
	)

	useChatDeletedSubscription({
		variables: {
			groupId: chat?.groupId ?? '',
			userId
		},
		skip: !(userId && chat?.groupId),
		onData: ({ data }) => {
			if (data.data?.chatDeleted.id !== chatId) return
			handleChatAccessLoss('chat')
		}
	})

	useGroupDeletedSubscription({
		variables: { userId },
		skip: !(userId && chat?.groupId),
		onData: ({ data }) => {
			if (data.data?.groupDeleted.id !== chat?.groupId) return
			handleChatAccessLoss('group')
		}
	})

	const isCheckingAccess = isLoadingMemberRole || isLoadingChat
	const isAuthRequired =
		!isAuthenticated ||
		(!isCheckingAccess && isUnauthorizedError(chatError))
	const isAccessDenied =
		!isCheckingAccess && isChatMembershipRevokedError(chatError)
	const loadError = !isCheckingAccess && !isAccessDenied ? chatError : null

	useEffect(() => {
		if (!isAuthRequired) return
		resetToAuth()
	}, [isAuthRequired])

	// ── Permission checks ────────────────────────────────────
	const isCreator = !!currentRole?.isCreator
	const isDM = chat && !chat.isGroup

	const canManageRoles =
		currentRole?.permissions?.includes(ChatPermissionEnum.ManageRoles) ||
		currentRole?.isCreator

	const canCreateRoles =
		currentRole?.permissions?.includes(ChatPermissionEnum.CreateRoles) ||
		currentRole?.isCreator

	const canChangeRoleInfo =
		currentRole?.permissions?.includes(ChatPermissionEnum.ChangeRoleInfo) ||
		currentRole?.isCreator

	const canDeleteRoles =
		currentRole?.permissions?.includes(ChatPermissionEnum.DeleteRoles) ||
		currentRole?.isCreator

	const canChangeChatInfo =
		currentRole?.permissions?.includes(ChatPermissionEnum.ChangeChatInfo) ||
		currentRole?.isCreator

	const canChangeChatName =
		currentRole?.permissions?.includes(ChatPermissionEnum.ChangeChatName) ||
		currentRole?.isCreator

	const canChangeChatAvatar =
		currentRole?.permissions?.includes(
			ChatPermissionEnum.ChangeChatAvatar
		) ||
		currentRole?.isCreator

	const canInviteMembers =
		currentRole?.permissions?.includes(ChatPermissionEnum.InviteMembers) ||
		currentRole?.isCreator

	const canRemoveMembers =
		currentRole?.permissions?.includes(ChatPermissionEnum.RemoveMembers) ||
		currentRole?.isCreator

	const canAccessRoles =
		!!canManageRoles ||
		!!canCreateRoles ||
		!!canDeleteRoles ||
		!!canChangeRoleInfo

	const isSavingChatInfo =
		isChangingInfo || isChangingAvatar || isRemovingAvatar

	const chatName = chat?.chatName ?? t('chatFallback')

	const onDeleteChat = () => {
		Alert.alert(
			t('deleteChat') || 'Удалить чат',
			t('deleteChatConfirm') ||
				'Вы уверены, что хотите удалить этот чат?',
			[
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('deleteChat') || 'Удалить',
					style: 'destructive',
					onPress: async () => {
						const success = await handleDeleteChat()
						if (success) {
							goBackOrHome(navigation)
						}
					}
				}
			]
		)
	}

	const onLeaveChat = () => {
		Alert.alert(t('leaveChat'), t('leaveChatConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('leaveChat'),
				style: 'destructive',
				onPress: async () => {
					try {
						await leaveChatMutation({
							variables: { chatId }
						})
						chatEvents.emitLeave(chatId)
						if (chat?.isSecret && chat.groupId) {
							await deleteSecretChat(chat.groupId, chatId)
						}
						goBackOrHome(navigation)
					} catch {
						Alert.alert(t('error') || 'Ошибка', t('leaveChatError'))
					}
				}
			}
		])
	}

	if (isAuthRequired) {
		return (
			<ProtectedScreenState
				variant='auth'
				title={t('authRequiredTitle')}
				description={t('authRequiredDescription')}
				primaryActionLabel={t('goToLogin')}
				onPrimaryAction={resetToAuth}
			/>
		)
	}

	if (isCheckingAccess) {
		return <SettingsSkeleton />
	}

	if (isAccessDenied) {
		return (
			<ProtectedScreenState
				title={t('accessDeniedTitle')}
				description={t('settingsAccessDeniedDescription')}
				primaryActionLabel={t('goHome')}
				onPrimaryAction={resetToHome}
				secondaryActionLabel={navigation.canGoBack() ? t('back') : undefined}
				onSecondaryAction={navigation.canGoBack() ? () => navigation.goBack() : undefined}
			/>
		)
	}

	if (!isLoadingMemberRole && !isLoadingChat && loadError && !chat) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={
					getGraphQLErrorMessage(loadError) ||
					t('somethingWentWrong')
				}
				primaryActionLabel={t('retry')}
				onPrimaryAction={() => void handleRefresh()}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (!isLoadingMemberRole && !isLoadingChat && !chat) {
		return (
			<ProtectedScreenState
				title={t('accessDeniedTitle')}
				description={t('settingsAccessDeniedDescription')}
				primaryActionLabel={t('goHome')}
				onPrimaryAction={resetToHome}
				secondaryActionLabel={navigation.canGoBack() ? t('back') : undefined}
				onSecondaryAction={navigation.canGoBack() ? () => navigation.goBack() : undefined}
			/>
		)
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<ChatSettingsHeader chatName={chatName} />
			{isCheckingAccess ? (
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
						<ChatInfoCard
							chat={chat}
							isLoading={isLoadingChat}
							membersCount={members.length}
							canChangeChatInfo={!!canChangeChatInfo}
							canChangeChatName={!!canChangeChatName}
							canChangeChatAvatar={!!canChangeChatAvatar}
							onSaveInfo={handleChangeChatInfo}
							onChangeAvatar={handleChangeAvatar}
							onRemoveAvatar={handleRemoveAvatar}
							isSaving={isSavingChatInfo}
						/>

						{/* TOTP Requirement — only creator, only secret chats */}
						{isCreator && chat?.isSecret && (
							<View
								className='mx-4 mt-3 rounded-xl px-4 py-3'
								style={{
									backgroundColor: colors.card,
									borderWidth: 1,
									borderColor: colors.borderLight
								}}
							>
								<View className='flex-row items-center justify-between'>
									<View className='flex-1 mr-3'>
										<View className='flex-row items-center mb-1'>
											<ShieldCheck
												size={16}
												color={colors.accent}
												style={{ marginRight: 6 }}
											/>
											<Text
												className='font-semibold text-sm'
												style={{ color: colors.text }}
											>
												{t('requireTotpLabel')}
											</Text>
										</View>
										<Text
											className='text-xs'
											style={{
												color: colors.textSecondary
											}}
										>
											{t('requireTotpHint')}
										</Text>
									</View>
									<Switch
										value={!!chat?.requireTotp}
										disabled={togglingTotp}
										onValueChange={async (val: boolean) => {
											try {
												await toggleRequireTotpMutation(
													{
														variables: {
															chatId,
															enable: val
														},
														refetchQueries: [
															'FindChatByChatId'
														]
													}
												)
											} catch (err: any) {
												Alert.alert(
													t('error') || 'Ошибка',
													err?.message ??
														t(
															'requireTotpAllMembers'
														)
												)
											}
										}}
										trackColor={{
											false: colors.borderLight,
											true: colors.accent
										}}
										thumbColor='#fff'
									/>
								</View>
							</View>
						)}

						{!isDM && canAccessRoles && (
							<ChatRolesSection
								roles={roles}
								permissions={PERMISSIONS}
								onRolePress={setSelectedRole}
								onCreatePress={() => setIsCreateRoleOpen(true)}
								canCreateRoles={!!canCreateRoles}
							/>
						)}

						<ChatMembersSection
							members={members}
							roles={roles}
							isLoading={isLoadingChat}
							getRoleForUser={getRoleForUser}
							onMemberPress={setAssignUserId}
							canManageRoles={!!canManageRoles}
							canInviteMembers={!!canInviteMembers}
							canRemoveMembers={!!canRemoveMembers}
							onInvitePress={() => setIsInviteOpen(true)}
							onRemoveMember={handleRemoveMember}
						/>

						{/* Delete Chat — creator or DM */}
						{(isCreator || isDM) && (
							<View className='mt-4 px-4 mb-4'>
								<TouchableOpacity
									onPress={onDeleteChat}
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
										{t('deleteChat') || 'Удалить чат'}
									</Text>
								</TouchableOpacity>
							</View>
						)}

						{/* Leave Chat — non-creator, group chats only */}
						{!isCreator && !isDM && (
							<View className='mt-4 px-4 mb-4'>
								<TouchableOpacity
									onPress={onLeaveChat}
									activeOpacity={0.7}
									className='flex-row items-center justify-center py-3.5 rounded-xl'
									style={{
										backgroundColor:
											colors.destructiveMuted,
										borderWidth: 1,
										borderColor: colors.destructive
									}}
								>
									<LogOut
										size={18}
										color={colors.destructive}
										style={{ marginRight: 8 }}
									/>
									<Text
										className='text-sm font-bold'
										style={{ color: colors.destructive }}
									>
										{t('leaveChat')}
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</ScrollView>

					{!isDM && canCreateRoles && (
						<ChatCreateRoleModal
							isOpen={isCreateRoleOpen}
							onClose={() => setIsCreateRoleOpen(false)}
							onCreateRole={handleCreateRole}
						/>
					)}

					{!isDM && canAccessRoles && (
						<ChatRoleDetailModal
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
					)}

					{!isDM && (
						<ChatAssignRoleModal
							userId={assignUserId}
							roles={roles}
							userRoles={userRoles}
							members={members}
							onAssign={handleAssignRole}
							onClose={() => setAssignUserId(null)}
						/>
					)}

					{!isDM && (
						<ChatInviteMemberModal
							isOpen={isInviteOpen}
							onClose={() => setIsInviteOpen(false)}
							onInvite={handleInviteMember}
							existingMemberIds={members.map(m => m.user.id)}
							groupId={chat?.groupId ?? null}
						/>
					)}
				</>
			)}
		</View>
	)
}

export default ChatSettings
