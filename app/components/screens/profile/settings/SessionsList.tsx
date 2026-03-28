import { Globe, MapPin, Monitor, Smartphone } from 'lucide-react-native'
import { FC, useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import {
	useFindCurrentSessionQuery,
	useFindSessionsByUserQuery
} from '@/graphql/generated/output'

function formatDate(dateStr: string, language: string) {
	const date = new Date(dateStr)
	return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

interface SessionData {
	id: string
	createdAt: string
	metadata: {
		ip: string
		device: { browser: string; os: string; type: string }
		location: { city: string; country: string }
	}
}

interface SessionRowProps {
	session: SessionData
	isCurrent?: boolean
	colors: ReturnType<typeof useTheme>['colors']
	t: (key: string) => string
	language: string
}

const SessionRow: FC<SessionRowProps> = ({
	session,
	isCurrent,
	colors,
	t,
	language
}) => {
	const { metadata } = session
	const isMobile = metadata.device.type?.toLowerCase().includes('mobile')

	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'flex-start',
				gap: 12
			}}
		>
			<View
				style={{
					width: 40,
					height: 40,
					borderRadius: 12,
					backgroundColor: isCurrent
						? 'hsla(140, 70%, 50%, 0.15)'
						: colors.backgroundTertiary,
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: 2
				}}
			>
				{isMobile ? (
					<Smartphone
						size={20}
						color={isCurrent ? colors.success : colors.textMuted}
					/>
				) : (
					<Monitor
						size={20}
						color={isCurrent ? colors.success : colors.textMuted}
					/>
				)}
			</View>

			<View style={{ flex: 1, gap: 4 }}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: 6
					}}
				>
					<Text
						style={{
							fontSize: 15,
							fontWeight: '600',
							color: colors.text
						}}
					>
						{metadata.device.browser} · {metadata.device.os}
					</Text>
					{isCurrent && (
						<View
							style={{
								backgroundColor: 'hsla(140, 70%, 50%, 0.15)',
								paddingHorizontal: 8,
								paddingVertical: 2,
								borderRadius: 6
							}}
						>
							<Text
								style={{
									fontSize: 11,
									fontWeight: '700',
									color: colors.success
								}}
							>
								{t('sessionCurrent')}
							</Text>
						</View>
					)}
				</View>

				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: 12
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 4
						}}
					>
						<Globe size={12} color={colors.textMuted} />
						<Text
							style={{
								fontSize: 13,
								color: colors.textMuted
							}}
						>
							{metadata.ip}
						</Text>
					</View>
					{(metadata.location.city || metadata.location.country) && (
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: 4
							}}
						>
							<MapPin size={12} color={colors.textMuted} />
							<Text
								style={{
									fontSize: 13,
									color: colors.textMuted
								}}
							>
								{[
									metadata.location.city,
									metadata.location.country
								]
									.filter(Boolean)
									.join(', ')}
							</Text>
						</View>
					)}
				</View>

				<Text
					style={{
						fontSize: 12,
						color: colors.textMuted,
						marginTop: 2
					}}
				>
					{formatDate(session.createdAt, language)}
				</Text>
			</View>
		</View>
	)
}

interface SessionsListProps {
	refreshSignal?: number
}

const SessionsList: FC<SessionsListProps> = ({ refreshSignal = 0 }) => {
	const { colors } = useTheme()
	const { t, language } = useTranslation()

	const {
		data: sessionsData,
		loading: loadingSessions,
		refetch: refetchSessions
	} = useFindSessionsByUserQuery()
	const {
		data: currentData,
		loading: loadingCurrent,
		refetch: refetchCurrentSession
	} = useFindCurrentSessionQuery()

	useEffect(() => {
		void Promise.allSettled([refetchSessions(), refetchCurrentSession()])
	}, [refreshSignal, refetchCurrentSession, refetchSessions])

	const sessions = (sessionsData?.findSessionsByUser ?? []) as SessionData[]
	const currentSession = currentData?.findCurrentSession as
		| SessionData
		| undefined

	if (loadingSessions || loadingCurrent) {
		return (
			<View
				style={{
					paddingVertical: 40,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	return (
		<View style={{ gap: 16 }}>
			{/* Current session */}
			{currentSession && (
				<View
					style={{
						backgroundColor: colors.card,
						borderRadius: 16,
						borderWidth: 1,
						borderColor: 'hsla(140, 70%, 50%, 0.25)',
						overflow: 'hidden'
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 8,
							paddingHorizontal: 16,
							paddingTop: 16,
							paddingBottom: 12
						}}
					>
						<View
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: colors.success
							}}
						/>
						<Text
							style={{
								fontSize: 13,
								fontWeight: '700',
								color: colors.text,
								textTransform: 'uppercase',
								letterSpacing: 0.5
							}}
						>
							{t('sessionCurrentTitle')}
						</Text>
					</View>
					<View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
						<SessionRow
							session={currentSession}
							isCurrent
							colors={colors}
							t={t}
							language={language}
						/>
					</View>
				</View>
			)}

			{/* Other sessions */}
			{sessions.length > 0 && (
				<View
					style={{
						backgroundColor: colors.card,
						borderRadius: 16,
						borderWidth: 1,
						borderColor: colors.border,
						overflow: 'hidden'
					}}
				>
					<View
						style={{
							paddingHorizontal: 16,
							paddingTop: 16,
							paddingBottom: 12
						}}
					>
						<Text
							style={{
								fontSize: 13,
								fontWeight: '700',
								color: colors.text,
								textTransform: 'uppercase',
								letterSpacing: 0.5
							}}
						>
							{t('sessionOther')} ({sessions.length})
						</Text>
					</View>
					<View
						style={{
							paddingHorizontal: 16,
							paddingBottom: 16,
							gap: 16
						}}
					>
						{sessions.map((session, index) => (
							<View key={session.id}>
								{index > 0 && (
									<View
										style={{
											height: 1,
											backgroundColor: colors.border,
											marginBottom: 16
										}}
									/>
								)}
								<SessionRow
									session={session}
									colors={colors}
									t={t}
									language={language}
								/>
							</View>
						))}
					</View>
				</View>
			)}

			{/* Empty state */}
			{sessions.length === 0 && !currentSession && (
				<View
					style={{
						paddingVertical: 32,
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							fontSize: 14,
							color: colors.textMuted
						}}
					>
						{t('sessionNone')}
					</Text>
				</View>
			)}
		</View>
	)
}

export default SessionsList
