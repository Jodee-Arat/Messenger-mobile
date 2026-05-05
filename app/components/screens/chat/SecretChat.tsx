import { useFocusEffect } from '@react-navigation/native'
import {
	ArrowLeft,
	Fingerprint,
	Lock,
	LogOut,
	Settings2,
	ShieldCheck,
	UserPlus
} from 'lucide-react-native'
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
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import EntityAvatar from '@/components/ui/EntityAvatar'
import Loader from '@/components/ui/Loader'
import ProtectedScreenState from '@/components/ui/ProtectedScreenState'

import {
	getGraphQLErrorMessage,
	isChatMembershipRevokedError,
	isDirectContactBlockedError,
	isUnauthorizedError
} from '@/hooks/useBlockedUsers'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import { useSecretChat } from '@/hooks/useSecretChat'
import { DM_STORAGE_GROUP_ID } from '@/hooks/useSecretChat.actions'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'
import { deleteSecretChat } from '@/utils/secret-chat/secretChat'

import { resetToAuth, resetToHome } from '@/navigation/navigate'

import ChatInviteMemberModal from '../chat-settings/ChatInviteMemberModal'

import ChatSkeleton from './ChatSkeleton'
import FingerprintVerificationModal from './FingerprintVerificationModal'
import SecretChatMessageList from './message/secret/list/SecretChatMessageList'
import SecretSendMessageForm from './message/secret/send/SecretSendMessageForm'
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
	useLeaveChatMutation,
	useVerifyChatTotpMutation
} from '@/graphql/generated/output'

type SecretChatProps = {
	chatId: string
	chatName: string
	groupId?: string
	isSecret?: boolean
	isSaved?: boolean
}

