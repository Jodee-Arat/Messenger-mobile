import React from 'react'
import { SafeAreaView, View } from 'react-native'

import {
	SkeletonBox,
	SkeletonCircle,
	SkeletonLine
} from '@/components/ui/Skeleton'

import { useTheme } from '@/hooks/useTheme'

/**
 * Скелетон для экрана чата (DefaultChat / SecretChat) —
 * header + заглушки сообщений + поле ввода.
 */
const ChatSkeleton = () => {
	const { colors } = useTheme()

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View
				style={{
					flex: 1,
					paddingTop: 32,
					backgroundColor: colors.backgroundTertiary
				}}
			>
				{/* Header */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 16,
						height: 60,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight
					}}
				>
					<SkeletonBox width={36} height={36} borderRadius={18} />
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							flex: 1,
							marginHorizontal: 12
						}}
					>
						<SkeletonCircle size={40} />
						<View style={{ marginLeft: 10, flex: 1 }}>
							<SkeletonLine width='55%' height={15} />
							<SkeletonLine
								width='30%'
								height={11}
								style={{ marginTop: 5 }}
							/>
						</View>
					</View>
					<SkeletonBox width={36} height={36} borderRadius={18} />
				</View>

				{/* Messages */}
				<View
					style={{
						flex: 1,
						paddingHorizontal: 12,
						paddingTop: 16,
						justifyContent: 'flex-end',
						paddingBottom: 8
					}}
				>
					{/* Incoming messages (left) */}
					{[0.6, 0.45, 0.7].map((w, i) => (
						<View
							key={`in-${i}`}
							style={{
								alignSelf: 'flex-start',
								marginBottom: 12,
								maxWidth: '75%'
							}}
						>
							<SkeletonBox
								width={`${w * 100}%` as any}
								height={48}
								borderRadius={16}
							/>
						</View>
					))}

					{/* Outgoing messages (right) */}
					{[0.5, 0.35].map((w, i) => (
						<View
							key={`out-${i}`}
							style={{
								alignSelf: 'flex-end',
								marginBottom: 12,
								maxWidth: '75%'
							}}
						>
							<SkeletonBox
								width={`${w * 100}%` as any}
								height={42}
								borderRadius={16}
							/>
						</View>
					))}

					{/* More incoming */}
					<View
						style={{
							alignSelf: 'flex-start',
							marginBottom: 12,
							maxWidth: '75%'
						}}
					>
						<SkeletonBox
							width='55%'
							height={56}
							borderRadius={16}
						/>
					</View>
				</View>

				{/* Input bar */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 12,
						paddingVertical: 10,
						borderTopWidth: 1,
						borderTopColor: colors.borderLight
					}}
				>
					<SkeletonBox width={36} height={36} borderRadius={18} />
					<SkeletonBox
						width='auto'
						height={40}
						borderRadius={20}
						style={{ flex: 1, marginHorizontal: 8 }}
					/>
					<SkeletonBox width={36} height={36} borderRadius={18} />
				</View>
			</View>
		</SafeAreaView>
	)
}

export default ChatSkeleton
