import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button/Button'

import { useAuth } from '@/hooks/useAuth'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { useUser } from '@/hooks/useUser'

import {
	EnumAsyncStorage,
	EnumSecureStore,
	IAuthFormData
} from '@/types/interface/auth.interface'

import { upsertMyPreKeyJSON } from '@/utils/secret-chat/secretChat'

import AuthFields from './AuthFields'
import {
	useCreateUserWEmailMutation,
	useLoginUserMutation,
	useSendPreKeyMutation
} from '@/graphql/generated/output'
import { generatePreKey } from '@/libs/e2ee/gost'

const Auth = () => {
	const [isReg, setIsReg] = useState(false)

	const navigation = useTypedNavigation()
	const { auth, isAuthenticated } = useAuth()
	const { setUserId } = useUser()

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
			password: ''
		}
	})

	const [login, { loading: isLoadingLogin }] = useLoginUserMutation({
		onCompleted: async data => {
			const accessToken = data.loginUser.accessToken
			const refreshToken = data.loginUser.refreshToken

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

			auth()
			const { toServer, toStore } = await generatePreKey()
			AsyncStorage.setItem(
				EnumAsyncStorage.MY_PRE_KEYS,
				JSON.stringify(toStore)
			)

			upsertMyPreKeyJSON({ toServer, toStore })
			sendPreKey({
				variables: {
					data: {
						...toServer
					}
				}
			})
			setUserId(data.loginUser.user?.id ?? '')
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
			Toast.show({
				type: 'error',
				text1: 'Login failed',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const [sendPreKey, { loading: isLoadingSendPreKey }] =
		useSendPreKeyMutation({
			onCompleted() {
				console.log('Create PreKey')
			},
			onError(error) {
				console.log('1', error)
				Toast.show({
					type: 'error',
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
					text2: 'Welcome aboard!'
				})
				const { toServer, toStore } = await generatePreKey()
				AsyncStorage.setItem(
					EnumAsyncStorage.MY_PRE_KEYS,
					JSON.stringify(toStore)
				)

				upsertMyPreKeyJSON({ toServer, toStore }) // вот тут мб с типом toStore есть проблема, надо запустить и проверить а также доделать эту функцию саму
				sendPreKey({
					variables: {
						data: {
							...toServer
						}
					}
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
	const isLoading = false

	return (
		<View className='mx-2 bg-card-dark justify-center items-center h-full'>
			<View className='w-9/12'>
				<Text className='text-center text-foreground-dark text-3xl font-medium mb-8'>
					{isReg ? 'Sign Up' : 'Login'}
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

						<Button size='sm' onPress={form.handleSubmit(onSubmit)}>
							{isLoadingCreateUserWEmail ||
							isLoadingSendPreKey ||
							isLoadingLogin ? (
								<Loader />
							) : isReg ? (
								'Sign Up'
							) : (
								'Login'
							)}
						</Button>

						<Pressable onPress={() => setIsReg(!isReg)}>
							<Text className='text-foreground-dark text-center text-base mt-6'>
								{isReg
									? 'Already have an account? '
									: "Don't have an account? "}
								<Text className='text-primary-dark'>
									{isReg ? 'Login' : 'Sign up'}
								</Text>
							</Text>
						</Pressable>
					</>
				)}
			</View>
		</View>
	)
}

export default Auth
