import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, ChevronRight, LogOut, Settings } from 'lucide-react-native'
import { FC } from 'react'
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { handleLogout } from '@/services/auth/auth.service'

import { getMediaSource } from '@/utils/get-media-source'

import ProfileSkeleton from './ProfileSkeleton'
import { useLogoutUserMutation } from '@/graphql/generated/output'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const Profile: FC = () => {
	const navigation = useTypedNavigation()
	const { user, isLoadingProfile } = useCurrentUser()
	const { colors, isDark } = useTheme()
	const { t } = useTranslation()

	const [logoutUser, { loading: isLoggingOut }] = useLogoutUserMutation({
		onCompleted: async () => {
			await handleLogout()
		},
		onError: error => {
			console.error('Logout error:', error)
		}
	})

	const confirmLogout = () => {
		Alert.alert(t('logout'), t('logoutConfirm'), [
			{ text: t('cancel'), style: 'cancel' },
			{
				text: t('logout'),
				style: 'destructive',
				onPress: () => logoutUser()
			}
		])
	}

	if (isLoadingProfile || !user) {
		return <ProfileSkeleton />
	}

	const firstLetter = user.username?.[0]?.toUpperCase() ?? '?'

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<ScrollView
				className='flex-1'
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{/* ── Gradient Header ── */}
				<LinearGradient
					colors={[
						colors.gradientStart,
						colors.gradientMid,
						colors.gradientEnd
					]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{
						width: SCREEN_WIDTH,
						paddingTop: 56,
						paddingBottom: 60,
						alignItems: 'center'
					}}
				>
					{/* Back button */}
					<TouchableOpacity
						onPress={() => navigation.navigate('Home')}
						activeOpacity={0.7}
						style={{
							position: 'absolute',
							top: 52,
							left: 20,
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: isDark
								? 'rgba(255,255,255,0.08)'
								: 'rgba(0,0,0,0.06)',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<ArrowLeft size={20} color={colors.text} />
					</TouchableOpacity>

					{/* Avatar */}
					<View
						style={{
							width: 108,
							height: 108,
							borderRadius: 54,
							borderWidth: 3,
							borderColor: colors.accent,
							padding: 3,
							marginTop: 12
						}}
					>
						<View
							style={{
								width: '100%',
								height: '100%',
								borderRadius: 50,
								overflow: 'hidden',
								backgroundColor: colors.backgroundTertiary,
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							{user.avatarUrl ? (
								<Image
									source={{
										uri: getMediaSource(user.avatarUrl)
									}}
									style={{
										width: '100%',
										height: '100%'
									}}
								/>
							) : (
								<Text
									style={{
										fontSize: 40,
										fontWeight: '700',
										color: colors.accent
									}}
								>
									{firstLetter}
								</Text>
							)}
						</View>
					</View>

					{/* Name */}
					<Text
						style={{
							fontSize: 24,
							fontWeight: '800',
							color: colors.text,
							marginTop: 14
						}}
					>
						{user.username}
					</Text>

					{/* Bio */}
					{user.bio ? (
						<Text
							style={{
								fontSize: 14,
								color: colors.textSecondary,
								marginTop: 6,
								textAlign: 'center',
								paddingHorizontal: 40,
								lineHeight: 20
							}}
							numberOfLines={3}
						>
							{user.bio}
						</Text>
					) : null}
				</LinearGradient>

				{/* ── Action Cards ── */}
				<View style={{ paddingHorizontal: 16, marginTop: -32 }}>
					{/* Settings */}
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => navigation.navigate('UserSettings')}
						style={{
							backgroundColor: colors.card,
							borderRadius: 16,
							borderWidth: 1,
							borderColor: colors.border,
							paddingHorizontal: 18,
							paddingVertical: 16,
							flexDirection: 'row',
							alignItems: 'center',
							marginBottom: 10
						}}
					>
						<View
							style={{
								width: 42,
								height: 42,
								borderRadius: 12,
								backgroundColor: 'hsla(40, 90%, 55%, 0.12)',
								alignItems: 'center',
								justifyContent: 'center',
								marginRight: 14
							}}
						>
							<Settings size={20} color={colors.warning} />
						</View>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									fontSize: 15,
									fontWeight: '600',
									color: colors.text
								}}
							>
								{t('settings')}
							</Text>
							<Text
								style={{
									fontSize: 12,
									color: colors.textMuted,
									marginTop: 2
								}}
							>
								{t('theme')}, {t('language').toLowerCase()}
							</Text>
						</View>
						<ChevronRight size={18} color={colors.textMuted} />
					</TouchableOpacity>
				</View>

				{/* ── Logout ── */}
				<View style={{ paddingHorizontal: 16, marginTop: 24 }}>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={confirmLogout}
						disabled={isLoggingOut}
						style={{
							backgroundColor: 'hsla(0, 80%, 50%, 0.08)',
							borderRadius: 14,
							borderWidth: 1,
							borderColor: 'hsla(0, 80%, 50%, 0.18)',
							paddingVertical: 15,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{isLoggingOut ? (
							<ActivityIndicator
								size='small'
								color={colors.destructive}
							/>
						) : (
							<>
								<LogOut
									size={18}
									color={colors.destructive}
									style={{ marginRight: 10 }}
								/>
								<Text
									style={{
										fontSize: 15,
										fontWeight: '600',
										color: colors.destructive
									}}
								>
									{t('logout')}
								</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	)
}

export default Profile
