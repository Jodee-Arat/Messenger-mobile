import { gql, useMutation, useQuery } from '@apollo/client'
import {
	ArrowLeft,
	Lock,
	LogOut,
	Settings2,
	UserPlus
} from 'lucide-react-native'
import React, { FC, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'
import { Button } from '@/components/ui/button/Button'

import { useChat } from '@/hooks/useChat'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { chatEvents } from '@/utils/chatEvents'

import ChatInviteMemberModal from '../chat-settings/ChatInviteMemberModal'

import ChatSkeleton from './ChatSkeleton'
import ChatMessageList from './message/default/list/ChatMessageList'
import SendMessageForm from './message/default/send/SendMessageForm'
import { useLeaveChatMutation } from '@/graphql/generated/output'

const GET_MEMBER_CHAT_ROLE = gql`
	query GetMemberChatRoleForChat($chatId: String!) {
		getMemberChatRole(chatId: $chatId) {
			id
			name
			isCreator
			permissions
		}
	}
`

const INVITE_MEMBER_TO_CHAT = gql`
	mutation InviteMemberToChatFromChat(
		$chatId: String!
		$targetUserId: String!
	) {
		inviteMemberToChat(chatId: $chatId, targetUserId: $targetUserId)
	}
`

type DefaultChatProps = {
	chatId: string
	chatName: string
	isSecret: boolean
}

const DefaultChat: FC<DefaultChatProps> = ({ chatId, chatName, isSecret }) => {
	const { isLoadingProfile, user } = useCurrentUser()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const navigation = useTypedNavigation()
	const [isInviteOpen, setIsInviteOpen] = useState(false)

	const [leaveChatMutation] = useLeaveChatMutation()
	const [inviteMemberMutation] = useMutation(INVITE_MEMBER_TO_CHAT)

	const {
		filesEdited,
		setFilesEdited,
		pinnedMessage,
		setPinnedMessage,
		isLoadingFindChat,
		startEdit,
		handleAddForwardedMessage,
		handleClearForm,
		setForwardedMessages,
		draftText,
		pickAndSendFile,
		forwardedMessages,
		handleDelete,
		files,
		isLoadingSendFile,
		handleClearMessageId,
		editId,
		setEditId,
		chat
	} = useChat(chatId)

	const isGroup = !!(chat as any)?.isGroup

	const { data: roleData } = useQuery(GET_MEMBER_CHAT_ROLE, {
		variables: { chatId },
		skip: !isGroup
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
		if (!role) {
			return {
				canSendMessages: true,
				canEditMessages: true,
				canDeleteMessages: true,
				canPinMessages: true
			}
		}
		if (role.isCreator) {
			return {
				canSendMessages: true,
				canEditMessages: true,
				canDeleteMessages: true,
				canPinMessages: true
			}
		}
		const perms: string[] = role.permissions ?? []
		return {
			canSendMessages: perms.includes('SEND_MESSAGES'),
			canEditMessages: perms.includes('EDIT_MESSAGES'),
			canDeleteMessages: perms.includes('DELETE_MESSAGES'),
			canPinMessages: perms.includes('PIN_MESSAGES')
		}
	}, [isGroup, roleData])

	const isCreator = !!roleData?.getMemberChatRole?.isCreator
	const canInviteMembers =
		isGroup &&
		(isCreator ||
			(roleData?.getMemberChatRole?.permissions ?? []).includes(
				'INVITE_MEMBERS'
			))

	const members = (chat as any)?.members ?? []

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

	if (isLoadingFindChat || isLoadingProfile || !user || !chat) {
		return <ChatSkeleton />
	}

	const goToSettings = () => {
		navigation.navigate('ChatSettings', { chatId })
	}

	const goBack = () => {
		navigation.goBack()
	}

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
						className='flex-row items-center flex-1 mx-3'
						activeOpacity={0.7}
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
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					className='flex-1'
					keyboardVerticalOffset={Platform.select({
						ios: 90,
						android: 80
					})}
				>
					<View className='flex-1 px-2 pb-2 justify-end'>
						<ChatMessageList
							pinnedMessage={pinnedMessage}
							setPinnedMessage={setPinnedMessage}
							chatId={chatId}
							groupId={(chat as any)?.groupId ?? ''}
							startEdit={startEdit}
							userId={user!.id}
							handleAddForwardedMessage={
								handleAddForwardedMessage
							}
							canEditMessages={messagePermissions.canEditMessages}
							canDeleteMessages={
								messagePermissions.canDeleteMessages
							}
							canPinMessages={messagePermissions.canPinMessages}
						/>

						<SendMessageForm
							pickAndSendFile={pickAndSendFile}
							handleClearForm={handleClearForm}
							setForwardedMessages={setForwardedMessages}
							draftText={draftText}
							forwardedMessages={forwardedMessages}
							onDeleteFile={handleDelete}
							files={files}
							isLoadingSendFiles={isLoadingSendFile}
							chatId={chatId}
							clearMessageId={handleClearMessageId}
							editId={editId}
							setEditId={setEditId}
							filesEdited={filesEdited}
							setFilesEdited={setFilesEdited}
							canSendMessages={messagePermissions.canSendMessages}
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
				/>
			)}
		</SafeAreaView>
	)
}

export default DefaultChat
