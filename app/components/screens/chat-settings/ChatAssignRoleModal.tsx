import { Check } from 'lucide-react-native'
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
import { useBottomSheetModalLayout } from '@/hooks/useModalLayout'
import { useTheme, useTranslation } from '@/hooks/useTheme'

import { type ChatRoleData } from '../../../types/chat-role.type'

interface MemberData {
	user: {
		id: string
		username: string
		avatarUrl?: string | null
	}
}

interface ChatAssignRoleModalProps {
	userId: string | null
	roles: ChatRoleData[]
	userRoles: Record<string, string>
	members: MemberData[]
	onAssign: (userId: string, roleId: string) => void
	onClose: () => void
}

const ChatAssignRoleModal: React.FC<ChatAssignRoleModalProps> = ({
	userId,
	roles,
	userRoles,
	members,
	onAssign,
	onClose
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const {
		containerPaddingBottom,
		windowHeight,
		sheetMaxHeight,
		sheetPaddingBottom
	} = useBottomSheetModalLayout(0.6)
	const slideAnim = useRef(new Animated.Value(windowHeight)).current
	const [isOpen, setIsOpen] = useState(false)

	React.useEffect(() => {
		if (userId) {
			setIsOpen(true)
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [userId])

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

	const handleAssign = (roleId: string) => {
		if (userId) {
			onAssign(userId, roleId)
			closeSheet()
		}
	}

	const username = userId
		? (members.find(m => m.user.id === userId)?.user.username ?? '')
		: ''

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
						maxHeight: sheetMaxHeight,
						overflow: 'hidden'
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

					<Text
						className='text-lg font-bold px-5 mb-1'
						style={{ color: colors.text }}
					>
						{t('assignRole')}
					</Text>
					<Text
						className='text-xs px-5 mb-4'
						style={{ color: colors.textSecondary }}
					>
						{username}
					</Text>

					<View style={{ flex: 1, minHeight: 0 }}>
						<ScrollView
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{
								paddingHorizontal: 16,
								paddingBottom: 16
							}}
						>
						{/* No role option */}
						<TouchableOpacity
							activeOpacity={0.6}
							onPress={() => handleAssign('')}
							className='flex-row items-center px-4 py-3.5 rounded-xl mb-2'
							style={{
								backgroundColor:
									userId && !userRoles[userId]
										? colors.accentMuted
										: colors.backgroundTertiary,
								borderWidth: 1,
								borderColor:
									userId && !userRoles[userId]
										? colors.accent
										: colors.border
							}}
						>
							<View
								style={{
									width: 14,
									height: 14,
									borderRadius: 7,
									backgroundColor: colors.textMuted,
									marginRight: 12
								}}
							/>
							<Text
								className='flex-1 text-sm font-medium'
								style={{ color: colors.textSecondary }}
							>
								{t('withoutRole')}
							</Text>
							{userId && !userRoles[userId] && (
								<Check size={18} color={colors.accent} />
							)}
						</TouchableOpacity>

						{roles.map(role => {
							const isSelected =
								userId && userRoles[userId] === role.id
							return (
								<TouchableOpacity
									key={role.id}
									activeOpacity={0.6}
									onPress={() => handleAssign(role.id)}
									className='flex-row items-center px-4 py-3.5 rounded-xl mb-2'
									style={{
										backgroundColor: isSelected
											? colors.accentMuted
											: colors.backgroundTertiary,
										borderWidth: 1,
										borderColor: isSelected
											? colors.accent
											: colors.border
									}}
								>
									<View
										style={{
											width: 14,
											height: 14,
											borderRadius: 7,
											backgroundColor: role.color,
											marginRight: 12
										}}
									/>
									<View className='flex-1'>
										<Text
											className='text-sm font-semibold'
											style={{ color: colors.text }}
										>
											{role.name}
										</Text>
										<Text
											className='text-xs mt-0.5'
											style={{ color: colors.textMuted }}
										>
											{role.permissions.length}{' '}
											{t('permissionsCount')}
										</Text>
									</View>
									{isSelected && (
										<Check
											size={18}
											color={colors.accent}
										/>
									)}
								</TouchableOpacity>
							)
						})}
						</ScrollView>
					</View>
				</Animated.View>
			</View>
		</AppModal>
	)
}

export default ChatAssignRoleModal
