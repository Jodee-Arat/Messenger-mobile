import { ChevronRight, Crown, Plus } from 'lucide-react-native'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme, useTranslation } from '@/hooks/useTheme'

import { GroupRoleData, type Permission } from '../../../types/role.type'

interface RolesSectionProps {
	roles: GroupRoleData[]
	permissions: Permission[]
	onRolePress: (role: GroupRoleData) => void
	onCreatePress: () => void
	canManageRoles?: boolean
	canCreateRole?: boolean
}

const RolesSection: FC<RolesSectionProps> = ({
	roles,
	permissions,
	onRolePress,
	onCreatePress,
	canManageRoles = false,
	canCreateRole = false
}) => {
	const { colors } = useTheme()
	const { t } = useTranslation()

	const getPermCount = (role: GroupRoleData) => role.permissions.length

	return (
		<View className='mt-6 px-4'>
			<View className='flex-row items-center justify-between mb-3'>
				<View className='flex-row items-center'>
					<Crown
						size={16}
						color={colors.warning}
						style={{ marginRight: 8 }}
					/>
					<Text
						className='text-xs font-semibold uppercase tracking-wider'
						style={{ color: colors.textSecondary }}
					>
						{t('roles')} — {roles.length}
					</Text>
				</View>
			</View>

			{/* Role list */}
			{roles.map(role => (
				<TouchableOpacity
					key={role.id}
					activeOpacity={0.6}
					onPress={() => onRolePress(role)}
					className='flex-row items-center px-4 py-3.5 rounded-xl mb-2'
					style={{
						backgroundColor: colors.backgroundSecondary,
						borderWidth: 1,
						borderColor: colors.border
					}}
				>
					<View
						style={{
							width: 14,
							height: 14,
							borderRadius: 7,
							backgroundColor: role.color,
							marginRight: 12
						}}
					/>
					<View className='flex-1'>
						<Text
							className='text-sm font-semibold'
							style={{ color: colors.text }}
						>
							{role.name}
						</Text>
						<Text
							className='text-xs mt-0.5'
							style={{ color: colors.textMuted }}
						>
							{getPermCount(role)} {t('of')} {permissions.length}{' '}
							{t('permissionsCount')}
						</Text>
					</View>
					<ChevronRight size={18} color={colors.textMuted} />
				</TouchableOpacity>
			))}

			{/* Create role button */}
			{canCreateRole && (
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={onCreatePress}
					className='flex-row items-center justify-center py-3.5 rounded-xl mt-1'
					style={{
						borderWidth: 1.5,
						borderColor: colors.accent,
						borderStyle: 'dashed'
					}}
				>
					<Plus
						size={18}
						color={colors.accent}
						style={{ marginRight: 8 }}
					/>
					<Text
						className='text-sm font-semibold'
						style={{ color: colors.accent }}
					>
						{t('createRole')}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

export default RolesSection
