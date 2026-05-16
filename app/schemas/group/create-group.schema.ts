import { z } from 'zod'

type CreateGroupValidationTranslator = (
	key: 'groupNameRequired' | 'selectAtLeastOneUser'
) => string

const defaultMessages: Record<
	Parameters<CreateGroupValidationTranslator>[0],
	string
> = {
	groupNameRequired: 'Group name is required.',
	selectAtLeastOneUser: 'You have to select at least one user.'
}

const defaultT: CreateGroupValidationTranslator = key => defaultMessages[key]

export const createGroupSchemaFactory = (
	t: CreateGroupValidationTranslator = defaultT
) =>
	z.object({
		groupName: z.string().min(1, {
			message: t('groupNameRequired')
		}),
		userIds: z.array(z.string()).min(1, {
			message: t('selectAtLeastOneUser')
		})
	})

export const createGroupSchema = createGroupSchemaFactory()

export type createGroupSchemaType = z.infer<
	ReturnType<typeof createGroupSchemaFactory>
>
