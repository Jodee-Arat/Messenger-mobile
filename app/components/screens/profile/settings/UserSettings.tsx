import {
	ArrowLeft,
	ChevronRight,
	Check,
	Globe,
	Monitor,
	Moon,
	Palette,
	Shield,
	Sun,
	User
} from 'lucide-react-native'
import { useCallback, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import ChangeAvatarForm from './ChangeAvatarForm'
import ChangeInfoForm from './ChangeInfoForm'
import SessionsList from './SessionsList'
import TotpSettingsForm from './TotpSettingsForm'
import UserSettingsSkeleton from './UserSettingsSkeleton'

const SCREEN_HEIGHT = Dimensions.get('window').height

type Tab = 'profile' | 'appearance' | 'security' | 'sessions'

const UserSettings = () => {
	const navigation = useTypedNavigation()
	const { isLoadingProfile, user, refetch } = useCurrentUser()
	const { colors, isDark, theme, setTheme, language, setLanguage } =
		useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()

	const [activeTab, setActiveTab] = useState<Tab>('profile')
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [refreshSignal, setRefreshSignal] = useState(0)

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await refetch()
			setRefreshSignal(prev => prev + 1)
		} finally {
			setIsRefreshing(false)
		}
	}, [refetch])

	const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
		{
			key: 'profile',
			label: t('profileTab'),
			icon: (
				<User
					size={16}
					color={
						activeTab === 'profile'
							? colors.accent
							: colors.textMuted
					}
				/>
			)
		},
		{
			key: 'appearance',
			label: t('appearanceTab'),
			icon: (
				<Palette
					size={16}
					color={
						activeTab === 'appearance'
							? colors.accent
							: colors.textMuted
					}
				/>
			)
		},
		{
			key: 'security',
			label: 'Security',
			icon: (
				<Shield
					size={16}
					color={
						activeTab === 'security'
							? colors.accent
							: colors.textMuted
					}
				/>
			)
		},
		{
			key: 'sessions',
			label: t('sessionsTab'),
			icon: (
				<Monitor
					size={16}
					color={
						activeTab === 'sessions'
							? colors.accent
							: colors.textMuted
					}
				/>
			)
		}
	]

	if (isLoadingProfile || !user) {
		return <UserSettingsSkeleton />
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					backgroundColor: colors.backgroundSecondary,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
					paddingTop: top + 8,
					paddingBottom: 0
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 16,
						paddingBottom: 16
					}}
				>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						activeOpacity={0.7}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: colors.backgroundTertiary,
							alignItems: 'center',
							justifyContent: 'center',
							marginRight: 12
						}}
					>
						<ArrowLeft size={22} color={colors.text} />
					</TouchableOpacity>
					<Text
						style={{
							fontSize: 20,
							fontWeight: '700',
							color: colors.text,
							flex: 1
						}}
					>
						{t('userSettings')}
					</Text>
				</View>

				{/* Tab bar */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 16
					}}
				>
					{tabs.map(tab => (
						<TouchableOpacity
							key={tab.key}
							activeOpacity={0.7}
							onPress={() => setActiveTab(tab.key)}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingVertical: 12,
								paddingHorizontal: 16,
								marginRight: 4,
								borderBottomWidth: 2,
								borderBottomColor:
									activeTab === tab.key
										? colors.accent
										: 'transparent'
							}}
						>
							{tab.icon}
							<Text
								style={{
									fontSize: 14,
									fontWeight: '600',
									color:
										activeTab === tab.key
											? colors.accent
											: colors.textMuted,
									marginLeft: 8
								}}
							>
								{tab.label}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Content */}
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
				{activeTab === 'profile' && (
					<View style={{ paddingTop: 20 }}>
						<ChangeAvatarForm />
						<View style={{ height: 8 }} />
						<ChangeInfoForm />
					</View>
				)}

				{activeTab === 'appearance' && (
					<View style={{ paddingTop: 20, paddingHorizontal: 16 }}>
						{/* ── Theme Section ── */}
						<View style={{ marginBottom: 28 }}>
							<Text
								style={{
									fontSize: 11,
									fontWeight: '700',
									letterSpacing: 1,
									textTransform: 'uppercase',
									color: colors.textSecondary,
									marginBottom: 12,
									paddingLeft: 4
								}}
							>
								{t('theme')}
							</Text>
							<Text
								style={{
									fontSize: 13,
									color: colors.textMuted,
									marginBottom: 14,
									paddingLeft: 4
								}}
							>
								{t('chooseTheme')}
							</Text>

							<View style={{ flexDirection: 'row', gap: 10 }}>
								{/* Dark */}
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => setTheme('dark')}
									style={{
										flex: 1,
										backgroundColor:
											theme === 'dark'
												? colors.accentMuted
												: colors.card,
										borderRadius: 14,
										borderWidth: 1.5,
										borderColor:
											theme === 'dark'
												? colors.accent
												: colors.border,
										paddingVertical: 18,
										alignItems: 'center'
									}}
								>
									<View
										style={{
											width: 48,
											height: 48,
											borderRadius: 24,
											backgroundColor:
												theme === 'dark'
													? 'hsla(260, 85%, 65%, 0.2)'
													: colors.backgroundTertiary,
											alignItems: 'center',
											justifyContent: 'center',
											marginBottom: 10
										}}
									>
										<Moon
											size={22}
											color={
												theme === 'dark'
													? colors.accent
													: colors.textMuted
											}
										/>
									</View>
									<Text
										style={{
											fontSize: 14,
											fontWeight: '600',
											color:
												theme === 'dark'
													? colors.accent
													: colors.textSecondary
										}}
									>
										{t('darkTheme')}
									</Text>
									{theme === 'dark' && (
										<View
											style={{
												position: 'absolute',
												top: 10,
												right: 10,
												width: 20,
												height: 20,
												borderRadius: 10,
												backgroundColor: colors.accent,
												alignItems: 'center',
												justifyContent: 'center'
											}}
										>
											<Check size={12} color='#fff' />
										</View>
									)}
								</TouchableOpacity>

								{/* Light */}
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => setTheme('light')}
									style={{
										flex: 1,
										backgroundColor:
											theme === 'light'
												? colors.accentMuted
												: colors.card,
										borderRadius: 14,
										borderWidth: 1.5,
										borderColor:
											theme === 'light'
												? colors.accent
												: colors.border,
										paddingVertical: 18,
										alignItems: 'center'
									}}
								>
									<View
										style={{
											width: 48,
											height: 48,
											borderRadius: 24,
											backgroundColor:
												theme === 'light'
													? 'hsla(260, 85%, 60%, 0.15)'
													: colors.backgroundTertiary,
											alignItems: 'center',
											justifyContent: 'center',
											marginBottom: 10
										}}
									>
										<Sun
											size={22}
											color={
												theme === 'light'
													? colors.accent
													: colors.textMuted
											}
										/>
									</View>
									<Text
										style={{
											fontSize: 14,
											fontWeight: '600',
											color:
												theme === 'light'
													? colors.accent
													: colors.textSecondary
										}}
									>
										{t('lightTheme')}
									</Text>
									{theme === 'light' && (
										<View
											style={{
												position: 'absolute',
												top: 10,
												right: 10,
												width: 20,
												height: 20,
												borderRadius: 10,
												backgroundColor: colors.accent,
												alignItems: 'center',
												justifyContent: 'center'
											}}
										>
											<Check size={12} color='#fff' />
										</View>
									)}
								</TouchableOpacity>
							</View>
						</View>

						{/* ── Language Section ── */}
						<View>
							<Text
								style={{
									fontSize: 11,
									fontWeight: '700',
									letterSpacing: 1,
									textTransform: 'uppercase',
									color: colors.textSecondary,
									marginBottom: 12,
									paddingLeft: 4
								}}
							>
								{t('language')}
							</Text>
							<Text
								style={{
									fontSize: 13,
									color: colors.textMuted,
									marginBottom: 14,
									paddingLeft: 4
								}}
							>
								{t('chooseLanguage')}
							</Text>

							{/* Russian */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => setLanguage('ru')}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor:
										language === 'ru'
											? colors.accentMuted
											: colors.card,
									borderRadius: 14,
									borderWidth: 1.5,
									borderColor:
										language === 'ru'
											? colors.accent
											: colors.border,
									paddingHorizontal: 18,
									paddingVertical: 16,
									marginBottom: 10
								}}
							>
								<View
									style={{
										width: 40,
										height: 40,
										borderRadius: 12,
										backgroundColor:
											language === 'ru'
												? 'hsla(260, 85%, 65%, 0.18)'
												: colors.backgroundTertiary,
										alignItems: 'center',
										justifyContent: 'center',
										marginRight: 14
									}}
								>
									<Text
										style={{
											fontSize: 18,
											fontWeight: '700'
										}}
									>
										🇷🇺
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 15,
											fontWeight: '600',
											color: colors.text
										}}
									>
										{t('russian')}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: colors.textMuted,
											marginTop: 2
										}}
									>
										Русский
									</Text>
								</View>
								{language === 'ru' && (
									<Check size={20} color={colors.accent} />
								)}
							</TouchableOpacity>

							{/* English */}
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => setLanguage('en')}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor:
										language === 'en'
											? colors.accentMuted
											: colors.card,
									borderRadius: 14,
									borderWidth: 1.5,
									borderColor:
										language === 'en'
											? colors.accent
											: colors.border,
									paddingHorizontal: 18,
									paddingVertical: 16
								}}
							>
								<View
									style={{
										width: 40,
										height: 40,
										borderRadius: 12,
										backgroundColor:
											language === 'en'
												? 'hsla(260, 85%, 65%, 0.18)'
												: colors.backgroundTertiary,
										alignItems: 'center',
										justifyContent: 'center',
										marginRight: 14
									}}
								>
									<Text
										style={{
											fontSize: 18,
											fontWeight: '700'
										}}
									>
										🇺🇸
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 15,
											fontWeight: '600',
											color: colors.text
										}}
									>
										{t('english')}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: colors.textMuted,
											marginTop: 2
										}}
									>
										English
									</Text>
								</View>
								{language === 'en' && (
									<Check size={20} color={colors.accent} />
								)}
							</TouchableOpacity>
						</View>
					</View>
				)}

				{activeTab === 'security' && (
					<View style={{ paddingTop: 20 }}>
						<TotpSettingsForm refreshSignal={refreshSignal} />
						<View style={{ paddingHorizontal: 16, marginTop: 8 }}>
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => navigation.navigate('BlockedUsers')}
								style={{
									backgroundColor: colors.card,
									borderRadius: 16,
									borderWidth: 1,
									borderColor: colors.border,
									paddingHorizontal: 18,
									paddingVertical: 16,
									flexDirection: 'row',
									alignItems: 'center'
								}}
							>
								<View
									style={{
										width: 42,
										height: 42,
										borderRadius: 12,
										backgroundColor:
											'hsla(0, 80%, 50%, 0.12)',
										alignItems: 'center',
										justifyContent: 'center',
										marginRight: 14
									}}
								>
									<Shield
										size={20}
										color={colors.destructive}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 15,
											fontWeight: '600',
											color: colors.text
										}}
									>
										{t('blockedUsers')}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: colors.textMuted,
											marginTop: 2
										}}
										numberOfLines={2}
									>
										{t('blockedUsersHint')}
									</Text>
								</View>
								<ChevronRight
									size={18}
									color={colors.textMuted}
								/>
							</TouchableOpacity>
						</View>
					</View>
				)}

				{activeTab === 'sessions' && (
					<View style={{ paddingTop: 20, paddingHorizontal: 16 }}>
						<SessionsList refreshSignal={refreshSignal} />
					</View>
				)}
			</ScrollView>
		</View>
	)
}

export default UserSettings
