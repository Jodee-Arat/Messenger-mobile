import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import BrandMark from '@/components/ui/BrandMark'
import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button/Button'

import { useAuth } from '@/hooks/useAuth'
import { useMobileSecretSessionBootstrap } from '@/hooks/useMobileSecretSessionBootstrap'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import {
	EnumAsyncStorage,
	EnumSecureStore,
	IAuthFormData
} from '@/types/interface/auth.interface'

import AuthFields from './AuthFields'
import {
	useCreateUserWEmailMutation,
	useLoginUserMutation
} from '@/graphql/generated/output'
import { client, rebuildWebsocketLink } from '@/libs/apollo-client'

const Auth = () => {
	const [isReg, setIsReg] = useState(false)
	const [totpStep, setTotpStep] = useState(false)
	const [totpCode, setTotpCode] = useState('')
	const [savedCredentials, setSavedCredentials] = useState<{
		login: string
		password: string
	} | null>(null)

	const navigation = useTypedNavigation()
	const { auth, isAuthenticated } = useAuth()
	const { ensureSecretSession } = useMobileSecretSessionBootstrap()
	const { setUserId } = useUser()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top, bottom } = useSafeAreaInsets()

	useEffect(() => {
		if (isAuthenticated) {
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: 'Home' }]
				})
			)
		}
	}, [isAuthenticated, navigation])

	const form = useForm<IAuthFormData>({
		mode: 'onChange',
		defaultValues: {
			login: '',
			email: '',
			password: '',
			pin: ''
		}
	})

	const [login, { loading: isLoadingLogin }] = useLoginUserMutation({
		onCompleted: async data => {
			const accessToken = data.loginUser.accessToken
			const refreshToken = data.loginUser.refreshToken
			const currentUserId = data.loginUser.user?.id ?? ''

			if (accessToken) {
				await AsyncStorage.setItem(
					EnumAsyncStorage.ACCESS_TOKEN,
					accessToken
				)
			}
			if (refreshToken) {
				await SecureStore.setItemAsync(
					EnumSecureStore.REFRESH_TOKEN,
					refreshToken
				)
			}
			if (data.loginUser.sessionId) {
				await AsyncStorage.setItem(
					EnumAsyncStorage.SESSION_ID,
					data.loginUser.sessionId
				)
			}
			await AsyncStorage.setItem(
				EnumAsyncStorage.USER_ID,
				JSON.stringify(currentUserId)
			)

			await client.clearStore()
			rebuildWebsocketLink()

			setUserId(currentUserId)
			auth()

			try {
				await ensureSecretSession(true)
			} catch (error) {
				console.warn('[SecretSession] Mobile secret session bootstrap failed', error)
				Toast.show({
					type: 'error',
					text1: 'Secret chats setup failed',
					text2: 'You can still use regular chats.'
				})
			}

			form.reset()
			navigation.navigate('Home')

			Toast.show({
				type: 'success',
				text1: 'Login successful',
				text2: 'Welcome back!'
			})
		},
		onError(error) {
			console.log(error)
			if (error.message === 'TOTP code is required') {
				const values = form.getValues()
				setSavedCredentials({
					login: values.login,
					password: values.password
				})
				setTotpStep(true)
				setTotpCode('')
				return
			}
			Toast.show({
				type: 'error',
				text1: 'Login failed',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const [create, { loading: isLoadingCreateUserWEmail }] =
		useCreateUserWEmailMutation({
			onCompleted: async () => {
				form.reset()
				Toast.show({
					type: 'success',
					text1: 'Registration successful',
					text2: 'You can now log in!'
				})
				setIsReg(false)
			},
			onError(error) {
				console.log(error)
				Toast.show({
					type: 'error',
					text1: 'Registration failed',
					text2: error.message || 'Something went wrong'
				})
			}
		})

	const onSubmit: SubmitHandler<IAuthFormData> = async data => {
		if (isReg) {
			create({
				variables: {
					data: {
						username: data.login,
						email: data.email,
						password: data.password
					}
				}
			})
		} else {
			login({
				variables: {
					data: {
						login: data.login,
						password: data.password
					}
				}
			})
		}
	}

	const onSubmitTotp = () => {
		if (!savedCredentials || totpCode.length !== 6) {
			Toast.show({
				type: 'error',
				text1: 'Invalid code',
				text2: 'Enter the 6-digit code from your authenticator app'
			})
			return
		}
		login({
			variables: {
				data: {
					login: savedCredentials.login,
					password: savedCredentials.password,
					pin: totpCode
				}
			}
		})
	}
	const isLoading = false

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: colors.background }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					alignItems: 'center',
					justifyContent: 'center',
					paddingHorizontal: 20,
					paddingTop: Math.max(top + 24, 48),
					paddingBottom: Math.max(bottom + 24, 40)
				}}
			>
				<View style={{ width: '100%', alignItems: 'center' }}>
					<View className='mb-8 items-center'>
						<BrandMark size={88} />
						<Text
							className='mt-4 text-lg font-semibold'
							style={{ color: colors.accent, letterSpacing: 2 }}
						>
							МесАгат
						</Text>
						<Text
							className='mt-2 text-center text-sm'
							style={{ color: colors.textSecondary }}
						>
							{totpStep ? t('totpAuthHint') : t('brandTagline')}
						</Text>
					</View>

					<View style={{ width: '100%', maxWidth: 360 }}>
						{totpStep ? (
							<>
								<Text
									className='text-center text-3xl font-medium mb-4'
									style={{ color: colors.text }}
								>
									{t('totpVerification')}
								</Text>
								<Text
									className='text-center text-sm mb-6'
									style={{ color: colors.textMuted }}
								>
									{t('totpAuthHint')}
								</Text>
								<TextInput
									value={totpCode}
									onChangeText={(text: string) =>
										setTotpCode(
											text
												.replace(/[^0-9]/g, '')
												.slice(0, 6)
										)
									}
									placeholder='000000'
									placeholderTextColor={colors.textMuted}
									keyboardType='number-pad'
									autoCapitalize='none'
									style={{
										backgroundColor: colors.inputBg,
										borderWidth: 1,
										borderColor: colors.border,
										borderRadius: 12,
										paddingVertical: 10,
										paddingHorizontal: 16,
										marginVertical: 6,
										textAlign: 'center',
										fontSize: 24,
										letterSpacing: 8,
										fontFamily: 'monospace',
										color: colors.text
									}}
								/>
								<View style={{ marginTop: 8 }}>
									<Button
										size='sm'
										onPress={onSubmitTotp}
										loading={isLoadingLogin}
									>
										Verify
									</Button>
								</View>
								<Pressable
									onPress={() => {
										setTotpStep(false)
										setSavedCredentials(null)
										setTotpCode('')
									}}
								>
									<Text
										className='text-center text-base mt-6'
										style={{ color: colors.accent }}
									>
										{t('backToLogin')}
									</Text>
								</Pressable>
							</>
						) : (
							<>
								<Text
									className='text-center text-3xl font-medium mb-8'
									style={{ color: colors.text }}
								>
									{isReg ? t('signUp') : t('login')}
								</Text>
								{isLoading ? (
									<Loader />
								) : (
									<>
										<AuthFields
											isReg={isReg}
											control={form.control}
											isPassRequired
										/>

										<Button
											size='sm'
											onPress={form.handleSubmit(
												onSubmit
											)}
											loading={
												isLoadingCreateUserWEmail ||
												isLoadingLogin
											}
										>
											{isReg ? t('signUp') : t('login')}
										</Button>

										<Pressable
											onPress={() => setIsReg(!isReg)}
										>
											<Text
												className='text-center text-base mt-6'
												style={{ color: colors.text }}
											>
												{isReg
													? t('alreadyHaveAccount')
													: t('noAccount')}
												<Text
													style={{
														color: colors.accent
													}}
												>
													{isReg
														? t('login')
														: t('signUp')}
												</Text>
											</Text>
										</Pressable>
									</>
								)}
							</>
						)}
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

export default Auth
