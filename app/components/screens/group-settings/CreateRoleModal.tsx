import { Shield } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { ROLE_COLORS, getPermissions } from '../../../types/role.type'

import { GroupPermissionEnum } from '@/graphql/generated/output'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface CreateRoleModalProps {
	isOpen: boolean
	onClose: () => void
	onCreateRole: (
		name: string,
		color: string,
		permissions: GroupPermissionEnum[]
	) => void
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
	isOpen,
	onClose,
	onCreateRole
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const PERMISSIONS = getPermissions(colors, t)
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [roleName, setRoleName] = useState('')
	const [selectedColor, setSelectedColor] = useState(ROLE_COLORS[0])
	const [perms, setPerms] = useState<Set<GroupPermissionEnum>>(
		() => new Set<GroupPermissionEnum>()
	)

	React.useEffect(() => {
		if (isOpen) {
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [isOpen])

	const closeSheet = () => {
		Animated.timing(slideAnim, {
			toValue: SCREEN_HEIGHT,
			duration: 200,
			useNativeDriver: true
		}).start(() => {
			onClose()
			setRoleName('')
			setSelectedColor(ROLE_COLORS[0])
			setPerms(new Set<GroupPermissionEnum>())
		})
	}

	const handleCreate = () => {
		if (!roleName.trim()) return
		onCreateRole(roleName.trim(), selectedColor, Array.from(perms))
		closeSheet()
	}

	const togglePerm = (key: GroupPermissionEnum) => {
		setPerms(prev => {
			const next = new Set(prev)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}

	return (
		<Modal
			visible={isOpen}
			transparent
			animationType='none'
			onRequestClose={closeSheet}
		>
			<View className='flex-1'>
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
						paddingBottom: 34,
						paddingTop: 8,
						maxHeight: SCREEN_HEIGHT * 0.85
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

					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps='handled'
					>
						{/* Title */}
						<Text
							className='text-lg font-bold px-5 mb-4'
							style={{ color: colors.text }}
						>
							{t('createRole')}
						</Text>

						{/* Role name */}
						<View className='px-5 mb-4'>
							<Text
								className='text-xs font-semibold uppercase tracking-wider mb-2'
								style={{ color: colors.textSecondary }}
							>
								{t('roleName')}
							</Text>
							<TextInput
								style={{
									backgroundColor: colors.background,
									borderRadius: 12,
									paddingHorizontal: 16,
									paddingVertical: 12,
									color: colors.text,
									fontSize: 15,
									borderWidth: 1,
									borderColor: colors.border
								}}
								placeholder={t('exampleRole')}
								placeholderTextColor={colors.textMuted}
								value={roleName}
								onChangeText={setRoleName}
							/>
						</View>

						{/* Color picker */}
						<View className='px-5 mb-5'>
							<Text
								className='text-xs font-semibold uppercase tracking-wider mb-3'
								style={{ color: colors.textSecondary }}
							>
								{t('roleColor')}
							</Text>
							<View
								className='flex-row flex-wrap'
								style={{ gap: 10 }}
							>
								{ROLE_COLORS.map(color => (
									<TouchableOpacity
										key={color}
										activeOpacity={0.7}
										onPress={() => setSelectedColor(color)}
										style={{
											width: 36,
											height: 36,
											borderRadius: 18,
											backgroundColor: color,
											borderWidth:
												selectedColor === color ? 3 : 0,
											borderColor: colors.text,
											alignItems: 'center',
											justifyContent: 'center'
										}}
									>
										{selectedColor === color && (
											<View
												style={{
													width: 10,
													height: 10,
													borderRadius: 5,
													backgroundColor:
														color === '#ffffff'
															? '#000'
															: '#fff'
												}}
											/>
										)}
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Permissions */}
						<View className='px-5 mb-4'>
							<Text
								className='text-xs font-semibold uppercase tracking-wider mb-3'
								style={{ color: colors.textSecondary }}
							>
								{t('permissions')}
							</Text>

							{PERMISSIONS.map(perm => (
								<View
									key={perm.key}
									className='flex-row items-center justify-between py-3 mb-1'
									style={{
										borderBottomWidth: 1,
										borderBottomColor: colors.border
									}}
								>
									<View className='flex-row items-center flex-1 mr-3'>
										<View
											className='w-9 h-9 rounded-lg items-center justify-center mr-3'
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
											<Text
												className='text-xs mt-0.5'
												style={{
													color: colors.textMuted
												}}
												numberOfLines={2}
											>
												{perm.description}
											</Text>
										</View>
									</View>
									<Switch
										value={perms.has(perm.key)}
										onValueChange={() =>
											togglePerm(perm.key)
										}
										trackColor={{
											false: colors.borderLight,
											true: colors.accentMuted
										}}
										thumbColor={
											perms.has(perm.key)
												? colors.accent
												: colors.textSecondary
										}
									/>
								</View>
							))}
						</View>

						{/* Create button */}
						<View className='px-5 mt-2 mb-4'>
							<TouchableOpacity
								activeOpacity={0.8}
								disabled={!roleName.trim()}
								onPress={handleCreate}
								style={{
									backgroundColor: roleName.trim()
										? colors.accent
										: colors.borderLight,
									borderRadius: 12,
									paddingVertical: 14,
									alignItems: 'center',
									justifyContent: 'center',
									flexDirection: 'row'
								}}
							>
								<Shield
									size={18}
									color='#fff'
									style={{ marginRight: 8 }}
								/>
								<Text
									className='text-sm font-bold'
									style={{ color: '#fff' }}
								>
									{t('createRole')}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</Animated.View>
			</View>
		</Modal>
	)
}

export default CreateRoleModal
