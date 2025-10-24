import { styled } from 'nativewind'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import Heading from '@/components/ui/Heading'

import ChangeAvatarForm from './ChangeAvatarForm'
import ChangeInfoForm from './ChangeInfoForm'

// Стилизованные компоненты
const TabButton = styled(TouchableOpacity)
const TabText = styled(Text)

const UserSettings = () => {
	const [activeTab, setActiveTab] = useState<
		'profile' | 'account' | 'appearance' | 'notifications' | 'sessions'
	>('profile')

	return (
		<ScrollView className='flex-1 mt-5 px-4'>
			<Heading>
				<Text>User Settings</Text>
			</Heading>

			{/* Tabs list */}
			<View className='flex-row justify-between mt-4'>
				{[
					'profile',
					'account',
					'appearance',
					'notifications',
					'sessions'
				].map(tab => (
					<TabButton
						key={tab}
						className={`flex-1 py-2 border-b ${
							activeTab === tab
								? 'border-blue-500'
								: 'border-gray-300'
						}`}
						onPress={() => setActiveTab(tab as any)}
					>
						<TabText
							className={`text-center capitalize ${
								activeTab === tab
									? 'text-blue-500 font-bold'
									: 'text-gray-500'
							}`}
						>
							{tab}
						</TabText>
					</TabButton>
				))}
			</View>

			{/* Tabs content */}
			{activeTab === 'profile' && (
				<View className='mt-5 space-y-6'>
					<Heading>
						<Text>Profile Settings</Text>
					</Heading>
					<ChangeAvatarForm />
					<ChangeInfoForm />
					{/* <SocialLinksForm /> */}
				</View>
			)}

			{activeTab === 'account' && (
				<View className='mt-5 space-y-6'>
					<Heading>
						<Text>Account Settings</Text>
					</Heading>
					{/* <ChangeEmailForm /> */}
					{/* <ChangePasswordForm /> */}
				</View>
			)}

			{activeTab === 'appearance' && (
				<View className='mt-5 space-y-6'>
					<Heading>
						<Text>Appearance</Text>
					</Heading>

					{/* <ChangeThemeForm /> */}
					{/* <ChangeLanguageForm /> */}
				</View>
			)}

			{activeTab === 'notifications' && (
				<View className='mt-5 space-y-6'>
					<Heading>
						<Text>Notifications</Text>
					</Heading>
					{/* <ChangeNotificationSettingsForm /> */}
				</View>
			)}

			{activeTab === 'sessions' && (
				<View className='mt-5 space-y-6'>
					<Heading>
						<Text>Sessions</Text>
					</Heading>

					{/* <SessionsList /> */}
				</View>
			)}
		</ScrollView>
	)
}

export default UserSettings
