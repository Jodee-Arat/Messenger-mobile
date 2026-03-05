import * as Clipboard from 'expo-clipboard'
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react-native'
import { useState } from 'react'
import {
	Alert,
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import Loader from '@/components/ui/Loader'

import { useTheme } from '@/hooks/useTheme'

import {
	useDisableTotpMutation,
	useEnableTotpMutation,
	useFindProfileQuery,
	useGenerateTotpSecretMutation
} from '@/graphql/generated/output'

const TotpSettingsForm = () => {
	const { colors } = useTheme()

	const { data: profileData, refetch } = useFindProfileQuery()
	const isTotpEnabled = profileData?.findProfile?.isTotpEnabled ?? false

	const [setupData, setSetupData] = useState<{
		totpSecret: string
		qrCodeUrl: string
	} | null>(null)
	const [verifyCode, setVerifyCode] = useState('')

	const [generateSecret, { loading: isGenerating }] =
		useGenerateTotpSecretMutation({
			onCompleted(data) {
				setSetupData(data.generateTotpSecret)
				setVerifyCode('')
			},
			onError(error) {
				Toast.show({
					type: 'error',
					text1: 'Error',
					text2: error.message
				})
			}
		})

	const [enableTotp, { loading: isEnabling }] = useEnableTotpMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: 'TOTP Enabled',
				text2: 'Two-factor authentication is now active'
			})
			setSetupData(null)
			setVerifyCode('')
			refetch()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Verification Failed',
				text2: error.message || 'Invalid code'
			})
		}
	})

	const [disableTotp, { loading: isDisabling }] = useDisableTotpMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: 'TOTP Disabled',
				text2: 'Two-factor authentication has been removed'
			})
			refetch()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.message
			})
		}
	})

	const handleCopySecret = async (secret: string) => {
		await Clipboard.setStringAsync(secret)
		Toast.show({
			type: 'success',
			text1: 'Copied!',
			text2: 'Secret key copied to clipboard'
		})
	}

	const handleEnableTotp = () => {
		if (verifyCode.length !== 6) {
			Toast.show({
				type: 'error',
				text1: 'Invalid code',
				text2: 'Enter the 6-digit code from your authenticator app'
			})
			return
		}
		enableTotp({ variables: { token: verifyCode } })
	}

	const handleDisableTotp = () => {
		Alert.alert(
			'Disable TOTP',
			'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Disable',
					style: 'destructive',
					onPress: () => disableTotp()
				}
			]
		)
	}

	return (
		<View style={{ paddingHorizontal: 16 }}>
			{/* Header */}
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
				Two-Factor Authentication
			</Text>
			<Text
				style={{
					fontSize: 13,
					color: colors.textMuted,
					marginBottom: 16,
					paddingLeft: 4
				}}
			>
				Add an extra layer of security using Google Authenticator or a
				compatible TOTP app
			</Text>

			{/* Status card */}
			<View
				style={{
					backgroundColor: colors.card,
					borderRadius: 14,
					borderWidth: 1.5,
					borderColor: isTotpEnabled
						? 'hsla(140, 60%, 45%, 0.4)'
						: colors.border,
					padding: 18,
					marginBottom: 16
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						marginBottom: 8
					}}
				>
					{isTotpEnabled ? (
						<ShieldCheck size={22} color='hsl(140, 60%, 45%)' />
					) : (
						<Shield size={22} color={colors.textMuted} />
					)}
					<Text
						style={{
							fontSize: 16,
							fontWeight: '600',
							color: colors.text,
							marginLeft: 10
						}}
					>
						{isTotpEnabled ? 'TOTP Active' : 'TOTP Not Configured'}
					</Text>
				</View>
				<Text
					style={{
						fontSize: 13,
						color: colors.textMuted
					}}
				>
					{isTotpEnabled
						? 'Your account is protected with two-factor authentication. A TOTP code is required each time you log in.'
						: 'Enable TOTP to require a code from your authenticator app when logging in.'}
				</Text>
			</View>

			{/* Setup flow */}
			{!isTotpEnabled && !setupData && (
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => generateSecret()}
					disabled={isGenerating}
					style={{
						backgroundColor: colors.accent,
						borderRadius: 12,
						paddingVertical: 14,
						alignItems: 'center'
					}}
				>
					{isGenerating ? (
						<Loader />
					) : (
						<Text
							style={{
								fontSize: 15,
								fontWeight: '600',
								color: '#fff'
							}}
						>
							Set Up TOTP
						</Text>
					)}
				</TouchableOpacity>
			)}

			{/* QR Code + Secret + Verify */}
			{setupData && (
				<View
					style={{
						backgroundColor: colors.card,
						borderRadius: 14,
						borderWidth: 1.5,
						borderColor: colors.border,
						padding: 18,
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							fontSize: 14,
							fontWeight: '600',
							color: colors.text,
							marginBottom: 12,
							textAlign: 'center'
						}}
					>
						Scan QR code or copy the key below
					</Text>

					{/* QR Code */}
					<Image
						source={{ uri: setupData.qrCodeUrl }}
						style={{
							width: 200,
							height: 200,
							marginBottom: 16,
							borderRadius: 8
						}}
						resizeMode='contain'
					/>

					{/* Secret key */}
					<Text
						style={{
							fontSize: 12,
							color: colors.textMuted,
							marginBottom: 6
						}}
					>
						Secret Key:
					</Text>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => handleCopySecret(setupData.totpSecret)}
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderRadius: 10,
							borderWidth: 1,
							borderColor: colors.border,
							paddingHorizontal: 16,
							paddingVertical: 12,
							marginBottom: 6,
							width: '100%',
							alignItems: 'center'
						}}
					>
						<Text
							selectable
							style={{
								fontSize: 14,
								fontWeight: '600',
								fontFamily: 'monospace',
								color: colors.accent,
								letterSpacing: 1.5,
								textAlign: 'center'
							}}
						>
							{setupData.totpSecret}
						</Text>
					</TouchableOpacity>
					<Text
						style={{
							fontSize: 11,
							color: colors.textMuted,
							marginBottom: 16
						}}
					>
						Tap to copy
					</Text>

					{/* Verification input */}
					<Text
						style={{
							fontSize: 13,
							color: colors.text,
							marginBottom: 8,
							alignSelf: 'flex-start'
						}}
					>
						Enter the 6-digit code from your app:
					</Text>
					<TextInput
						value={verifyCode}
						onChangeText={text =>
							setVerifyCode(text.replace(/[^0-9]/g, ''))
						}
						maxLength={6}
						keyboardType='number-pad'
						placeholder='000000'
						placeholderTextColor={colors.textMuted}
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderRadius: 10,
							borderWidth: 1,
							borderColor: colors.border,
							paddingHorizontal: 16,
							paddingVertical: 12,
							fontSize: 20,
							fontWeight: '600',
							fontFamily: 'monospace',
							color: colors.text,
							textAlign: 'center',
							letterSpacing: 6,
							width: '100%',
							marginBottom: 14
						}}
					/>

					<View
						style={{
							flexDirection: 'row',
							gap: 10,
							width: '100%'
						}}
					>
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={() => {
								setSetupData(null)
								setVerifyCode('')
							}}
							style={{
								flex: 1,
								backgroundColor: colors.backgroundTertiary,
								borderRadius: 12,
								paddingVertical: 12,
								alignItems: 'center'
							}}
						>
							<Text
								style={{
									fontSize: 14,
									fontWeight: '600',
									color: colors.textSecondary
								}}
							>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={handleEnableTotp}
							disabled={isEnabling}
							style={{
								flex: 1,
								backgroundColor: colors.accent,
								borderRadius: 12,
								paddingVertical: 12,
								alignItems: 'center'
							}}
						>
							{isEnabling ? (
								<Loader />
							) : (
								<Text
									style={{
										fontSize: 14,
										fontWeight: '600',
										color: '#fff'
									}}
								>
									Verify & Enable
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Disable button */}
			{isTotpEnabled && (
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={handleDisableTotp}
					disabled={isDisabling}
					style={{
						backgroundColor: colors.card,
						borderRadius: 12,
						borderWidth: 1.5,
						borderColor: 'hsla(0, 70%, 50%, 0.3)',
						paddingVertical: 14,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 8
					}}
				>
					{isDisabling ? (
						<Loader />
					) : (
						<>
							<ShieldOff size={18} color='hsl(0, 70%, 55%)' />
							<Text
								style={{
									fontSize: 15,
									fontWeight: '600',
									color: 'hsl(0, 70%, 55%)'
								}}
							>
								Disable TOTP
							</Text>
						</>
					)}
				</TouchableOpacity>
			)}
		</View>
	)
}

export default TotpSettingsForm
