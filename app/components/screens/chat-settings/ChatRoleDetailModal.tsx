import { Trash2 } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
	Animated,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import AppModal from '@/components/ui/AppModal'
import EntityAvatar from '@/components/ui/EntityAvatar'

import { useBottomSheetModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import {
	type ChatPermission,
	ChatRoleData
} from '../../../types/chat-role.type'

import { ChatPermissionEnum } from '@/graphql/generated/output'

interface MemberData {
	user: {
		id: string
		username: string
		avatarUrl?: string | null
	}
}

interface ChatRoleDetailModalProps {
	role: ChatRoleData | null
	permissions: ChatPermission[]
	onClose: () => void
	onDeleteRole: (roleId: string) => void
	onTogglePermission?: (
		role: ChatRoleData,
		permissionKey: ChatPermissionEnum
	) => void
	membersWithRole: MemberData[]
	canDeleteRoles?: boolean
	canChangeRoleInfo?: boolean
}

const ChatRoleDetailModal: React.FC<ChatRoleDetailModalProps> = ({
	role,
	permissions,
	onClose,
	onDeleteRole,
	onTogglePermission,
	membersWithRole,
	canDeleteRoles = false,
	canChangeRoleInfo = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const {
		containerPaddingBottom,
		windowHeight,
		sheetMaxHeight,
		sheetPaddingBottom
	} = useBottomSheetModalLayout(0.8)
	const slideAnim = useRef(new Animated.Value(windowHeight)).current
	const [isOpen, setIsOpen] = useState(false)

	React.useEffect(() => {
		if (role) {
			setIsOpen(true)
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [role])

	const closeSheet = () => {
		Animated.timing(slideAnim, {
			toValue: windowHeight,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			setIsOpen(false)
			onClose()
		})
	}

	return (
		<AppModal
			visible={isOpen}
			transparent
			animationType='none'
			onRequestClose={closeSheet}
		>
			<View className='flex-1' style={{ paddingBottom: containerPaddingBottom }}>
				<Pressable
					className='flex-1'
					style={{ backgroundColor: colors.overlay }}
					onPress={closeSheet}
				/>

				<Animated.View
					style={{
						transform: [{ translateY: slideAnim }],
						backgroundColor: colors.backgroundSecondary,
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						borderTopWidth: 1,
						borderColor: colors.border,
						paddingBottom: sheetPaddingBottom,
						paddingTop: 8,
						maxHeight: sheetMaxHeight
					}}
				>
					{/* Handle */}
					<View className='items-center mb-3'>
						<View
							style={{
								width: 36,
								height: 4,
								borderRadius: 2,
								backgroundColor: colors.textMuted
							}}
						/>
					</View>

					{role && (
						<ScrollView showsVerticalScrollIndicator={false}>
							{/* Role header */}
							<View className='px-5 flex-row items-center mb-4'>
								<View
									style={{
										width: 18,
										height: 18,
										borderRadius: 9,
										backgroundColor: role.color,
										marginRight: 12
									}}
								/>
								<Text
									className='text-lg font-bold flex-1'
									style={{ color: colors.text }}
								>
									{role.name}
								</Text>
							</View>

							{/* Permissions list */}
							<View className='px-5 mb-4'>
								<Text
									className='text-xs font-semibold uppercase tracking-wider mb-3'
									style={{ color: colors.textSecondary }}
								>
									{t('permissions')}
								</Text>

								{permissions.map(perm => {
									const enabled = role.permissions.includes(
										perm.key
									)
									const badge = (
										<View
											className='px-2.5 py-1 rounded-full'
											style={{
												backgroundColor: enabled
													? colors.successMuted
													: colors.destructiveMuted
											}}
										>
											<Text
												className='text-xs font-semibold'
												style={{
													color: enabled
														? colors.success
														: colors.destructive
												}}
											>
												{enabled
													? t('enabled')
													: t('disabled')}
											</Text>
										</View>
									)
									return (
										<View
											key={perm.key}
											className='flex-row items-center py-3'
											style={{
												borderBottomWidth: 1,
												borderBottomColor: colors.border
											}}
										>
											<View
												className='w-8 h-8 rounded-lg items-center justify-center mr-3'
												style={{
													backgroundColor:
														colors.backgroundTertiary
												}}
											>
												{perm.icon}
											</View>
											<View className='flex-1'>
												<Text
													className='text-sm font-medium'
													style={{
														color: colors.text
													}}
												>
													{perm.label}
												</Text>
											</View>
											{canChangeRoleInfo ? (
												<TouchableOpacity
													activeOpacity={0.7}
													onPress={() =>
														onTogglePermission?.(
															role,
															perm.key
														)
													}
												>
													{badge}
												</TouchableOpacity>
											) : (
												badge
											)}
										</View>
									)
								})}
							</View>

							{/* Delete role */}
							{canDeleteRoles && (
								<View className='px-5 mb-4'>
									<TouchableOpacity
										activeOpacity={0.7}
										onPress={() => onDeleteRole(role.id)}
										className='flex-row items-center justify-center py-3.5 rounded-xl'
										style={{
											backgroundColor:
												colors.destructiveMuted
										}}
									>
										<Trash2
											size={18}
											color={colors.destructive}
											style={{ marginRight: 8 }}
										/>
										<Text
											className='text-sm font-semibold'
											style={{
												color: colors.destructive
											}}
										>
											{t('deleteRole')}
										</Text>
									</TouchableOpacity>
								</View>
							)}

							{/* Members with this role */}
							<View className='px-5 mb-4'>
								<Text
									className='text-xs font-semibold uppercase tracking-wider mb-3'
									style={{ color: colors.textSecondary }}
								>
									{t('membersWithRole')} —{' '}
									{membersWithRole.length}
								</Text>
								{membersWithRole.length === 0 ? (
									<Text
										className='text-xs py-2'
										style={{ color: colors.textMuted }}
									>
										{t('noMembersWithRole')}
									</Text>
								) : (
									membersWithRole.map(member => (
										<View
											key={member.user.id}
											className='flex-row items-center py-2.5'
											style={{
												borderBottomWidth: 1,
												borderBottomColor: colors.border
											}}
										>
											<EntityAvatar
												name={member.user.username}
												avatarUrl={
													member.user.avatarUrl
												}
												size='sm'
											/>
											<Text
												className='text-sm font-medium ml-2.5'
												style={{ color: colors.text }}
											>
												{member.user.username}
											</Text>
										</View>
									))
								)}
							</View>
						</ScrollView>
					)}
				</Animated.View>
			</View>
		</AppModal>
	)
}

export default ChatRoleDetailModal
