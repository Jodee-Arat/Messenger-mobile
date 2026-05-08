import {
	ArrowLeft,
	Heart,
	Link2,
	Lock,
	MessageSquare,
	QrCode,
	Smartphone,
	X
} from 'lucide-react-native'
import {
	BarcodeScanningResult,
	CameraView,
	useCameraPermissions
} from 'expo-camera'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppModal from '@/components/ui/AppModal'
import Loader from '@/components/ui/Loader'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useMobileSecretSessionBootstrap } from '@/hooks/useMobileSecretSessionBootstrap'
import {
	DM_STORAGE_GROUP_ID,
	shareSessionKeyWithBundlesAction
} from '@/hooks/useSecretChat.actions'
import { useTheme, useTranslation } from '@/hooks/useTheme'
import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import { saveSavedSecretLinkedWebSessionId } from '@/services/secret/saved-secret-link.service'

import { goBackOrHome } from '@/navigation/navigate'

import {
	createMyKey,
	loadMyKeys,
	loadMyPreKeyJSON
} from '@/utils/secret-chat/secretChat'

import {
	useConfirmSavedSecretPairingMutation,
	useFindOrCreateSavedSecretChatQuery,
	useFindMyPendingSavedSecretPairingLazyQuery,
	useGetSecretSessionPreKeysLazyQuery,
	useSendSessionSharedSecretKeyMutation
} from '@/graphql/generated/output'
import { generateKuznechikKey } from '@/libs/e2ee/gost'

type SavedPairingQrPayload = {
	pairingId: string
	challenge?: string | null
	safetyCode?: string | null
}

const parseSavedPairingQrPayload = (
	value: string
): SavedPairingQrPayload | null => {
	const rawValue = value.trim()
	if (!rawValue) return null

	try {
		const url = new URL(rawValue)
		const isSavedPairingUrl =
			url.protocol === 'mesarat:' &&
			(url.hostname === 'saved-secret-pairing' ||
				url.pathname.replace('/', '') === 'saved-secret-pairing')

		if (isSavedPairingUrl) {
			const pairingId = url.searchParams.get('pairingId')?.trim()
			if (!pairingId) return null

			return {
				pairingId,
				challenge: url.searchParams.get('challenge'),
				safetyCode: url.searchParams.get('safetyCode')
			}
		}
	} catch {}

	try {
		const parsed = JSON.parse(rawValue) as Partial<SavedPairingQrPayload>
		if (typeof parsed.pairingId === 'string' && parsed.pairingId.trim()) {
			return {
				pairingId: parsed.pairingId.trim(),
				challenge:
					typeof parsed.challenge === 'string'
						? parsed.challenge
						: null,
				safetyCode:
					typeof parsed.safetyCode === 'string'
						? parsed.safetyCode
						: null
			}
		}
	} catch {}

	return { pairingId: rawValue }
}

