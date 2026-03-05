import * as Clipboard from 'expo-clipboard'
import { Copy, Fingerprint, ShieldCheck, X } from 'lucide-react-native'
import React, { FC, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

import EntityAvatar from '@/components/ui/EntityAvatar'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { GetPreKeysQuery } from '@/graphql/generated/output'
import { getFingerprint } from '@/libs/e2ee/gost'

type Member = {
	user: {
		id: string
		username: string
		avatarUrl?: string | null
	}
}

interface FingerprintVerificationModalProps {
	visible: boolean
	onClose: () => void
	members: Member[]
	preKeysPub: GetPreKeysQuery['getPreKeys']
	currentUserId: string
}

const formatFingerprint = (hex: string): string => {
	const upper = hex.toUpperCase()
	const blocks: string[] = []
	for (let i = 0; i < upper.length; i += 4) {
		blocks.push(upper.slice(i, i + 4))
	}
	return blocks.join(' ')
}

const FingerprintVerificationModal: FC<FingerprintVerificationModalProps> = ({
	visible,
	onClose,
	members,
	preKeysPub,
	currentUserId
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const [fingerprints, setFingerprints] = useState<Map<string, string>>(
		new Map()
	)
	const [loading, setLoading] = useState(true)
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

	useEffect(() => {
		if (!visible || preKeysPub.length === 0) return

		const computeFingerprints = async () => {
			setLoading(true)
			const map = new Map<string, string>()

			for (const pk of preKeysPub) {
				try {
					const fp = await getFingerprint(pk.ikPub, pk.spkPub)
					map.set(pk.userId, fp)
				} catch (e) {
					console.error(
						'[Fingerprint] Error computing for',
						pk.userId,
						e
					)
				}
			}

			setFingerprints(map)
			setLoading(false)
		}

		computeFingerprints()
	}, [visible, preKeysPub])

	const handleCopy = async (userId: string, fp: string) => {
		await Clipboard.setStringAsync(formatFingerprint(fp))
		setCopiedId(userId)
		setTimeout(() => setCopiedId(null), 2000)
	}

	const sortedMembers = [...members].sort((a, b) => {
		if (a.user.id === currentUserId) return -1
		if (b.user.id === currentUserId) return 1
		return a.user.username.localeCompare(b.user.username)
	})

	const selectedUser = selectedUserId
		? sortedMembers.find(m => m.user.id === selectedUserId)
		: null
	const selectedFp = selectedUserId ? fingerprints.get(selectedUserId) : null

	return (
		<Modal
			visible={visible}
			animationType='slide'
			transparent
			onRequestClose={onClose}
		>
			<View
				className='flex-1 justify-end'
				style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
			>
				<View
					className='rounded-t-3xl'
					style={{
						backgroundColor: colors.background,
						maxHeight: '85%'
					}}
				>
					{/* Header */}
					<View
						className='flex-row items-center justify-between px-5 pt-5 pb-3'
						style={{
							borderBottomWidth: 1,
							borderBottomColor: colors.borderLight
						}}
					>
						<View className='flex-row items-center'>
							<View
								className='w-10 h-10 rounded-full items-center justify-center mr-3'
								style={{
									backgroundColor: colors.successMuted
								}}
							>
								<ShieldCheck size={20} color={colors.success} />
							</View>
							<View>
								<Text
									className='text-base font-bold'
									style={{ color: colors.text }}
								>
									{t('fingerprintVerification')}
								</Text>
								<Text
									className='text-xs mt-0.5'
									style={{ color: colors.textSecondary }}
								>
									{t('fingerprintHint')}
								</Text>
							</View>
						</View>
						<TouchableOpacity
							onPress={onClose}
							className='w-9 h-9 rounded-full items-center justify-center'
							style={{ backgroundColor: colors.cardHover }}
							activeOpacity={0.7}
						>
							<X size={18} color={colors.textSecondary} />
						</TouchableOpacity>
					</View>

					{loading ? (
						<View className='items-center justify-center py-16'>
							<ActivityIndicator
								size='large'
								color={colors.accent}
							/>
							<Text
								className='text-sm mt-3'
								style={{ color: colors.textSecondary }}
							>
								{t('computingFingerprints')}
							</Text>
						</View>
					) : selectedUser && selectedFp ? (
						/* ── Detail view */
						<ScrollView
							className='px-5'
							contentContainerStyle={{ paddingBottom: 40 }}
							showsVerticalScrollIndicator={false}
						>
							<TouchableOpacity
								onPress={() => setSelectedUserId(null)}
								className='flex-row items-center mt-4 mb-2'
								activeOpacity={0.7}
							>
								<Text
									className='text-sm'
									style={{ color: colors.accent }}
								>
									← {t('backToList')}
								</Text>
							</TouchableOpacity>

							<View className='items-center mt-4'>
								<EntityAvatar
									size='xl'
									name={selectedUser.user.username}
									avatarUrl={
										selectedUser.user.avatarUrl || null
									}
								/>
								<Text
									className='text-lg font-bold mt-3'
									style={{ color: colors.text }}
								>
									{selectedUser.user.username}
									{selectedUser.user.id === currentUserId
										? ` (${t('you')})`
										: ''}
								</Text>
							</View>

							<View
								className='mt-5 p-4 rounded-2xl'
								style={{
									backgroundColor: colors.backgroundSecondary
								}}
							>
								<Text
									className='text-xs font-semibold mb-2'
									style={{ color: colors.textSecondary }}
								>
									{t('fingerprintLabel')}
								</Text>
								<Text
									className='text-sm leading-6 tracking-wider font-mono'
									style={{
										color: colors.text,
										fontFamily: 'monospace'
									}}
									selectable
								>
									{formatFingerprint(selectedFp)}
								</Text>
							</View>

							<TouchableOpacity
								onPress={() =>
									handleCopy(selectedUser.user.id, selectedFp)
								}
								className='flex-row items-center justify-center py-3.5 rounded-xl mt-4'
								style={{
									backgroundColor:
										copiedId === selectedUser.user.id
											? colors.successMuted
											: colors.card,
									borderWidth: 1,
									borderColor:
										copiedId === selectedUser.user.id
											? colors.success
											: colors.border
								}}
								activeOpacity={0.7}
							>
								<Copy
									size={16}
									color={
										copiedId === selectedUser.user.id
											? colors.success
											: colors.textSecondary
									}
									style={{ marginRight: 8 }}
								/>
								<Text
									className='text-sm font-semibold'
									style={{
										color:
											copiedId === selectedUser.user.id
												? colors.success
												: colors.text
									}}
								>
									{copiedId === selectedUser.user.id
										? t('copied')
										: t('copyFingerprint')}
								</Text>
							</TouchableOpacity>

							{/* Verification tip */}
							<View
								className='mt-4 p-3 rounded-xl mb-4'
								style={{
									backgroundColor: colors.accentMuted,
									borderWidth: 1,
									borderColor: colors.accent + '30'
								}}
							>
								<Text
									className='text-xs leading-5'
									style={{ color: colors.textSecondary }}
								>
									{t('fingerprintVerifyTip')}
								</Text>
							</View>
						</ScrollView>
					) : (
						/* ── Members list ── */
						<ScrollView
							className='px-5'
							contentContainerStyle={{ paddingBottom: 40 }}
							showsVerticalScrollIndicator={false}
						>
							{/* Description */}
							<View
								className='mt-4 p-3 rounded-xl mb-4'
								style={{
									backgroundColor: colors.backgroundSecondary,
									borderWidth: 1,
									borderColor: colors.borderLight
								}}
							>
								<Text
									className='text-xs leading-5'
									style={{ color: colors.textSecondary }}
								>
									{t('fingerprintDescription')}
								</Text>
							</View>

							{sortedMembers.map(member => {
								const fp = fingerprints.get(member.user.id)
								const isMe = member.user.id === currentUserId
								const shortFp = fp
									? formatFingerprint(fp).slice(0, 24) + '…'
									: '—'

								return (
									<TouchableOpacity
										key={member.user.id}
										onPress={() =>
											fp &&
											setSelectedUserId(member.user.id)
										}
										className='flex-row items-center py-3 px-3 rounded-xl mb-2'
										style={{
											backgroundColor: colors.card,
											borderWidth: 1,
											borderColor: isMe
												? colors.accent + '40'
												: colors.borderLight
										}}
										activeOpacity={0.7}
									>
										{/* Mini-pattern */}
										{!fp && (
											<View
												className='items-center justify-center'
												style={{
													width: 40,
													height: 40,
													borderRadius: 8,
													backgroundColor:
														colors.backgroundSecondary
												}}
											>
												<Fingerprint
													size={20}
													color={colors.textMuted}
												/>
											</View>
										)}

										<View className='flex-1 ml-3'>
											<View className='flex-row items-center'>
												<Text
													className='text-sm font-semibold'
													style={{
														color: colors.text
													}}
													numberOfLines={1}
												>
													{member.user.username}
												</Text>
												{isMe && (
													<View
														className='ml-2 px-1.5 py-0.5 rounded'
														style={{
															backgroundColor:
																colors.accentMuted
														}}
													>
														<Text
															className='text-[9px] font-bold'
															style={{
																color: colors.accent
															}}
														>
															{t(
																'you'
															).toUpperCase()}
														</Text>
													</View>
												)}
											</View>
											<Text
												className='text-xs mt-0.5'
												style={{
													color: colors.textMuted,
													fontFamily: 'monospace'
												}}
												numberOfLines={1}
											>
												{shortFp}
											</Text>
										</View>

										{fp && (
											<TouchableOpacity
												onPress={() =>
													handleCopy(
														member.user.id,
														fp
													)
												}
												className='w-8 h-8 rounded-full items-center justify-center'
												style={{
													backgroundColor:
														copiedId ===
														member.user.id
															? colors.successMuted
															: colors.cardHover
												}}
												activeOpacity={0.7}
											>
												<Copy
													size={14}
													color={
														copiedId ===
														member.user.id
															? colors.success
															: colors.textSecondary
													}
												/>
											</TouchableOpacity>
										)}
									</TouchableOpacity>
								)
							})}
						</ScrollView>
					)}
				</View>
			</View>
		</Modal>
	)
}

export default FingerprintVerificationModal
