import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions } from 'react-native'
import Toast from 'react-native-toast-message'

import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTranslation } from '@/hooks/useTheme'

import {
	FindAllGroupsByUserQuery,
	useDeleteGroupMutation,
	useFindAllGroupsByUserQuery,
	useGroupAddedSubscription,
	useGroupDeletedSubscription
} from '@/graphql/generated/output'

const SCREEN_WIDTH = Dimensions.get('window').width
export const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.82

export function useGroupsSidebar(
	visible: boolean,
	onClose: () => void,
	searchTerm?: string
) {
	const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current
	const [showModal, setShowModal] = useState(false)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [longPressGroup, setLongPressGroup] = useState<
		FindAllGroupsByUserQuery['findAllGroupsByUser'][0] | null
	>(null)

	const { exit } = useAuth()
	const { user } = useCurrentUser()
	const { t } = useTranslation()

	// ── Groups data ──
	const [allGroups, setAllGroups] = useState<
		FindAllGroupsByUserQuery['findAllGroupsByUser']
	>([])
	const [isRefreshingGroups, setIsRefreshingGroups] = useState(false)

	const {
		data: allGroupsData,
		loading: isLoadingGroups,
		refetch: refetchGroups
	} = useFindAllGroupsByUserQuery({
		variables: { filters: { searchTerm: searchTerm || undefined } },
		skip: !user?.id,
		fetchPolicy: 'network-only'
	})

	const { data: newGroupData } = useGroupAddedSubscription({
		variables: { userId: user?.id ?? '' },
		skip: !user?.id
	})

	const { data: deleteGroupData } = useGroupDeletedSubscription({
		variables: { userId: user?.id ?? '' }
	})

	const [deleteGroup] = useDeleteGroupMutation({
		onCompleted() {
			Toast.show({ type: 'success', text1: t('groupDeleted') })
		},
		onError(err) {
			Toast.show({
				type: 'error',
				text1: t('deleteError'),
				text2: err.message
			})
		}
	})

	useEffect(() => {
		setAllGroups([])
	}, [user?.id])

	useEffect(() => {
		if (allGroupsData?.findAllGroupsByUser)
			setAllGroups(allGroupsData.findAllGroupsByUser)
	}, [allGroupsData])

	const handleRefreshGroups = async () => {
		if (!user?.id) return
		setIsRefreshingGroups(true)
		try {
			await refetchGroups()
		} finally {
			setIsRefreshingGroups(false)
		}
	}

	useEffect(() => {
		if (newGroupData?.groupAdded)
			setAllGroups(prev => {
				if (prev.some(g => g.id === newGroupData.groupAdded.id))
					return prev
				return [newGroupData.groupAdded, ...prev]
			})
	}, [newGroupData])

	useEffect(() => {
		if (deleteGroupData?.groupDeleted)
			setAllGroups(prev =>
				prev.filter(g => g.id !== deleteGroupData.groupDeleted.id)
			)
	}, [deleteGroupData])

	useEffect(() => {
		if (!visible || !user?.id) return
		void refetchGroups()
	}, [visible, user?.id, refetchGroups])

	// ── Animations ──
	useEffect(() => {
		if (visible) {
			setShowModal(true)
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		} else {
			Animated.timing(slideAnim, {
				toValue: -SIDEBAR_WIDTH,
				duration: 200,
				useNativeDriver: true
			}).start(() => setShowModal(false))
		}
	}, [visible])

	return {
		slideAnim,
		showModal,
		isCreateOpen,
		setIsCreateOpen,
		longPressGroup,
		setLongPressGroup,
		allGroups,
		isLoadingGroups,
		isRefreshingGroups,
		handleRefreshGroups,
		deleteGroup,
		user,
		exit
	}
}