const Favorites: FC = () => {
	const navigation = useTypedNavigation()
	const { colors } = useTheme()
	const { t } = useTranslation()
	const { top } = useSafeAreaInsets()
	const { user, isLoadingProfile } = useCurrentUser()
	const { ensureSecretSession } = useMobileSecretSessionBootstrap()
	const [cameraPermission, requestCameraPermission] = useCameraPermissions()
	const [pairingId, setPairingId] = useState('')
	const [isQrScannerVisible, setIsQrScannerVisible] = useState(false)
	const [isHandlingQrScan, setIsHandlingQrScan] = useState(false)
	const [pendingQrPairing, setPendingQrPairing] =
		useState<SavedPairingQrPayload | null>(null)
	const isHandlingQrScanRef = useRef(false)
	const pendingQrPairingRef = useRef<SavedPairingQrPayload | null>(null)
	const [mobileSecretSessionId, setMobileSecretSessionId] = useState<string | null>(
		null
	)
	const [linkedWebSessionId, setLinkedWebSessionId] = useState<string | null>(null)

	const {
		data: savedChatData,
		loading: isLoadingSavedChat,
		error: savedChatError,
		refetch: refetchSavedChat
	} = useFindOrCreateSavedSecretChatQuery({
		fetchPolicy: 'network-only',
		skip: !user?.id
	})
	const [confirmSavedSecretPairing, { loading: isConfirmingPairing }] =
		useConfirmSavedSecretPairingMutation()
	const [findMyPendingSavedSecretPairing, { loading: isFindingPairing }] =
		useFindMyPendingSavedSecretPairingLazyQuery({
			fetchPolicy: 'network-only'
		})
	const [getSecretSessionPreKeys] = useGetSecretSessionPreKeysLazyQuery({
		fetchPolicy: 'network-only'
	})
	const [sendSessionSharedSecretKey] = useSendSessionSharedSecretKeyMutation()

	const savedChat = savedChatData?.findOrCreateSavedSecretChat ?? null
	const canOpenChat = Boolean(savedChat?.id)

	useEffect(() => {
		let isCancelled = false

		void (async () => {
			try {
				const ensuredSecretSessionId = await ensureSecretSession()
				if (!isCancelled) {
					setMobileSecretSessionId(ensuredSecretSessionId)
				}
			} catch (error) {
				console.warn('[Favorites] Failed to ensure mobile secret session', error)
			}
		})()

		return () => {
			isCancelled = true
		}
	}, [ensureSecretSession])

	const statusText = useMemo(() => {
		if (linkedWebSessionId) {
			return t('favoritesSessionReady')
		}

		if (mobileSecretSessionId) {
			return t('favoritesSessionActive')
		}

		return t('favoritesSessionMissing')
	}, [linkedWebSessionId, mobileSecretSessionId, t])

	const handleOpenChat = useCallback(() => {
		if (!savedChat?.id) return

		navigation.navigate('Chat', {
			chatId: savedChat.id,
			chatName: t('favorites'),
			isSecret: true,
			isSaved: true
		})
	}, [navigation, savedChat?.id, t])

	const completePairing = useCallback(async (params?: {
		pairingId?: string
		expectedChallenge?: string | null
		expectedSafetyCode?: string | null
	}) => {
		if (!user?.id || !savedChat?.id) {
			Alert.alert(t('error'), t('favoritesPairingError'))
			return
		}

		let normalizedPairingId = params?.pairingId?.trim() || pairingId.trim()
		if (!normalizedPairingId) {
			try {
				const pendingPairingResponse = await findMyPendingSavedSecretPairing()
				const pendingPairing =
					pendingPairingResponse.data?.findMyPendingSavedSecretPairing

				if (!pendingPairing?.pairingId) {
					Alert.alert(t('favorites'), t('favoritesPairingPlaceholder'))
					return
				}

				normalizedPairingId = pendingPairing.pairingId
				setPairingId(pendingPairing.pairingId)
			} catch {
				Alert.alert(t('favorites'), t('favoritesPairingError'))
				return
			}
		}

		let activeSecretSessionId = mobileSecretSessionId
		if (!activeSecretSessionId) {
			try {
				activeSecretSessionId = await ensureSecretSession()
				setMobileSecretSessionId(activeSecretSessionId)
			} catch {
				Alert.alert(t('error'), t('favoritesSessionMissing'))
				return
			}
		}

		try {
			const confirmation = await confirmSavedSecretPairing({
				variables: {
					pairingId: normalizedPairingId,
					mobileSecretSessionId: activeSecretSessionId,
					challenge: params?.expectedChallenge ?? null,
					safetyCode: params?.expectedSafetyCode ?? null
				}
			})
			const pairing = confirmation.data?.confirmSavedSecretPairing
			if (!pairing) {
				throw new Error(t('favoritesPairingError'))
			}

			if (
				params?.expectedSafetyCode &&
				pairing.safetyCode !== params.expectedSafetyCode
			) {
				throw new Error(t('favoritesSafetyCodeMismatch'))
			}

			const myPreKey = await loadMyPreKeyJSON()
			if (!myPreKey) {
				throw new Error(t('favoritesSessionMissing'))
			}

			const preKeysResponse = await getSecretSessionPreKeys({
				variables: { chatId: pairing.chatId }
			})
			const bundles = preKeysResponse.data?.getSecretSessionPreKeys ?? []
			const webBundle = bundles.find(
				bundle => bundle.secretSessionId === pairing.webSecretSessionId
			)

			if (!webBundle) {
				throw new Error(t('favoritesWebSessionNotFound'))
			}

			let savedSessionKey = (await loadMyKeys(pairing.chatId, DM_STORAGE_GROUP_ID))
				?.sessionKeyHex
			let needPersistKey = false

			if (!savedSessionKey) {
				const generatedSessionKey = await generateKuznechikKey()
				savedSessionKey = generatedSessionKey.keyBytes
				needPersistKey = true
			}

			const shared = await shareSessionKeyWithBundlesAction({
				chatId: pairing.chatId,
				groupId: DM_STORAGE_GROUP_ID,
				userId: user.id,
				fromSessionId: activeSecretSessionId,
				sessionKey: savedSessionKey,
				mySecretPreKey: myPreKey.toStore,
				preKeysPub: bundles,
				targetBundles: [webBundle],
				getPreKeys: getSecretSessionPreKeys,
				sendSharedSecretKey: sendSessionSharedSecretKey
			})

			if (!shared.success) {
				throw new Error(shared.errorMessage || t('favoritesPairingError'))
			}

			if (needPersistKey) {
				await createMyKey(
					pairing.chatId,
					DM_STORAGE_GROUP_ID,
					user.id,
					savedSessionKey
				)
			}

			await saveSavedSecretLinkedWebSessionId(pairing.webSecretSessionId)
			setLinkedWebSessionId(pairing.webSecretSessionId)
			setPairingId('')
			Alert.alert(t('favorites'), t('favoritesPairingSuccess'))
		} catch (error) {
			const message =
				error instanceof Error ? error.message : t('favoritesPairingError')
			Alert.alert(t('error'), message)
		}
	}, [
		confirmSavedSecretPairing,
		ensureSecretSession,
		findMyPendingSavedSecretPairing,
		getSecretSessionPreKeys,
		mobileSecretSessionId,
		pairingId,
		savedChat?.id,
		saveSavedSecretLinkedWebSessionId,
		sendSessionSharedSecretKey,
		t,
		user?.id
	])

	const handleConfirmPairing = useCallback(async () => {
		await completePairing()
	}, [completePairing])

	const clearPendingQrPairing = useCallback(() => {
		pendingQrPairingRef.current = null
		setPendingQrPairing(null)
		isHandlingQrScanRef.current = false
		setIsHandlingQrScan(false)
	}, [])

	const handleConfirmPendingQrPairing = useCallback(() => {
		const payload = pendingQrPairingRef.current
		if (!payload) {
			clearPendingQrPairing()
			return
		}

		void completePairing({
			pairingId: payload.pairingId,
			expectedChallenge: payload.challenge,
			expectedSafetyCode: payload.safetyCode
		}).finally(clearPendingQrPairing)
	}, [clearPendingQrPairing, completePairing])

	const handleOpenQrScanner = useCallback(async () => {
		if (cameraPermission?.granted) {
			isHandlingQrScanRef.current = false
			setIsHandlingQrScan(false)
			pendingQrPairingRef.current = null
			setPendingQrPairing(null)
			setIsQrScannerVisible(true)
			return
		}

		const permission = await requestCameraPermission()
		if (!permission.granted) {
			Alert.alert(
				t('favoritesCameraPermissionTitle'),
				t('favoritesCameraPermissionDescription')
			)
			return
		}

		isHandlingQrScanRef.current = false
		setIsHandlingQrScan(false)
		pendingQrPairingRef.current = null
		setPendingQrPairing(null)
		setIsQrScannerVisible(true)
	}, [cameraPermission?.granted, requestCameraPermission, t])

	const handleQrScanned = useCallback(
		(result: BarcodeScanningResult) => {
			if (
				isHandlingQrScanRef.current ||
				pendingQrPairingRef.current ||
				isHandlingQrScan ||
				isConfirmingPairing ||
				isFindingPairing
			) {
				return
			}

			isHandlingQrScanRef.current = true

			const parsedPayload = parseSavedPairingQrPayload(result.data)
			if (!parsedPayload?.pairingId) {
				isHandlingQrScanRef.current = false
				setIsQrScannerVisible(false)
				Alert.alert(t('favorites'), t('favoritesQrInvalid'))
				return
			}

			setIsHandlingQrScan(true)
			setIsQrScannerVisible(false)
			setPairingId(parsedPayload.pairingId)
			pendingQrPairingRef.current = parsedPayload
			setPendingQrPairing(parsedPayload)
		},
		[
			isConfirmingPairing,
			isFindingPairing,
			isHandlingQrScan,
			t
		]
	)

	if (isLoadingProfile || isLoadingSavedChat) {
		return (
			<View
				className='flex-1 items-center justify-center'
				style={{ backgroundColor: colors.background }}
			>
				<Loader />
			</View>
		)
	}

	if (!user || !savedChat) {
		return (
			<View
				className='flex-1 items-center justify-center px-6'
				style={{ backgroundColor: colors.background }}
			>
				<Text
					className='text-center text-base'
					style={{ color: colors.textSecondary }}
				>
					{savedChatError?.message || t('favoritesLoadError')}
				</Text>
				<TouchableOpacity
					onPress={() => void refetchSavedChat()}
					activeOpacity={0.8}
					className='mt-4 rounded-xl px-5 py-3'
					style={{ backgroundColor: colors.accent }}
				>
					<Text className='font-semibold' style={{ color: '#fff' }}>
						{t('retry')}
					</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View className='flex-1' style={{ backgroundColor: colors.background }}>
			<View
				className='flex-row items-center justify-between px-5 pb-3'
				style={{
					paddingTop: top + 12,
					backgroundColor: colors.backgroundSecondary,
					borderBottomWidth: 1,
					borderBottomColor: colors.border
				}}
			>
				<TouchableOpacity
					onPress={() => goBackOrHome(navigation)}
					activeOpacity={0.6}
					className='h-10 w-10 items-center justify-center rounded-full'
					style={{ backgroundColor: colors.backgroundTertiary }}
				>
					<ArrowLeft size={20} color={colors.text} />
				</TouchableOpacity>

				<Text
					className='text-lg font-bold'
					style={{ color: colors.text }}
					numberOfLines={1}
				>
					{t('favorites')}
				</Text>

				<TouchableOpacity
					onPress={handleOpenChat}
					disabled={!canOpenChat}
					activeOpacity={0.7}
					className='h-10 w-10 items-center justify-center rounded-full'
					style={{
						backgroundColor: canOpenChat
							? colors.backgroundTertiary
							: colors.cardHover,
						opacity: canOpenChat ? 1 : 0.5
					}}
				>
					<MessageSquare size={18} color={colors.textSecondary} />
				</TouchableOpacity>
			</View>

			<ScrollView
				className='flex-1'
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
			>
				<View
					className='rounded-3xl px-5 py-5'
					style={{
						backgroundColor: colors.card,
						borderWidth: 1,
						borderColor: colors.border
					}}
				>
					<View className='flex-row items-center'>
						<View
							className='h-12 w-12 items-center justify-center rounded-2xl'
							style={{ backgroundColor: colors.accentMuted }}
						>
							<Heart size={22} color={colors.accent} />
						</View>
						<View className='ml-3 flex-1'>
							<Text
								className='text-base font-bold'
								style={{ color: colors.text }}
							>
								{t('favoritesPairingTitle')}
							</Text>
							<Text
								className='mt-1 text-sm'
								style={{ color: colors.textSecondary }}
							>
								{t('favoritesDescription')}
							</Text>
						</View>
					</View>

					<View
						className='mt-4 rounded-2xl px-4 py-3'
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderWidth: 1,
							borderColor: colors.borderLight
						}}
					>
						<View className='flex-row items-center'>
							<Lock size={16} color={colors.accent} />
							<Text
								className='ml-2 text-sm font-medium'
								style={{ color: colors.text }}
							>
								{statusText}
							</Text>
						</View>
						<Text
							className='mt-2 text-xs'
							style={{ color: colors.textMuted }}
						>
							{t('favoritesPairingDescription')}
						</Text>
					</View>

					<View className='mt-4'>
					<TouchableOpacity
						onPress={handleOpenQrScanner}
						disabled={
							isConfirmingPairing || isFindingPairing || !!pendingQrPairing
						}
						activeOpacity={0.8}
						className='mb-4 flex-row items-center justify-center rounded-2xl py-3.5'
						style={{
							backgroundColor: colors.accent,
							opacity:
								isConfirmingPairing || isFindingPairing || pendingQrPairing
									? 0.7
									: 1
						}}
					>
							<QrCode size={18} color='#fff' />
							<Text
								className='ml-2 text-sm font-semibold'
								style={{ color: '#fff' }}
							>
								{t('favoritesScanQr')}
							</Text>
						</TouchableOpacity>

						<Text
							className='mb-2 text-xs font-semibold uppercase'
							style={{ color: colors.textMuted }}
						>
							{t('favoritesPairingLabel')}
						</Text>
						<TextInput
							value={pairingId}
							onChangeText={setPairingId}
							placeholder={t('favoritesPairingPlaceholder')}
							placeholderTextColor={colors.textMuted}
							autoCapitalize='none'
							autoCorrect={false}
							style={{
								backgroundColor: colors.backgroundSecondary,
								borderRadius: 16,
								borderWidth: 1,
								borderColor: colors.border,
								color: colors.text,
								paddingHorizontal: 16,
								paddingVertical: 14
							}}
						/>
					</View>

					<TouchableOpacity
						onPress={handleConfirmPairing}
						disabled={isConfirmingPairing || isFindingPairing}
						activeOpacity={0.8}
						className='mt-4 flex-row items-center justify-center rounded-2xl py-3.5'
						style={{
							backgroundColor: colors.accent,
							opacity: isConfirmingPairing || isFindingPairing ? 0.7 : 1
						}}
					>
						{isConfirmingPairing || isFindingPairing ? (
							<ActivityIndicator size='small' color='#fff' />
						) : (
							<>
								<Link2 size={18} color='#fff' />
								<Text
									className='ml-2 text-sm font-semibold'
									style={{ color: '#fff' }}
								>
									{t('favoritesConfirmPairing')}
								</Text>
							</>
						)}
					</TouchableOpacity>
				</View>

				<View
					className='mt-4 rounded-3xl px-5 py-5'
					style={{
						backgroundColor: colors.card,
						borderWidth: 1,
						borderColor: colors.border
					}}
				>
					<View className='flex-row items-center'>
						<View
							className='h-12 w-12 items-center justify-center rounded-2xl'
							style={{ backgroundColor: colors.successMuted }}
						>
							<Smartphone size={22} color={colors.success} />
						</View>
						<View className='ml-3 flex-1'>
							<Text
								className='text-base font-bold'
								style={{ color: colors.text }}
							>
								{t('favoritesOpenChat')}
							</Text>
							<Text
								className='mt-1 text-sm'
								style={{ color: colors.textSecondary }}
							>
								{t('favoritesReadyDescription')}
							</Text>
						</View>
					</View>

					<TouchableOpacity
						onPress={handleOpenChat}
						disabled={!canOpenChat}
						activeOpacity={0.8}
						className='mt-4 flex-row items-center justify-center rounded-2xl py-3.5'
						style={{
							backgroundColor: colors.backgroundSecondary,
							borderWidth: 1,
							borderColor: colors.border
						}}
					>
						<MessageSquare size={18} color={colors.text} />
						<Text
							className='ml-2 text-sm font-semibold'
							style={{ color: colors.text }}
						>
							{t('favoritesOpenChat')}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<AppModal
				transparent
				visible={!!pendingQrPairing}
				animationType='fade'
				statusBarTranslucent
				navigationBarTranslucent
				onRequestClose={clearPendingQrPairing}
			>
				<View
					className='flex-1 items-center justify-center px-6'
					style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}
				>
					<View
						className='w-full rounded-3xl px-5 py-5'
						style={{
							backgroundColor: colors.card,
							borderWidth: 1,
							borderColor: colors.border
						}}
					>
						<View className='flex-row items-center'>
							<View
								className='h-11 w-11 items-center justify-center rounded-2xl'
								style={{ backgroundColor: colors.accentMuted }}
							>
								<Lock size={20} color={colors.accent} />
							</View>
							<View className='ml-3 flex-1'>
								<Text
									className='text-base font-bold'
									style={{ color: colors.text }}
								>
									{t('favoritesSafetyCodeTitle')}
								</Text>
								<Text
									className='mt-1 text-sm'
									style={{ color: colors.textSecondary }}
								>
									{t('favoritesSafetyCodePrompt')}
								</Text>
							</View>
						</View>

						{pendingQrPairing?.safetyCode ? (
							<View
								className='mt-5 rounded-2xl px-4 py-4'
								style={{
									backgroundColor: colors.backgroundSecondary,
									borderWidth: 1,
									borderColor: colors.borderLight
								}}
							>
								<Text
									className='text-center text-2xl font-bold tracking-widest'
									style={{ color: colors.accent }}
								>
									{pendingQrPairing.safetyCode}
								</Text>
							</View>
						) : null}

						<View className='mt-5 flex-row'>
							<TouchableOpacity
								onPress={clearPendingQrPairing}
								disabled={isConfirmingPairing}
								activeOpacity={0.8}
								className='flex-1 flex-row items-center justify-center rounded-2xl py-3.5'
								style={{
									backgroundColor: colors.backgroundSecondary,
									borderWidth: 1,
									borderColor: colors.border,
									marginRight: 6,
									opacity: isConfirmingPairing ? 0.7 : 1
								}}
							>
								<Text
									className='text-center font-semibold'
									style={{ color: colors.text }}
								>
									{t('cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleConfirmPendingQrPairing}
								disabled={isConfirmingPairing}
								activeOpacity={0.8}
								className='flex-1 flex-row items-center justify-center rounded-2xl py-3.5'
								style={{
									backgroundColor: colors.accent,
									marginLeft: 6,
									opacity: isConfirmingPairing ? 0.7 : 1
								}}
							>
								{isConfirmingPairing ? (
									<ActivityIndicator size='small' color='#fff' />
								) : (
									<Text className='font-semibold' style={{ color: '#fff' }}>
										{t('favoritesConfirmPairing')}
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</AppModal>

			<AppModal
				transparent
				visible={isQrScannerVisible}
				animationType='slide'
				statusBarTranslucent
				navigationBarTranslucent
				onRequestClose={() => {
					isHandlingQrScanRef.current = false
					setIsHandlingQrScan(false)
					setIsQrScannerVisible(false)
				}}
			>
				<View
					className='flex-1'
					style={{ backgroundColor: colors.background }}
				>
					<View
						className='flex-row items-center justify-between px-5 pb-3'
						style={{
							paddingTop: top + 12,
							backgroundColor: colors.backgroundSecondary,
							borderBottomWidth: 1,
							borderBottomColor: colors.border
						}}
					>
						<Text
							className='text-lg font-bold'
							style={{ color: colors.text }}
						>
							{t('favoritesScannerTitle')}
						</Text>
						<TouchableOpacity
							onPress={() => {
								isHandlingQrScanRef.current = false
								setIsHandlingQrScan(false)
								setIsQrScannerVisible(false)
							}}
							activeOpacity={0.7}
							className='h-10 w-10 items-center justify-center rounded-full'
							style={{ backgroundColor: colors.backgroundTertiary }}
						>
							<X size={20} color={colors.text} />
						</TouchableOpacity>
					</View>

					<View className='flex-1'>
						<CameraView
							style={{ flex: 1 }}
							facing='back'
							barcodeScannerSettings={{
								barcodeTypes: ['qr']
							}}
							onBarcodeScanned={handleQrScanned}
						/>
						<View
							pointerEvents='none'
							className='absolute inset-0 items-center justify-center px-8'
						>
							<View
								style={{
									width: 250,
									height: 250,
									borderRadius: 28,
									borderWidth: 3,
									borderColor: colors.accent,
									backgroundColor: 'rgba(0,0,0,0.08)'
								}}
							/>
							<View
								className='mt-6 rounded-2xl px-4 py-3'
								style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}
							>
								<Text
									className='text-center text-sm font-medium'
									style={{ color: '#fff' }}
								>
									{t('favoritesScannerHint')}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</AppModal>
		</View>
	)
}

export default Favorites
