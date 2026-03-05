import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { useTranslation } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'

import {
	GetFriendsQuery,
	GetIncomingFriendRequestsQuery,
	GetOutgoingFriendRequestsQuery,
	useAcceptFriendRequestMutation,
	useCancelFriendRequestMutation,
	useDeclineFriendRequestMutation,
	useFriendRemovedSubscription,
	useFriendRequestAcceptedSubscription,
	useFriendRequestCancelledSubscription,
	useFriendRequestDeclinedSubscription,
	useFriendRequestSentSubscription,
	useGetFriendsQuery,
	useGetIncomingFriendRequestsQuery,
	useGetOutgoingFriendRequestsQuery,
	useRemoveFriendMutation,
	useSendFriendRequestByUsernameMutation
} from '@/graphql/generated/output'

type Friend = GetFriendsQuery['getFriends'][0]
type IncomingRequest =
	GetIncomingFriendRequestsQuery['getIncomingFriendRequests'][0]
type OutgoingRequest =
	GetOutgoingFriendRequestsQuery['getOutgoingFriendRequests'][0]

export function useFriends() {
	const { userId } = useUser()
	const { t } = useTranslation()

	const [addFriendVisible, setAddFriendVisible] = useState(false)
	const [friendUsername, setFriendUsername] = useState('')

	const [friends, setFriends] = useState<Friend[]>([])
	const [incoming, setIncoming] = useState<IncomingRequest[]>([])
	const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([])

	// ── Queries ──
	const { data: friendsData, loading: isLoadingFriends } = useGetFriendsQuery(
		{ fetchPolicy: 'cache-and-network' }
	)
	const { data: incomingData, loading: isLoadingIncoming } =
		useGetIncomingFriendRequestsQuery({ fetchPolicy: 'cache-and-network' })
	const { data: outgoingData, loading: isLoadingOutgoing } =
		useGetOutgoingFriendRequestsQuery({ fetchPolicy: 'cache-and-network' })

	// ── Sync query data → state ──
	useEffect(() => {
		if (friendsData?.getFriends) {
			setFriends(friendsData.getFriends)
		}
	}, [friendsData])

	useEffect(() => {
		if (incomingData?.getIncomingFriendRequests) {
			setIncoming(incomingData.getIncomingFriendRequests)
		}
	}, [incomingData])

	useEffect(() => {
		if (outgoingData?.getOutgoingFriendRequests) {
			setOutgoing(outgoingData.getOutgoingFriendRequests)
		}
	}, [outgoingData])

	// ── Subscriptions (onData fires for EVERY event, unlike useEffect+data dep) ──
	useFriendRequestSentSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data: { data } }) => {
			const request = data?.friendRequestSent
			if (!request) return

			if (request.userId === userId) {
				setOutgoing(prev => {
					if (prev.some(r => r.id === request.id)) return prev
					return [request as OutgoingRequest, ...prev]
				})
			} else {
				setIncoming(prev => {
					if (prev.some(r => r.id === request.id)) return prev
					return [request as IncomingRequest, ...prev]
				})
			}
		}
	})

	useFriendRequestAcceptedSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data: { data } }) => {
			const accepted = data?.friendRequestAccepted
			if (!accepted) return

			setIncoming(prev => prev.filter(r => r.id !== accepted.id))
			setOutgoing(prev => prev.filter(r => r.id !== accepted.id))
			setFriends(prev => {
				if (prev.some(f => f.id === accepted.id)) return prev
				return [accepted as Friend, ...prev]
			})
		}
	})

	useFriendRequestDeclinedSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data: { data } }) => {
			const declined = data?.friendRequestDeclined
			if (!declined) return

			setOutgoing(prev => prev.filter(r => r.id !== declined.id))
			setIncoming(prev => prev.filter(r => r.id !== declined.id))
		}
	})

	useFriendRequestCancelledSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data: { data } }) => {
			const cancelled = data?.friendRequestCancelled
			if (!cancelled) return

			setOutgoing(prev => prev.filter(r => r.id !== cancelled.id))
			setIncoming(prev => prev.filter(r => r.id !== cancelled.id))
		}
	})

	useFriendRemovedSubscription({
		variables: { userId },
		skip: !userId,
		onData: ({ data: { data } }) => {
			const removed = data?.friendRemoved
			if (!removed) return

			setFriends(prev => prev.filter(f => f.id !== removed.id))
		}
	})

	// ── Mutations ──
	const [sendRequest, { loading: isSending }] =
		useSendFriendRequestByUsernameMutation({
			refetchQueries: ['GetOutgoingFriendRequests']
		})
	const [acceptRequest] = useAcceptFriendRequestMutation({
		refetchQueries: ['GetFriends', 'GetIncomingFriendRequests']
	})
	const [declineRequest] = useDeclineFriendRequestMutation({
		refetchQueries: ['GetIncomingFriendRequests']
	})
	const [cancelRequest] = useCancelFriendRequestMutation({
		refetchQueries: ['GetOutgoingFriendRequests']
	})
	const [removeFriend] = useRemoveFriendMutation({
		refetchQueries: ['GetFriends']
	})

	// ── Handlers ──
	const handleSendRequest = useCallback(async () => {
		const name = friendUsername.trim()
		if (!name) return
		try {
			await sendRequest({ variables: { username: name } })
			setFriendUsername('')
			setAddFriendVisible(false)
		} catch (e: any) {
			Alert.alert(t('error'), e.message ?? t('unknownError'))
		}
	}, [friendUsername, sendRequest, t])

	const handleAccept = useCallback(
		async (id: string) => {
			try {
				await acceptRequest({ variables: { friendshipId: id } })
			} catch (e: any) {
				Alert.alert(t('error'), e.message)
			}
		},
		[acceptRequest, t]
	)

	const handleDecline = useCallback(
		async (id: string) => {
			try {
				await declineRequest({ variables: { friendshipId: id } })
			} catch (e: any) {
				Alert.alert(t('error'), e.message)
			}
		},
		[declineRequest, t]
	)

	const handleCancel = useCallback(
		async (id: string) => {
			try {
				await cancelRequest({ variables: { friendshipId: id } })
			} catch (e: any) {
				Alert.alert(t('error'), e.message)
			}
		},
		[cancelRequest, t]
	)

	const handleRemoveFriend = useCallback(
		async (id: string) => {
			Alert.alert(t('removeFriend'), t('removeFriendConfirm'), [
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('remove'),
					style: 'destructive',
					onPress: async () => {
						try {
							await removeFriend({
								variables: { friendshipId: id }
							})
						} catch (e: any) {
							Alert.alert(t('error'), e.message)
						}
					}
				}
			])
		},
		[removeFriend, t]
	)

	const getFriendUser = (f: (typeof friends)[0]) =>
		f.user?.id === userId ? f.friend : f.user

	return {
		friends,
		incoming,
		outgoing,
		isLoadingFriends,
		isLoadingIncoming,
		isLoadingOutgoing,
		isSending,
		addFriendVisible,
		setAddFriendVisible,
		friendUsername,
		setFriendUsername,
		handleSendRequest,
		handleAccept,
		handleDecline,
		handleCancel,
		handleRemoveFriend,
		getFriendUser
	}
}
