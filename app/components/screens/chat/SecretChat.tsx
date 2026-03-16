import {
	ArrowLeft,
	Fingerprint,
	Lock,
	LogOut,
	Settings2,
	ShieldCheck,
	UserPlus
} from 'lucide-react-native'
import React, { FC, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useSecretChat } from '@/hooks/useSecretChat'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import { chatEvents } from '@/utils/chatEvents'
import { deleteSecretChat } from '@/utils/secret-chat/secretChat'

import ChatInviteMemberModal from '../chat-settings/ChatInviteMemberModal'

import ChatSkeleton from './ChatSkeleton'
import FingerprintVerificationModal from './FingerprintVerificationModal'
import SecretChatMessageList from './message/secret/list/SecretChatMessageList'
import SecretSendMessageForm from './message/secret/send/SecretSendMessageForm'
import {
	ChatPermissionEnum,
	useGetMemberChatRoleQuery,
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
	const { userId } = useUser()
	const navigation = useTypedNavigation()
	const [rolesVisible, setRolesVisible] = useState(false)
	const [fingerprintVisible, setFingerprintVisible] = useState(false)
	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [totpVerified, setTotpVerified] = useState(false)
	const [totpCode, setTotpCode] = useState('')
	const [totpError, setTotpError] = useState('')

	const lockColor = isDM ? '#4CAF50' : colors.accent

	const [leaveChatMutation] = useLeaveChatMutation()
	const [verifyChatTotpMutation, { loading: totpLoading }] =
		useVerifyChatTotpMutation()
	const [inviteMemberMutation] = useInviteMemberToChatMutation()

	const { data: roleData } = useGetMemberChatRoleQuery({
		variables: { chatId },
		skip: isDM
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
		messages,
		loadingMessage,
		pickFile,
		reload,
		sendMessage,
		errorMessage,
		setDraftText,
		preKeysPub,
		sendKeyToNewMember,
		isKeyReady
	} = useSecretChat(chatId, userId, groupId)

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

	if (errorMessage !== '') {
		return (
			<SafeAreaView
				className='flex-1 justify-center items-center'
				style={{ backgroundColor: colors.background }}
			>
				<Text style={{ color: colors.textSecondary }}>
					{errorMessage}
				</Text>
			</SafeAreaView>
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
			<SafeAreaView
				className='flex-1'
				style={{ backgroundColor: colors.background }}
			>
				<View className='flex-1 pt-8 items-center justify-center px-6'>
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
			</SafeAreaView>
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
		sendMessage(messageText, user)
	}

	const members = (chat as any)?.members ?? [
		{ user: { id: user.id, username: user.username, avatarUrl: null } }
	]

	return (
		<SafeAreaView
			className='flex-1'
			style={{ backgroundColor: colors.background }}
		>
			<View
				className='flex-1 pt-8 overflow-hidden'
				style={{ backgroundColor: colors.backgroundTertiary }}
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
							name={chatName}
							avatarUrl={null}
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
								{chatName}
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
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					className='flex-1'
					keyboardVerticalOffset={Platform.select({
						ios: 90,
						android: 80
					})}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						<SecretChatMessageList
							messages={messages}
							userId={user.id}
							onDelete={deleteMessage}
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
							setFilesEdited={() => {}}
							pickAndSendFile={pickFile}
							onDeleteFile={(id: string) => {
								clearForm()
								console.log('Deleted file', id)
							}}
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
		</SafeAreaView>
	)
}

export default SecretChat