const SecretChat: FC<SecretChatProps> = ({
	chatId,
	chatName,
	groupId,
	isSecret,
	isSaved = false
}) => {
	const isDM = !groupId
	const isDirectDialog = isDM && !isSaved
	const { isLoadingProfile, user } = useCurrentUser()
	const { isAuthenticated } = useAuth()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()
	const { userId } = useUser()
	const isKeyboardVisible = useKeyboardVisible()
	const navigation = useTypedNavigation()
	const [rolesVisible, setRolesVisible] = useState(false)
	const [fingerprintVisible, setFingerprintVisible] = useState(false)
	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [totpVerified, setTotpVerified] = useState(false)
	const [totpCode, setTotpCode] = useState('')
	const [totpError, setTotpError] = useState('')
	const handledAccessLossRef = useRef(false)
	const hasFocusedOnceRef = useRef(false)

	const lockColor = isDirectDialog ? '#4CAF50' : colors.accent

	const [leaveChatMutation] = useLeaveChatMutation()
	const [verifyChatTotpMutation, { loading: totpLoading }] =
		useVerifyChatTotpMutation()
	const [inviteMemberMutation] = useInviteMemberToChatMutation()

	const {
		data: roleData,
		loading: isLoadingMemberRole,
		refetch: refetchMemberRole
	} =
		useGetMemberChatRoleQuery({
			variables: { chatId },
			skip: isDM || isSaved,
			fetchPolicy: 'network-only'
		})

	const refreshMemberRole = useCallback(() => {
		if (isDM) return
		void refetchMemberRole()
	}, [isDM, refetchMemberRole])

	useChatAssignedRoleSubscription({
		variables: { chatId },
		skip: isDM || isSaved,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatRemovedRoleSubscription({
		variables: { chatId },
		skip: isDM || isSaved,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatUpsertedRoleSubscription({
		variables: { chatId },
		skip: isDM || isSaved,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatDeletedRoleSubscription({
		variables: { chatId },
		skip: isDM || isSaved,
		onData: () => {
			refreshMemberRole()
		}
	})

	const isCreator = !!roleData?.getMemberChatRole?.isCreator
	const messagePermissions = useMemo(() => {
		if (isDM || isSaved) {
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
	}, [isDM, isSaved, roleData])
	const canInviteMembers =
		!isDM &&
		!isSaved &&
		(isCreator ||
			(roleData?.getMemberChatRole?.permissions ?? []).includes(
				ChatPermissionEnum.InviteMembers
			))

	const {
		chat,
		clearForm,
		deleteMessage,
		draftText,
		files,
		isSendingFiles,
		messages,
		loadingMessage,
		pickFile,
		pickImage,
		removeFile,
		reload,
		sendMessage,
		errorMessage,
		chatAccessError,
		setDraftText,
		preKeysPub,
		sendKeyToNewMember,
		isKeyReady
	} = useSecretChat(chatId, userId, groupId, { isSaved })

	useFocusEffect(
		useCallback(() => {
			if (!hasFocusedOnceRef.current) {
				hasFocusedOnceRef.current = true
				return
			}

			void reload()
			refreshMemberRole()
		}, [refreshMemberRole, reload])
	)

	const handleRefresh = useCallback(async () => {
		await reload()
	}, [reload])
	const members = (chat as any)?.members ?? [
		{ user: { id: user?.id, username: user?.username, avatarUrl: null } }
	]
	const directCounterpart = isDirectDialog
		? members.find((member: any) => member.user?.id !== user?.id)?.user ?? null
		: null
	const resolvedChatName = isSaved
		? chatName
		: !isDM
		? chat && 'chatName' in chat && chat.chatName
			? chat.chatName
			: chatName
		: directCounterpart?.username || chatName
	const resolvedAvatarUrl = isSaved
		? null
		: !isDM
		? chat && 'avatarUrl' in chat && chat.avatarUrl
			? chat.avatarUrl
			: null
		: directCounterpart?.avatarUrl || null

	const handleAccessLoss = useCallback(
		async (scope: 'chat' | 'group') => {
			if (handledAccessLossRef.current) return
			handledAccessLossRef.current = true

			if (groupId) {
				await deleteSecretChat(groupId, chatId)
			}

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
		[chatId, groupId, navigation]
	)

	const isCheckingAccess =
		loadingMessage !== '' || isLoadingProfile || (!isDM && isLoadingMemberRole)
	const isBlockedSecretChatAccess =
		!isCheckingAccess &&
		isDirectDialog &&
		(isDirectContactBlockedError(chatAccessError) ||
			isDirectContactBlockedError(errorMessage))
	const isAuthRequired =
		!isAuthenticated ||
		(!isLoadingProfile && !user) ||
		(!isCheckingAccess && isUnauthorizedError(chatAccessError)) ||
		(!isCheckingAccess && isUnauthorizedError(errorMessage))
	const isAccessDenied =
		!isCheckingAccess &&
		!isBlockedSecretChatAccess &&
		(isChatMembershipRevokedError(chatAccessError) ||
			isChatMembershipRevokedError(errorMessage))
	const shouldShowBlockedInlineState =
		isBlockedSecretChatAccess && !chat && !isSaved

	useEffect(() => {
		if (!isBlockedSecretChatAccess) return
		void deleteSecretChat(DM_STORAGE_GROUP_ID, chatId)
	}, [chatId, isBlockedSecretChatAccess])

	useEffect(() => {
		if (!isAuthRequired) return
		resetToAuth()
	}, [isAuthRequired])

	useChatDeletedSubscription({
		variables: {
			groupId: groupId ?? '',
			userId
		},
		skip: !userId,
		onData: ({ data }) => {
			if (data.data?.chatDeleted.id !== chatId) return
			void handleAccessLoss('chat')
		}
	})

	useGroupDeletedSubscription({
		variables: { userId },
		skip: !(userId && groupId),
		onData: ({ data }) => {
			if (data.data?.groupDeleted.id !== groupId) return
			void handleAccessLoss('group')
		}
	})

	const renderBlockedInlineState = () => (
		<View
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 20,
				paddingVertical: 24
			}}
		>
			<View
				style={{
					width: '100%',
					maxWidth: 420,
					borderRadius: 20,
					paddingHorizontal: 20,
					paddingVertical: 22,
					backgroundColor: colors.card,
					borderWidth: 1,
					borderColor: colors.borderLight,
					alignItems: 'center'
				}}
			>
				<View
					style={{
						width: 56,
						height: 56,
						borderRadius: 28,
						backgroundColor: colors.destructiveMuted,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<ShieldCheck size={24} color={colors.destructive} />
				</View>

				<Text
					style={{
						marginTop: 16,
						fontSize: 18,
						fontWeight: '700',
						color: colors.text,
						textAlign: 'center'
					}}
				>
					{t('directChatUnavailable')}
				</Text>
				<Text
					style={{
						marginTop: 8,
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
						marginTop: 18,
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
						// Clean up local secret chat keys & messages
						if (groupId) {
							await deleteSecretChat(groupId, chatId)
						}
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
			await sendKeyToNewMember(targetUserId)
		} catch {
			Alert.alert(t('error') || 'Ошибка', t('leaveChatError'))
		}
	}

	const shouldShowSecretSetupState =
		!isDM && !isLoadingProfile && !!user && !!chat && !isKeyReady

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

	if (errorMessage !== '' && !isBlockedSecretChatAccess) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={errorMessage || t('somethingWentWrong')}
				primaryActionLabel={t('retry')}
				onPrimaryAction={() => void handleRefresh()}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (chatAccessError && !chat && !isBlockedSecretChatAccess) {
		return (
			<ProtectedScreenState
				variant='error'
				title={t('screenLoadErrorTitle')}
				description={
					getGraphQLErrorMessage(chatAccessError) ||
					t('somethingWentWrong')
				}
				primaryActionLabel={t('retry')}
				onPrimaryAction={() => void handleRefresh()}
				secondaryActionLabel={t('goHome')}
				onSecondaryAction={resetToHome}
			/>
		)
	}

	if (
		loadingMessage === '' &&
		!isLoadingProfile &&
		!!user &&
		!chat &&
		!chatAccessError &&
		!isBlockedSecretChatAccess
	) {
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

	if (shouldShowSecretSetupState) {
		return (
			<View
				className='flex-1 items-center justify-center'
				style={{ backgroundColor: colors.background }}
			>
				<Loader />
			</View>
		)
	}

	if (!user || ((!chat || (!isDM && !isKeyReady)) && !isBlockedSecretChatAccess)) {
		return <ChatSkeleton />
	}

	const handleVerifyTotp = async () => {
		setTotpError('')
		try {
			const { data } = await verifyChatTotpMutation({
				variables: { chatId, code: totpCode }
			})
			if (data?.verifyChatTotp) {
				setTotpVerified(true)
			} else {
				setTotpError(t('totpInvalidCode'))
			}
		} catch {
			setTotpError(t('totpVerifyError'))
		}
	}

	if ((chat as any).requireTotp && !totpVerified) {
		return (
			<View
				className='flex-1'
				style={{ backgroundColor: colors.background }}
			>
				<View
					className='flex-1 items-center justify-center px-6'
					style={{ paddingTop: top + 8 }}
				>
					<View
						className='w-16 h-16 rounded-full items-center justify-center mb-4'
						style={{ backgroundColor: colors.accent + '20' }}
					>
						<ShieldCheck size={32} color={colors.accent} />
					</View>
					<Text
						className='text-lg font-bold mb-2 text-center'
						style={{ color: colors.text }}
					>
						{t('totpRequired')}
					</Text>
					<Text
						className='text-sm mb-6 text-center'
						style={{ color: colors.textSecondary }}
					>
						{t('totpRequiredHint')}
					</Text>
					<TextInput
						className='w-full rounded-xl px-4 py-3 text-center text-lg mb-3'
						style={{
							backgroundColor: colors.card,
							color: colors.text,
							borderWidth: 1,
							borderColor: totpError
								? colors.destructive
								: colors.borderLight,
							letterSpacing: 8
						}}
						placeholder='000000'
						placeholderTextColor={colors.textSecondary}
						keyboardType='number-pad'
						maxLength={6}
						value={totpCode}
						onChangeText={text => {
							setTotpCode(text)
							setTotpError('')
						}}
						autoFocus
					/>
					{totpError !== '' && (
						<Text
							className='text-sm mb-3'
							style={{ color: colors.destructive }}
						>
							{totpError}
						</Text>
					)}
					<TouchableOpacity
						onPress={handleVerifyTotp}
						disabled={totpCode.length !== 6 || totpLoading}
						className='w-full rounded-xl py-3 items-center justify-center'
						style={{
							backgroundColor:
								totpCode.length === 6
									? colors.accent
									: colors.accent + '50',
							opacity: totpLoading ? 0.7 : 1
						}}
						activeOpacity={0.8}
					>
						{totpLoading ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text
								className='font-semibold text-base'
								style={{ color: '#fff' }}
							>
								{t('totpVerify')}
							</Text>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className='mt-4'
						activeOpacity={0.7}
					>
						<Text style={{ color: colors.textSecondary }}>
							{t('back')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	const goToSettings = () => {
		navigation.navigate('ChatSettings', { chatId })
	}

	const goBack = () => {
		navigation.goBack()
	}

	const handleSend = async (text?: string) => {
		const messageText = text ?? draftText
		return await sendMessage(messageText, user)
	}

	const canOpenSettings = !!chat && !isBlockedSecretChatAccess && !isSaved

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
						onPress={canOpenSettings ? goToSettings : undefined}
						disabled={!canOpenSettings}
						activeOpacity={0.7}
						style={{ opacity: canOpenSettings ? 1 : 0.85 }}
						className='flex-row items-center flex-1 mx-3'
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
							<View className='flex-row items-center mt-0.5'>
								<Lock size={10} color={lockColor} />
								<Text
									className='ml-1'
									style={{
										color: lockColor,
										fontSize: 11
									}}
								>
									{t('secretChat')}
								</Text>
							</View>
						</View>
					</TouchableOpacity>

					{chat && !isSaved && (
						<TouchableOpacity
							onPress={() => setFingerprintVisible(true)}
							className='w-9 h-9 rounded-full items-center justify-center'
							style={{
								backgroundColor: colors.cardHover,
								marginLeft: !isDM ? 6 : 0
							}}
							activeOpacity={0.7}
						>
							<Fingerprint size={18} color={colors.success} />
						</TouchableOpacity>
					)}

					{!isDM && !isCreator && !isSaved && (
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

				{/* Messages */}
				<KeyboardAvoidingView
					behavior='padding'
					style={{ flex: 1 }}
					keyboardVerticalOffset={0}
					enabled={Platform.OS === 'ios' || isKeyboardVisible}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						{shouldShowBlockedInlineState ? (
							renderBlockedInlineState()
						) : (
							<SecretChatMessageList
								messages={messages}
								userId={user.id}
								onDelete={deleteMessage}
								onRefresh={handleRefresh}
								chatId={chatId}
								canDeleteMessages={
									messagePermissions.canDeleteMessages
								}
								showSenderName={!isDM && !isSaved}
								isUnifiedThread={isSaved}
							/>
						)}

						<SecretSendMessageForm
							setDraftText={setDraftText}
							chatId={chatId}
							draftText={draftText}
							setEditId={() => {}}
							editId={null}
							files={files}
							filesEdited={[]}
							isSendingFiles={isSendingFiles}
							setFilesEdited={() => {}}
							pickAndSendFile={pickFile}
							pickAndSendImage={pickImage}
							onDeleteFile={removeFile}
							clearMessageId={clearForm}
							forwardedMessages={[]}
							setForwardedMessages={() => {}}
							handleClearForm={clearForm}
							canSendMessages={
								messagePermissions.canSendMessages
							}
							blockedStateMessage={
								isBlockedSecretChatAccess
									? t('directChatBlockedComposer')
									: messagePermissions.canSendMessages
										? null
										: t('noSendPermission')
							}
							onSend={handleSend}
						/>
					</View>
				</KeyboardAvoidingView>
			</View>

			<FingerprintVerificationModal
				visible={fingerprintVisible}
				onClose={() => setFingerprintVisible(false)}
				members={members}
				preKeysPub={preKeysPub}
				currentUserId={user.id}
			/>
		</View>
	)
}

export default SecretChat
