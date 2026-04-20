import { useFocusEffect } from '@react-navigation/native'
import { ArrowLeft, LogOut, Shield } from 'lucide-react-native'
import React, {
	FC,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EntityAvatar from '@/components/ui/EntityAvatar'
import ProtectedScreenState from '@/components/ui/ProtectedScreenState'

import {
	getGraphQLErrorMessage,
	isChatMembershipRevokedError,
	isDirectContactBlockedError,
	isUnauthorizedError
} from '@/hooks/useBlockedUsers'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'

import { resetToAuth, resetToHome } from '@/navigation/navigate'

import ChatInviteMemberModal from '../chat-settings/ChatInviteMemberModal'

import ChatSkeleton from './ChatSkeleton'
import ChatMessageList from './message/default/list/ChatMessageList'
import SendMessageForm from './message/default/send/SendMessageForm'
import {
	ChatPermissionEnum,
	useChatAssignedRoleSubscription,
	useChatDeletedRoleSubscription,
	useChatDeletedSubscription,
	useChatRemovedRoleSubscription,
	useChatUpsertedRoleSubscription,
	useGetMemberChatRoleQuery,
	useGroupDeletedSubscription,
	useInviteMemberToChatMutation,
	useLeaveChatMutation
} from '@/graphql/generated/output'

type DefaultChatProps = {
	chatId: string
	chatName: string
	groupId?: string
	isSecret: boolean
}

const DefaultChat: FC<DefaultChatProps> = ({
	chatId,
	chatName,
	groupId,
	isSecret
}) => {
	const { isLoadingProfile, user } = useCurrentUser()
	const { isAuthenticated } = useAuth()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()
	const isKeyboardVisible = useKeyboardVisible()
	const navigation = useTypedNavigation()
	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [hasBlockedRuntimeError, setHasBlockedRuntimeError] = useState(false)
	const { userId } = useUser()

	const [leaveChatMutation] = useLeaveChatMutation()
	const [inviteMemberMutation] = useInviteMemberToChatMutation()

	const {
		filesEdited,
		setFilesEdited,
		pinnedMessage,
		setPinnedMessage,
		reloadChat,
		isLoadingFindChat,
		startEdit,
		handleAddForwardedMessage,
		handleClearForm,
		setForwardedMessages,
		draftText,
		pickAndSendFile,
		pickAndSendImage,
		forwardedMessages,
		handleDelete,
		files,
		hasPendingUploads,
		isLoadingSendFile,
		handleClearMessageId,
		editId,
		setEditId,
		chat,
		findChatError
	} = useChat(chatId, {
		onBlockedError: () => {
			setHasBlockedRuntimeError(true)
		}
	})

	const { typingUsernames, sendTyping } = useTypingIndicator(chatId, userId)
	const handledAccessLossRef = useRef(false)

	const isGroup = !!(chat as any)?.isGroup
	const effectiveGroupId = groupId ?? chat?.groupId ?? undefined
	const resolvedChatName =
		isGroup && chat?.chatName ? chat.chatName : chatName
	const resolvedAvatarUrl = isGroup && chat?.avatarUrl ? chat.avatarUrl : null
	const isCheckingAccess = isLoadingFindChat || isLoadingProfile
	const isBlockedChatAccess =
		!isLoadingFindChat &&
		(hasBlockedRuntimeError || isDirectContactBlockedError(findChatError))
	const isAuthRequired =
		!isAuthenticated ||
		(!isLoadingProfile && !user) ||
		(!isLoadingFindChat && isUnauthorizedError(findChatError))
	const isAccessDenied =
		!isLoadingFindChat &&
		!isBlockedChatAccess &&
		isChatMembershipRevokedError(findChatError)

	const handleAccessLoss = useCallback(
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

	const { data: roleData, refetch: refetchMemberRole } =
		useGetMemberChatRoleQuery({
			variables: { chatId },
			skip: !isGroup,
			fetchPolicy: 'network-only'
		})

	const refreshMemberRole = useCallback(() => {
		if (!isGroup) return
		void refetchMemberRole()
	}, [isGroup, refetchMemberRole])

	const handleRefresh = useCallback(async () => {
		await Promise.allSettled([
			reloadChat(),
			isGroup ? refetchMemberRole() : Promise.resolve(null)
		])
	}, [isGroup, refetchMemberRole, reloadChat])

	useFocusEffect(
		useCallback(() => {
			void reloadChat()
			refreshMemberRole()
		}, [refreshMemberRole, reloadChat])
	)

	useEffect(() => {
		if (!isAuthRequired) return
		resetToAuth()
	}, [isAuthRequired])

	useChatDeletedSubscription({
		variables: {
			groupId: effectiveGroupId ?? '',
			userId
		},
		skip: !userId,
		onData: ({ data }) => {
			if (data.data?.chatDeleted.id !== chatId) return
			handleAccessLoss('chat')
		}
	})

	useGroupDeletedSubscription({
		variables: { userId },
		skip: !(userId && effectiveGroupId),
		onData: ({ data }) => {
			if (data.data?.groupDeleted.id !== effectiveGroupId) return
			handleAccessLoss('group')
		}
	})

	useChatAssignedRoleSubscription({
		variables: { chatId },
		skip: !isGroup,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatRemovedRoleSubscription({
		variables: { chatId },
		skip: !isGroup,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatUpsertedRoleSubscription({
		variables: { chatId },
		skip: !isGroup,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatDeletedRoleSubscription({
		variables: { chatId },
		skip: !isGroup,
		onData: () => {
			refreshMemberRole()
		}
	})

	const messagePermissions = useMemo(() => {
		if (!isGroup) {
			return {
				canSendMessages: true,
				canEditMessages: true,
				canDeleteMessages: true,
				canPinMessages: true
			}
		}
		const role = roleData?.getMemberChatRole
		if (role?.isCreator) {
			return {
				canSendMessages: true,
				canEditMessages: true,
				canDeleteMessages: true,
				canPinMessages: true
			}
		}
		const perms = role?.permissions ?? []
		return {
			canSendMessages: perms.includes(ChatPermissionEnum.SendMessages),
			canEditMessages: perms.includes(ChatPermissionEnum.EditMessages),
			canDeleteMessages: perms.includes(
				ChatPermissionEnum.DeleteMessages
			),
			canPinMessages: perms.includes(ChatPermissionEnum.PinMessages)
		}
	}, [isGroup, roleData])

	const isCreator = !!roleData?.getMemberChatRole?.isCreator
	const canInviteMembers =
		isGroup &&
		(isCreator ||
			(roleData?.getMemberChatRole?.permissions ?? []).includes(
				ChatPermissionEnum.InviteMembers
			))

	const members = (chat as any)?.members ?? []

	const renderBlockedState = () => (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.background,
				paddingTop: top + 8,
				paddingHorizontal: 20,
				paddingBottom: 24
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginBottom: 24
				}}
			>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					activeOpacity={0.7}
					style={{
						width: 40,
						height: 40,
						borderRadius: 20,
						backgroundColor: colors.backgroundSecondary,
						alignItems: 'center',
						justifyContent: 'center',
						marginRight: 12
					}}
				>
					<ArrowLeft size={20} color={colors.text} />
				</TouchableOpacity>
				<Text
					numberOfLines={1}
					style={{
						flex: 1,
						fontSize: 17,
						fontWeight: '700',
						color: colors.text
					}}
				>
					{chatName}
				</Text>
			</View>

			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<View
					style={{
						width: 72,
						height: 72,
						borderRadius: 36,
						backgroundColor: colors.backgroundSecondary,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Shield size={30} color={colors.destructive} />
				</View>

				<Text
					style={{
						marginTop: 20,
						fontSize: 20,
						fontWeight: '700',
						color: colors.text,
						textAlign: 'center'
					}}
				>
					{t('directChatUnavailable')}
				</Text>
				<Text
					style={{
						marginTop: 10,
						fontSize: 14,
						lineHeight: 20,
						color: colors.textMuted,
						textAlign: 'center'
					}}
				>
					{t('directChatBlockedDescription')}
				</Text>

				<TouchableOpacity
					onPress={() => navigation.navigate('BlockedUsers')}
					activeOpacity={0.7}
					style={{
						marginTop: 20,
						paddingHorizontal: 18,
						paddingVertical: 12,
						borderRadius: 12,
						backgroundColor: colors.accent
					}}
				>
					<Text
						style={{
							color: '#fff',
							fontWeight: '700',
							fontSize: 14
						}}
					>
						{t('manageBlockedUsers')}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => navigation.goBack()}
					activeOpacity={0.7}
					style={{
						marginTop: 12,
						paddingHorizontal: 18,
						paddingVertical: 12,
						borderRadius: 12,
						backgroundColor: colors.backgroundSecondary
					}}
				>
					<Text
						style={{
							color: colors.text,
							fontWeight: '700',
							fontSize: 14
						}}
					>
						{t('back')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)

	const handleLeaveChat = () => {
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
						navigation.goBack()
					} catch {
						Alert.alert(t('error') || 'Ошибка', t('leaveChatError'))
					}
				}
			}
		])
	}

	const handleInviteMember = async (targetUserId: string) => {
		try {
			await inviteMemberMutation({
				variables: { chatId, targetUserId }
			})
		} catch {
			Alert.alert(t('error') || 'Ошибка', t('leaveChatError'))
		}
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
		return <ChatSkeleton />
	}

	if (user && isBlockedChatAccess) {
		return renderBlockedState()
	}

	if (isAccessDenied) {
		return (
			<ProtectedScreenState
				title={t('accessDeniedTitle')}
				description={t('chatAccessDeniedDescription')}
				primaryActionLabel={t('goHome')}
				onPrimaryAction={resetToHome}
				secondaryActionLabel={navigation.canGoBack() ? t('back') : undefined}
				onSecondaryAction={navigation.canGoBack() ? () => navigation.goBack() : undefined}
			/>
		)
	}

	if (!isLoadingFindChat && !isLoadingProfile && !chat && findChatError) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={
					getGraphQLErrorMessage(findChatError) ||
					t('somethingWentWrong')
				}
				primaryActionLabel={t('retry')}
				onPrimaryAction={() => void handleRefresh()}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (!isLoadingFindChat && !isLoadingProfile && user && !chat) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={t('somethingWentWrong')}
				primaryActionLabel={t('retry')}
				onPrimaryAction={() => void handleRefresh()}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (!user || !chat) {
		return <ChatSkeleton />
	}

	const goToSettings = () => {
		navigation.navigate('ChatSettings', { chatId })
	}

	const goBack = () => {
		navigation.goBack()
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<View
				className='flex-1 overflow-hidden'
				style={{
					backgroundColor: colors.backgroundTertiary,
					paddingTop: top + 8
				}}
			>
				{/* Header */}
				<View
					className='flex-row items-center justify-between px-4'
					style={{
						height: 60,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight
					}}
				>
					<TouchableOpacity
						onPress={goBack}
						className='w-9 h-9 rounded-full items-center justify-center'
						style={{ backgroundColor: colors.cardHover }}
						activeOpacity={0.7}
					>
						<ArrowLeft size={18} color={colors.textSecondary} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={goToSettings}
						className='flex-row items-center flex-1 mx-3'
						activeOpacity={0.7}
					>
						<EntityAvatar
							size='default'
							name={resolvedChatName}
							avatarUrl={resolvedAvatarUrl}
						/>
						<View className='ml-2.5 flex-1'>
							<Text
								className='font-semibold'
								style={{
									color: colors.text,
									fontSize: 15
								}}
								numberOfLines={1}
							>
								{resolvedChatName}
							</Text>
							{typingUsernames.length > 0 ? (
								<Text
									numberOfLines={1}
									style={{
										color: colors.accent,
										fontSize: 11,
										marginTop: 1
									}}
								>
									{typingUsernames.join(', ') +
										' ' +
										t('typing')}
								</Text>
							) : null}
						</View>
					</TouchableOpacity>

					{isGroup && !isCreator && (
						<TouchableOpacity
							onPress={handleLeaveChat}
							className='w-9 h-9 rounded-full items-center justify-center'
							style={{
								backgroundColor: colors.cardHover,
								marginLeft: 6
							}}
							activeOpacity={0.7}
						>
							<LogOut size={18} color={colors.destructive} />
						</TouchableOpacity>
					)}
				</View>

				<KeyboardAvoidingView
					behavior='padding'
					style={{ flex: 1 }}
					keyboardVerticalOffset={0}
					enabled={Platform.OS === 'ios' || isKeyboardVisible}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						<ChatMessageList
							pinnedMessage={pinnedMessage}
							setPinnedMessage={setPinnedMessage}
							chatId={chatId}
							startEdit={startEdit}
							userId={user!.id}
							handleAddForwardedMessage={
								handleAddForwardedMessage
							}
							canSendMessages={messagePermissions.canSendMessages}
							canEditMessages={messagePermissions.canEditMessages}
							canDeleteMessages={
								messagePermissions.canDeleteMessages
							}
							canPinMessages={messagePermissions.canPinMessages}
							groupId={isGroup ? (chat.groupId ?? null) : null}
							onRefresh={handleRefresh}
						/>

						<SendMessageForm
							pickAndSendFile={pickAndSendFile}
							pickAndSendImage={pickAndSendImage}
							handleClearForm={handleClearForm}
							setForwardedMessages={setForwardedMessages}
							draftText={draftText}
							forwardedMessages={forwardedMessages}
							onDeleteFile={handleDelete}
							files={files}
							hasPendingUploads={hasPendingUploads}
							isLoadingSendFiles={isLoadingSendFile}
							chatId={chatId}
							clearMessageId={handleClearMessageId}
							editId={editId}
							setEditId={setEditId}
							filesEdited={filesEdited}
							setFilesEdited={setFilesEdited}
							canSendMessages={messagePermissions.canSendMessages}
							blockedStateMessage={
								hasBlockedRuntimeError
									? t('directChatBlockedDescription')
									: null
							}
							onBlockedError={() => {
								setHasBlockedRuntimeError(true)
							}}
							onTyping={sendTyping}
						/>
					</View>
				</KeyboardAvoidingView>
			</View>

			{isGroup && canInviteMembers && (
				<ChatInviteMemberModal
					isOpen={isInviteOpen}
					onClose={() => setIsInviteOpen(false)}
					onInvite={handleInviteMember}
					existingMemberIds={members.map(
						(m: any) => m.userId ?? m.user?.id
					)}
					groupId={chat?.groupId ?? null}
				/>
			)}
		</View>
	)
}

export default DefaultChat
