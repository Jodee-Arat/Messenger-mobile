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
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
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

import {
	isChatMembershipRevokedError,
	isDirectContactBlockedError
} from '@/hooks/useBlockedUsers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import { useSecretChat } from '@/hooks/useSecretChat'
import { DM_STORAGE_GROUP_ID } from '@/hooks/useSecretChat.actions'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'
import { deleteSecretChat } from '@/utils/secret-chat/secretChat'

import { resetToHome } from '@/navigation/navigate'

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
}

const SecretChat: FC<SecretChatProps> = ({
	chatId,
	chatName,
	groupId,
	isSecret
}) => {
	const isDM = !groupId
	const { isLoadingProfile, user } = useCurrentUser()
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

	const lockColor = isDM ? '#4CAF50' : colors.accent

	const [leaveChatMutation] = useLeaveChatMutation()
	const [verifyChatTotpMutation, { loading: totpLoading }] =
		useVerifyChatTotpMutation()
	const [inviteMemberMutation] = useInviteMemberToChatMutation()

	const { data: roleData, refetch: refetchMemberRole } =
		useGetMemberChatRoleQuery({
			variables: { chatId },
			skip: isDM,
			fetchPolicy: 'network-only'
		})

	const refreshMemberRole = useCallback(() => {
		if (isDM) return
		void refetchMemberRole()
	}, [isDM, refetchMemberRole])

	useChatAssignedRoleSubscription({
		variables: { chatId },
		skip: isDM,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatRemovedRoleSubscription({
		variables: { chatId },
		skip: isDM,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatUpsertedRoleSubscription({
		variables: { chatId },
		skip: isDM,
		onData: () => {
			refreshMemberRole()
		}
	})

	useChatDeletedRoleSubscription({
		variables: { chatId },
		skip: isDM,
		onData: () => {
			refreshMemberRole()
		}
	})

	const isCreator = !!roleData?.getMemberChatRole?.isCreator
	const canInviteMembers =
		!isDM &&
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
	} = useSecretChat(chatId, userId, groupId)

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
	const resolvedChatName =
		!isDM && chat && 'chatName' in chat && chat.chatName
			? chat.chatName
			: chatName
	const resolvedAvatarUrl =
		!isDM && chat && 'avatarUrl' in chat && chat.avatarUrl
			? chat.avatarUrl
			: null

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

	const isBlockedSecretChatAccess =
		isDM &&
		(isDirectContactBlockedError(chatAccessError) ||
			isDirectContactBlockedError(errorMessage))

	useEffect(() => {
		if (!isBlockedSecretChatAccess) return
		void deleteSecretChat(DM_STORAGE_GROUP_ID, chatId)
	}, [chatId, isBlockedSecretChatAccess])

	useEffect(() => {
		if (isBlockedSecretChatAccess) return
		if (!isChatMembershipRevokedError(chatAccessError)) return

		void handleAccessLoss('chat')
	}, [chatAccessError, handleAccessLoss, isBlockedSecretChatAccess])

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
					<ShieldCheck size={30} color={colors.destructive} />
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

	if (isBlockedSecretChatAccess) {
		return renderBlockedState()
	}

	if (errorMessage !== '') {
		return (
			<View
				className='flex-1 justify-center items-center'
				style={{ backgroundColor: colors.background }}
			>
				<Text style={{ color: colors.textSecondary }}>
					{errorMessage}
				</Text>
			</View>
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

	if (
		loadingMessage !== '' ||
		isLoadingProfile ||
		!user ||
		!chat ||
		(!isDM && !isKeyReady)
	) {
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

	const members = (chat as any)?.members ?? [
		{ user: { id: user.id, username: user.username, avatarUrl: null } }
	]

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
						activeOpacity={0.7}
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

					{!isDM && !isCreator && (
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
						<SecretChatMessageList
							messages={messages}
							userId={user.id}
							onDelete={deleteMessage}
							onRefresh={handleRefresh}
							chatId={chatId}
						/>

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
