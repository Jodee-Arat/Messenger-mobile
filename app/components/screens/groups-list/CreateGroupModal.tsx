import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button/Button'
import Checkbox from '@/components/ui/checkbox/Checkbox'

import {
	useCreateGroupMutation,
	useFindAllUsersQuery
} from '@/graphql/generated/output'
import {
	createGroupSchema,
	createGroupSchemaType
} from '@/schemas/group/create-group.schema'

const CreateGroupModal = () => {
	const [isOpen, setIsOpen] = useState(false)

	const {
		data,
		loading: isLoadingFindAllUsers,
		refetch
	} = useFindAllUsersQuery({
		skip: !isOpen
	})

	const form = useForm<createGroupSchemaType>({
		resolver: zodResolver(createGroupSchema),
		defaultValues: { groupName: '', userIds: [] }
	})

	const users = data?.findAllUsers ?? []

	const [createGroup, { loading: isLoadingCreate }] = useCreateGroupMutation({
		onCompleted() {
			Toast.show({
				type: 'success',
				text1: 'Group created successfully!'
			})
			setIsOpen(false)
			form.reset()
		},
		onError(error) {
			Toast.show({
				type: 'error',
				text1: 'Error creating group',
				text2: error.message || 'Something went wrong'
			})
		}
	})

	const onSubmit = (data: createGroupSchemaType) => {
		createGroup({
			variables: {
				data: { groupName: data.groupName, userIds: data.userIds }
			}
		})
	}

	useEffect(() => {
		if (isOpen) refetch()
	}, [isOpen])

	return (
		<>
			<Button onPress={() => setIsOpen(true)}>Create group</Button>

			<Modal visible={isOpen} animationType='slide' transparent>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						backgroundColor: 'rgba(0,0,0,0.5)'
					}}
				>
					<View
						style={{
							margin: 20,
							backgroundColor: '#fff',
							borderRadius: 8,
							padding: 16,
							maxHeight: '80%'
						}}
					>
						<Text
							style={{
								fontSize: 18,
								fontWeight: 'bold',
								marginBottom: 12
							}}
						>
							Create group
						</Text>

						<Controller
							control={form.control}
							name='groupName'
							render={({ field }) => (
								<TextInput
									style={{
										borderWidth: 1,
										borderColor: '#ccc',
										borderRadius: 6,
										padding: 8,
										marginBottom: 12
									}}
									placeholder='Enter group name'
									editable={!isLoadingCreate}
									value={field.value}
									onChangeText={field.onChange}
								/>
							)}
						/>

						{isLoadingFindAllUsers ? (
							<ActivityIndicator size='small' />
						) : (
							<ScrollView
								style={{ marginBottom: 16, maxHeight: 200 }}
							>
								{users.map(user => (
									<Controller
										key={user.id}
										control={form.control}
										name='userIds'
										render={({ field }) => (
											<View
												style={{
													flexDirection: 'row',
													alignItems: 'center',
													marginBottom: 8
												}}
											>
												<Checkbox
													checked={field.value.includes(
														user.id
													)}
													onCheckedChange={(
														checked: boolean
													) => {
														if (checked) {
															field.onChange([
																...field.value,
																user.id
															])
														} else {
															field.onChange(
																field.value.filter(
																	(
																		id: string
																	) =>
																		id !==
																		user.id
																)
															)
														}
													}}
												/>

												<Text style={{ marginLeft: 8 }}>
													{user.username}
												</Text>
											</View>
										)}
									/>
								))}
							</ScrollView>
						)}

						<Button
							disabled={
								!form.formState.isValid ||
								isLoadingCreate ||
								isLoadingFindAllUsers
							}
							onPress={form.handleSubmit(onSubmit)}
						>
							Submit
						</Button>

						<TouchableOpacity
							onPress={() => setIsOpen(false)}
							style={{ marginTop: 12 }}
						>
							<Text style={{ textAlign: 'center', color: 'red' }}>
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	)
}

export default CreateGroupModal
