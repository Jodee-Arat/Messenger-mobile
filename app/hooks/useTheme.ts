import { settingsStore } from '../store/settings/settings.store'

export interface ThemeColors {
	background: string
	backgroundSecondary: string
	backgroundTertiary: string
	card: string
	cardHover: string
	text: string
	textSecondary: string
	textMuted: string
	accent: string
	accentMuted: string
	border: string
	borderLight: string
	destructive: string
	destructiveMuted: string
	success: string
	successMuted: string
	warning: string
	gradientStart: string
	gradientMid: string
	gradientEnd: string
	inputBg: string
	overlay: string
}

const darkColors: ThemeColors = {
	background: 'hsl(252, 24%, 10%)',
	backgroundSecondary: 'hsl(252, 24%, 13%)',
	backgroundTertiary: 'hsl(252, 24%, 17%)',
	card: 'hsl(252, 24%, 13%)',
	cardHover: 'hsl(252, 24%, 16%)',
	text: 'hsl(250, 100%, 98%)',
	textSecondary: 'hsl(250, 15%, 55%)',
	textMuted: 'hsl(250, 15%, 40%)',
	accent: 'hsl(260, 85%, 65%)',
	accentMuted: 'hsla(260, 85%, 65%, 0.15)',
	border: 'hsl(250, 15%, 20%)',
	borderLight: 'hsl(250, 15%, 25%)',
	destructive: '#ef4444',
	destructiveMuted: 'hsla(0, 80%, 50%, 0.12)',
	success: 'hsl(140, 70%, 50%)',
	successMuted: 'hsla(140, 70%, 50%, 0.15)',
	warning: 'hsl(40, 90%, 55%)',
	gradientStart: 'hsl(260, 60%, 22%)',
	gradientMid: 'hsl(252, 40%, 14%)',
	gradientEnd: 'hsl(252, 24%, 10%)',
	inputBg: 'hsl(252, 24%, 10%)',
	overlay: 'rgba(0,0,0,0.5)'
}

const lightColors: ThemeColors = {
	background: 'hsl(250, 30%, 97%)',
	backgroundSecondary: 'hsl(250, 25%, 94%)',
	backgroundTertiary: 'hsl(250, 20%, 91%)',
	card: 'hsl(0, 0%, 100%)',
	cardHover: 'hsl(250, 25%, 96%)',
	text: 'hsl(250, 20%, 12%)',
	textSecondary: 'hsl(250, 12%, 45%)',
	textMuted: 'hsl(250, 10%, 62%)',
	accent: 'hsl(260, 85%, 60%)',
	accentMuted: 'hsla(260, 85%, 60%, 0.1)',
	border: 'hsl(250, 15%, 87%)',
	borderLight: 'hsl(250, 15%, 92%)',
	destructive: '#ef4444',
	destructiveMuted: 'hsla(0, 80%, 50%, 0.08)',
	success: 'hsl(140, 60%, 42%)',
	successMuted: 'hsla(140, 60%, 42%, 0.1)',
	warning: 'hsl(40, 85%, 50%)',
	gradientStart: 'hsl(260, 50%, 88%)',
	gradientMid: 'hsl(250, 30%, 94%)',
	gradientEnd: 'hsl(250, 30%, 97%)',
	inputBg: 'hsl(250, 20%, 95%)',
	overlay: 'rgba(0,0,0,0.25)'
}

export function useTheme() {
	const theme = settingsStore(state => state.theme)
	const language = settingsStore(state => state.language)
	const setTheme = settingsStore(state => state.setTheme)
	const toggleTheme = settingsStore(state => state.toggleTheme)
	const setLanguage = settingsStore(state => state.setLanguage)
	const toggleLanguage = settingsStore(state => state.toggleLanguage)

	const colors: ThemeColors = theme === 'dark' ? darkColors : lightColors
	const isDark = theme === 'dark'

	return {
		theme,
		language,
		colors,
		isDark,
		setTheme,
		toggleTheme,
		setLanguage,
		toggleLanguage
	}
}

type TranslationMap = Record<string, { ru: string; en: string }>

const translations: TranslationMap = {
	/* ─── Profile ─── */
	profile: { ru: 'Профиль', en: 'Profile' },
	editProfile: { ru: 'Редактировать профиль', en: 'Edit Profile' },
	settings: { ru: 'Настройки', en: 'Settings' },
	logout: { ru: 'Выйти', en: 'Log Out' },
	logoutConfirm: {
		ru: 'Вы уверены, что хотите выйти?',
		en: 'Are you sure you want to log out?'
	},
	cancel: { ru: 'Отмена', en: 'Cancel' },
	userSettings: { ru: 'Настройки', en: 'Settings' },
	profileTab: { ru: 'Профиль', en: 'Profile' },
	appearanceTab: { ru: 'Внешний вид', en: 'Appearance' },
	theme: { ru: 'Тема', en: 'Theme' },
	darkTheme: { ru: 'Тёмная', en: 'Dark' },
	lightTheme: { ru: 'Светлая', en: 'Light' },
	language: { ru: 'Язык', en: 'Language' },
	russian: { ru: 'Русский', en: 'Russian' },
	english: { ru: 'Английский', en: 'English' },
	changeAvatar: { ru: 'Сменить аватар', en: 'Change Avatar' },
	uploadAvatar: { ru: 'Загрузить аватар', en: 'Upload Avatar' },
	removeAvatar: { ru: 'Удалить аватар', en: 'Remove Avatar' },
	removeAvatarConfirm: {
		ru: 'Удалить ваш аватар?',
		en: 'Remove your avatar?'
	},
	avatarUpdated: { ru: 'Аватар обновлён', en: 'Avatar updated' },
	avatarRemoved: { ru: 'Аватар удалён', en: 'Avatar removed' },
	error: { ru: 'Ошибка', en: 'Error' },
	errorUpdatingAvatar: {
		ru: 'Ошибка обновления аватара',
		en: 'Error updating avatar'
	},
	errorRemovingAvatar: {
		ru: 'Ошибка удаления аватара',
		en: 'Error removing avatar'
	},
	personalInfo: { ru: 'Личные данные', en: 'Personal Info' },
	username: { ru: 'Имя пользователя', en: 'Username' },
	usernamePlaceholder: { ru: 'Введите имя', en: 'Enter username' },
	bio: { ru: 'О себе', en: 'Bio' },
	bioPlaceholder: { ru: 'Расскажите о себе', en: 'Tell about yourself' },
	save: { ru: 'Сохранить', en: 'Save' },
	profileUpdated: { ru: 'Профиль обновлён', en: 'Profile updated' },
	profileUpdateSuccess: {
		ru: 'Информация успешно обновлена',
		en: 'Information updated successfully'
	},
	updateFailed: { ru: 'Ошибка обновления', en: 'Update failed' },
	member_since: { ru: 'В приложении с', en: 'Member since' },
	groups: { ru: 'Группы', en: 'Groups' },
	chats: { ru: 'Чаты', en: 'Chats' },
	remove: { ru: 'Удалить', en: 'Remove' },
	chooseTheme: {
		ru: 'Выберите тему оформления',
		en: 'Choose appearance theme'
	},
	chooseLanguage: {
		ru: 'Выберите язык интерфейса',
		en: 'Choose interface language'
	},

	/* ─── Home ─── */
	messages: { ru: 'Сообщения', en: 'Messages' },
	addFriend: { ru: 'Добавить друга', en: 'Add Friend' },
	findPeople: { ru: 'Найти людей', en: 'Find People' },
	favorites: { ru: 'Избранное', en: 'Favorites' },
	online: { ru: 'В сети', en: 'Online' },
	all: { ru: 'Все', en: 'All' },
	pending: { ru: 'Ожидание...', en: 'Pending...' },
	friendRequestSent: {
		ru: 'Заявка в друзья отправлена',
		en: 'Friend request sent'
	},
	directMessages: { ru: 'Личные сообщения', en: 'Direct Messages' },
	noDirectMessages: {
		ru: 'Пока нет личных сообщений',
		en: 'No direct messages yet'
	},
	addFriendsHint: {
		ru: 'Добавьте друзей или начните чат в одной из групп',
		en: 'Add friends or start a chat in a group'
	},
	draft: { ru: 'Черновик', en: 'Draft' },
	noMessages: { ru: 'Нет сообщений', en: 'No messages' },
	user: { ru: 'Пользователь', en: 'User' },

	/* ─── Groups ─── */
	noGroups: { ru: 'Нет групп', en: 'No groups' },
	createGroupHint: {
		ru: 'Создайте группу, чтобы начать общение',
		en: 'Create a group to start chatting'
	},
	groupDeleted: { ru: 'Группа удалена', en: 'Group deleted' },
	deleteError: { ru: 'Ошибка удаления', en: 'Delete error' },
	deleteGroup: { ru: 'Удалить группу', en: 'Delete group' },
	newGroup: { ru: 'Новая группа', en: 'New group' },
	groupName: { ru: 'Название группы', en: 'Group name' },
	groupNamePlaceholder: { ru: 'Введите название...', en: 'Enter name...' },
	members: { ru: 'Участники', en: 'Members' },
	selected: { ru: 'выбрано', en: 'selected' },
	createGroup: { ru: 'Создать группу', en: 'Create group' },
	groupCreated: { ru: 'Группа создана!', en: 'Group created!' },
	createError: { ru: 'Ошибка создания', en: 'Create error' },
	noFriendsForGroup: {
		ru: 'У вас пока нет друзей для добавления в группу',
		en: 'You have no friends to add to a group yet'
	},

	/* ─── Chats ─── */
	noChats: { ru: 'Чатов пока нет', en: 'No chats yet' },
	chatDeleted: { ru: 'Чат удалён', en: 'Chat deleted' },
	deleteChat: { ru: 'Удалить чат', en: 'Delete chat' },
	leaveChat: { ru: 'Покинуть чат', en: 'Leave chat' },
	leaveChatConfirm: {
		ru: 'Вы уверены, что хотите покинуть этот чат?',
		en: 'Are you sure you want to leave this chat?'
	},
	leaveChatSuccess: { ru: 'Вы покинули чат', en: 'You left the chat' },
	leaveChatError: {
		ru: 'Не удалось покинуть чат',
		en: 'Failed to leave the chat'
	},
	newChat: { ru: 'Новый чат', en: 'New chat' },
	chatName: { ru: 'Название чата', en: 'Chat name' },
	secretChat: { ru: 'Секретный чат', en: 'Secret chat' },
	secretChatHint: { ru: 'Сквозное шифрование', en: 'End-to-end encrypted' },
	secretLabel: { ru: 'СЕКРЕТНЫЙ', en: 'SECRET' },

	/* ─── TOTP Chat Gate ─── */
	totpRequired: {
		ru: 'Требуется TOTP-код',
		en: 'TOTP code required'
	},
	totpRequiredHint: {
		ru: 'Для входа в этот чат введите код из приложения-аутентификатора',
		en: 'Enter the code from your authenticator app to access this chat'
	},
	totpVerify: { ru: 'Подтвердить', en: 'Verify' },
	totpInvalidCode: {
		ru: 'Неверный код. Попробуйте ещё раз',
		en: 'Invalid code. Please try again'
	},
	totpVerifyError: {
		ru: 'Ошибка проверки кода',
		en: 'Code verification failed'
	},
	requireTotpLabel: {
		ru: 'Требовать TOTP для входа',
		en: 'Require TOTP to enter'
	},
	requireTotpHint: {
		ru: 'Все участники должны вводить TOTP-код при входе в чат',
		en: 'All members must enter a TOTP code when entering the chat'
	},
	requireTotpAllMembers: {
		ru: 'Все участники должны включить TOTP',
		en: 'All members must have TOTP enabled'
	},
	back: { ru: 'Назад', en: 'Back' },

	/* ─── Fingerprint Verification ─── */
	fingerprintVerification: {
		ru: 'Проверка ключей',
		en: 'Key Verification'
	},
	fingerprintHint: {
		ru: 'Сравните отпечатки вживую',
		en: 'Compare fingerprints in person'
	},
	fingerprintDescription: {
		ru: 'Каждый участник имеет уникальный криптографический отпечаток. Сравните его лично или по другому каналу связи, чтобы убедиться в подлинности ключей.',
		en: 'Each participant has a unique cryptographic fingerprint. Compare it in person or via another channel to verify key authenticity.'
	},
	fingerprintLabel: {
		ru: 'ОТПЕЧАТОК КЛЮЧА (ГОСТ Р 34.11 СТРИБОГ)',
		en: 'KEY FINGERPRINT (GOST R 34.11 STREEBOG)'
	},
	copyFingerprint: {
		ru: 'Скопировать отпечаток',
		en: 'Copy fingerprint'
	},
	computingFingerprints: {
		ru: 'Вычисление отпечатков…',
		en: 'Computing fingerprints…'
	},
	fingerprintVerifyTip: {
		ru: 'Для верификации: встретьтесь лично и сравните визуальные паттерны и числовые коды. Если они совпадают — связь защищена и ключи не были подменены.',
		en: 'To verify: meet in person and compare visual patterns and numeric codes. If they match, the connection is secure and keys have not been tampered with.'
	},
	you: { ru: 'Вы', en: 'You' },
	backToList: { ru: 'Назад к списку', en: 'Back to list' },
	participantsCount: { ru: 'участников', en: 'participants' },
	chatFallback: { ru: 'Чат', en: 'Chat' },
	createChat: { ru: 'Создать чат', en: 'Create chat' },
	chatCreated: { ru: 'Чат создан!', en: 'Chat created!' },
	files: { ru: 'файл(ов)', en: 'file(s)' },

	/* ─── Auth ─── */
	signUp: { ru: 'Регистрация', en: 'Sign Up' },
	login: { ru: 'Вход', en: 'Login' },
	brandTagline: {
		ru: 'Безопасные сообщения, группы и приватные чаты',
		en: 'Secure messaging, groups, and private chats'
	},
	enterLogin: { ru: 'Введите логин', en: 'Enter login' },
	enterEmail: { ru: 'Введите email', en: 'Enter email' },
	enterPassword: { ru: 'Введите пароль', en: 'Enter password' },
	loginRequired: { ru: 'Логин обязателен!', en: 'Login is required!' },
	loginMin: { ru: 'Минимум 3 символа', en: 'Minimum 3 characters' },
	emailRequired: { ru: 'Email обязателен!', en: 'Email is required!' },
	emailInvalid: {
		ru: 'Введите корректный email',
		en: 'Please enter a valid email'
	},
	passwordRequired: { ru: 'Пароль обязателен!', en: 'Password is required!' },
	passwordMin: { ru: 'Минимум 8 символов', en: 'Minimum 8 characters' },
	passwordPattern: {
		ru: 'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол',
		en: 'Password must contain an uppercase letter, a lowercase letter, a number, and a special character'
	},
	alreadyHaveAccount: {
		ru: 'Уже есть аккаунт? ',
		en: 'Already have an account? '
	},
	noAccount: { ru: 'Нет аккаунта? ', en: "Don't have an account? " },
	totpVerification: { ru: 'Проверка TOTP', en: 'TOTP Verification' },
	totpAuthHint: {
		ru: 'Введите 6-значный код из приложения-аутентификатора',
		en: 'Enter the 6-digit code from your authenticator app'
	},
	backToLogin: { ru: 'Вернуться ко входу', en: 'Back to login' },

	/* ─── Favorites ─── */
	editProfileBtn: { ru: 'Редактировать профиль', en: 'Edit profile' },
	checkE2EE: { ru: 'Проверить X3DH (ГОСТ)', en: 'Check X3DH (GOST)' },
	running: { ru: 'Запуск…', en: 'Running…' },

	/* ─── Chat ─── */
	loadingChat: { ru: 'Загрузка чата...', en: 'Loading chat...' },

	/* ─── Messages ─── */
	empty: { ru: 'Пусто', en: 'Empty' },
	messageDeleted: { ru: 'Сообщение удалено', en: 'Message deleted' },
	messagesDeletedSuccess: {
		ru: 'Сообщения удалены успешно',
		en: 'Messages deleted successfully'
	},
	messageDeleteSuccess: {
		ru: 'Сообщение удалено',
		en: 'Message deleted successfully'
	},
	failedDeleteMessages: {
		ru: 'Ошибка при удалении сообщений',
		en: 'Failed to delete messages'
	},
	somethingWentWrong: {
		ru: 'Что-то пошло не так',
		en: 'Something went wrong'
	},
	messagePinned: { ru: 'Сообщение закреплено', en: 'Message pinned' },
	pinError: { ru: 'Ошибка закрепления', en: 'Pin error' },
	unpinError: { ru: 'Ошибка открепления', en: 'Failed to unpin message' },
	select: { ru: 'Выбрать', en: 'Select' },
	deselect: { ru: 'Отменить выбор', en: 'Deselect' },
	reply: { ru: 'Ответить', en: 'Reply' },
	copy: { ru: 'Копировать', en: 'Copy' },
	textCopied: { ru: 'Текст скопирован', en: 'Text copied' },
	edit: { ru: 'Редактировать', en: 'Edit' },
	edited: { ru: 'Изменено', en: 'Edited' },
	pin: { ru: 'Закрепить', en: 'Pin' },
	delete: { ru: 'Удалить', en: 'Delete' },
	deleting: { ru: 'Удаление...', en: 'Deleting...' },
	forwardMessages: { ru: 'Переслать сообщения', en: 'Forward messages' },
	forward: { ru: 'Переслать', en: 'Forward' },
	messageForwarded: {
		ru: 'Сообщение переслано',
		en: 'Message forwarded successfully'
	},
	forwardError: { ru: 'Ошибка пересылки', en: 'Error forwarding message' },
	noMessagesSelected: {
		ru: 'Сообщения не выбраны',
		en: 'No messages selected to forward'
	},
	selectAtLeastOneChat: {
		ru: 'Выберите хотя бы один чат',
		en: 'Select at least one chat'
	},
	addMessageOptional: {
		ru: 'Добавить сообщение (необязательно)',
		en: 'Add message (optional)'
	},
	writeMessage: { ru: 'Написать сообщение...', en: 'Write a message...' },
	fileDownloadError: {
		ru: 'Ошибка при загрузке файла',
		en: 'Error downloading file'
	},
	fileDownloadFailed: {
		ru: 'Не удалось скачать файл',
		en: 'Failed to download file'
	},
	tryAgain: { ru: 'Попробуйте снова', en: 'Try again' },
	copied: { ru: 'Скопировано', en: 'Copied' },
	fileSaved: { ru: 'Сохранено в галерею', en: 'Saved to gallery' },
	saveToGallery: { ru: 'Сохранить', en: 'Save' },
	shareFile: { ru: 'Поделиться', en: 'Share' },
	permissionDenied: { ru: 'Нет разрешения', en: 'Permission denied' },
	encrypting: { ru: 'Шифрование...', en: 'Encrypting...' },
	uploading: { ru: 'Загрузка...', en: 'Uploading...' },
	messagesCount: { ru: 'сообщений', en: 'messages' },

	/* ─── Group/Chat Settings ─── */
	roles: { ru: 'Роли', en: 'Roles' },
	createRole: { ru: 'Создать роль', en: 'Create role' },
	roleName: { ru: 'Название роли', en: 'Role name' },
	roleColor: { ru: 'Цвет роли', en: 'Role color' },
	permissions: { ru: 'Разрешения', en: 'Permissions' },
	saveRole: { ru: 'Сохранить роль', en: 'Save role' },
	deleteRole: { ru: 'Удалить роль', en: 'Delete role' },
	assignRole: { ru: 'Назначить роль', en: 'Assign role' },
	owner: { ru: 'Владелец', en: 'Owner' },
	admin: { ru: 'Администратор', en: 'Administrator' },
	member: { ru: 'Участник', en: 'Member' },
	addMembers: { ru: 'Добавить участников', en: 'Add members' },
	groupInfo: { ru: 'Информация о группе', en: 'Group info' },
	chatInfo: { ru: 'Информация о чате', en: 'Chat info' },
	dangerZone: { ru: 'Опасная зона', en: 'Danger zone' },
	canCreateChats: { ru: 'Создавать чаты', en: 'Create chats' },
	canCreateChatsDesc: {
		ru: 'Позволяет создавать новые чаты в группе',
		en: 'Allows creating new chats in the group'
	},
	canDeleteChats: { ru: 'Удалять чаты', en: 'Delete chats' },
	canDeleteChatsDesc: {
		ru: 'Позволяет удалять существующие чаты',
		en: 'Allows deleting existing chats'
	},
	canManageMembers: { ru: 'Управлять участниками', en: 'Manage members' },
	canManageMembersDesc: {
		ru: 'Позволяет добавлять и удалять участников группы',
		en: 'Allows adding and removing group members'
	},
	canManageRoles: { ru: 'Управлять ролями', en: 'Manage roles' },
	canManageRolesDesc: {
		ru: 'Позволяет создавать, редактировать и удалять роли',
		en: 'Allows creating, editing and deleting roles'
	},
	canSendMessages: { ru: 'Отправлять сообщения', en: 'Send messages' },
	canSendMessagesDesc: {
		ru: 'Позволяет отправлять сообщения в чат',
		en: 'Allows sending messages in chat'
	},
	canDeleteMessages: { ru: 'Удалять сообщения', en: 'Delete messages' },
	canDeleteMessagesDesc: {
		ru: 'Позволяет удалять чужие сообщения',
		en: 'Allows deleting others messages'
	},
	canPinMessages: { ru: 'Закреплять сообщения', en: 'Pin messages' },
	canPinMessagesDesc: {
		ru: 'Позволяет закреплять и откреплять сообщения',
		en: 'Allows pinning and unpinning messages'
	},
	canManageGroup: { ru: 'Управлять группой', en: 'Manage group' },
	canManageGroupDesc: {
		ru: 'Позволяет изменять название, аватар и настройки группы',
		en: 'Allows changing name, avatar and group settings'
	},
	canViewHistory: { ru: 'Просматривать историю', en: 'View history' },
	canViewHistoryDesc: {
		ru: 'Позволяет просматривать историю сообщений',
		en: 'Allows viewing message history'
	},
	groupSettingsTitle: { ru: 'Настройки группы', en: 'Group settings' },
	chatSettingsTitle: { ru: 'Настройки чата', en: 'Chat settings' },
	moderator: { ru: 'Модератор', en: 'Moderator' },
	noRole: { ru: 'Нет роли', en: 'No role' },
	withoutRole: { ru: 'Без роли', en: 'Without role' },
	enabled: { ru: 'Вкл', en: 'On' },
	disabled: { ru: 'Выкл', en: 'Off' },
	membersWithRole: {
		ru: 'Участники с этой ролью',
		en: 'Members with this role'
	},
	noMembersWithRole: {
		ru: 'Нет участников с этой ролью',
		en: 'No members with this role'
	},
	numberOfChats: { ru: 'чатов', en: 'chats' },
	oneChat: { ru: 'чат', en: 'chat' },
	permissionsCount: { ru: 'разрешений', en: 'permissions' },
	exampleRole: { ru: 'Например: Модератор', en: 'E.g.: Moderator' },
	of: { ru: 'из', en: 'of' },
	description: { ru: 'Описание', en: 'Description' },
	descriptionPlaceholder: {
		ru: 'Введите описание...',
		en: 'Enter description...'
	},
	saveChanges: { ru: 'Сохранить изменения', en: 'Save changes' },
	groupInfoUpdated: {
		ru: 'Информация о группе обновлена',
		en: 'Group info updated'
	},
	groupInfoUpdateError: {
		ru: 'Ошибка обновления информации о группе',
		en: 'Error updating group info'
	},
	groupAvatarUpdated: {
		ru: 'Аватар группы обновлён',
		en: 'Group avatar updated'
	},
	groupAvatarRemoved: {
		ru: 'Аватар группы удалён',
		en: 'Group avatar removed'
	},
	inviteMember: { ru: 'Пригласить участника', en: 'Invite member' },
	removeMember: { ru: 'Удалить участника', en: 'Remove member' },
	removeMemberConfirm: {
		ru: 'Вы уверены, что хотите удалить этого участника из группы?',
		en: 'Are you sure you want to remove this member from the group?'
	},
	memberInvited: { ru: 'Участник приглашён', en: 'Member invited' },
	memberRemoved: { ru: 'Участник удалён', en: 'Member removed' },
	inviteError: { ru: 'Ошибка приглашения', en: 'Invite error' },
	removeError: { ru: 'Ошибка удаления', en: 'Remove error' },
	deleteGroupConfirm: {
		ru: 'Вы уверены, что хотите удалить эту группу? Это действие необратимо.',
		en: 'Are you sure you want to delete this group? This action cannot be undone.'
	},
	searchUsers: { ru: 'Поиск пользователей...', en: 'Search users...' },
	noUsersFound: {
		ru: 'Пользователи не найдены',
		en: 'No users found'
	},
	alreadyMember: { ru: 'Уже участник', en: 'Already a member' },
	invite: { ru: 'Пригласить', en: 'Invite' },
	cannotRemoveCreator: {
		ru: 'Невозможно удалить создателя группы',
		en: 'Cannot remove group creator'
	},

	/* ─── Friend Profile ─── */
	friendProfile: { ru: 'Профиль друга', en: 'Friend Profile' },
	friendSince: { ru: 'Дружите с', en: 'Friends since' },
	friendDurationToday: { ru: 'Сегодня', en: 'Today' },
	friendDurationDay: { ru: 'день', en: 'day' },
	friendDurationDays: { ru: 'дней', en: 'days' },
	friendDurationMonth: { ru: 'месяц', en: 'month' },
	friendDurationMonths: { ru: 'месяцев', en: 'months' },
	friendDurationYear: { ru: 'год', en: 'year' },
	friendDurationYears: { ru: 'лет', en: 'years' },
	status: { ru: 'Статус', en: 'Status' },
	friendStatusOnline: { ru: 'В сети', en: 'Online' },
	friendTrust: { ru: 'Доверие', en: 'Trust' },
	friendTrustVerified: { ru: 'Проверен', en: 'Verified' },
	actions: { ru: 'Действия', en: 'Actions' },
	sendMessage: { ru: 'Написать сообщение', en: 'Send Message' },
	sendMessageHint: {
		ru: 'Открыть личные сообщения',
		en: 'Open direct messages'
	},
	copyUsername: { ru: 'Копировать никнейм', en: 'Copy Username' },
	removeFriend: { ru: 'Удалить из друзей', en: 'Remove Friend' },
	removeFriendConfirm: {
		ru: 'Вы уверены, что хотите удалить этого пользователя из друзей?',
		en: 'Are you sure you want to remove this friend?'
	},
	removeFriendHint: {
		ru: 'Пользователь будет удалён из вашего списка',
		en: 'User will be removed from your list'
	},
	blockUser: { ru: 'Заблокировать', en: 'Block User' },
	blockUserConfirm: {
		ru: 'Вы уверены, что хотите заблокировать этого пользователя?',
		en: 'Are you sure you want to block this user?'
	},
	blockUserHint: {
		ru: 'Пользователь не сможет вам писать',
		en: 'User will not be able to message you'
	},
	block: { ru: 'Заблокировать', en: 'Block' },
	newMessage: { ru: 'Новое сообщение', en: 'New message' },

	/* ─── Sessions ─── */
	sessionsTab: { ru: 'Сессии', en: 'Sessions' },
	sessionCurrentTitle: { ru: 'Текущая сессия', en: 'Current session' },
	sessionCurrent: { ru: 'Активна', en: 'Active' },
	sessionOther: { ru: 'Другие сессии', en: 'Other sessions' },
	sessionNone: { ru: 'Нет активных сессий', en: 'No active sessions' },
	unblockUser: { ru: 'Разблокировать', en: 'Unblock User' },
	unblockUserConfirm: {
		ru: 'Вы уверены, что хотите разблокировать этого пользователя?',
		en: 'Are you sure you want to unblock this user?'
	},
	unblockUserHint: {
		ru: 'После разблокировки можно снова открыть личное общение',
		en: 'After unblocking, direct contact can be opened again'
	},
	blockedUsers: {
		ru: 'Заблокированные пользователи',
		en: 'Blocked Users'
	},
	blockedUsersHint: {
		ru: 'Управляйте теми, кого вы заблокировали',
		en: 'Manage people you have blocked'
	},
	blockedUsersLoading: {
		ru: 'Загружаем список блокировок...',
		en: 'Loading blocked users...'
	},
	blockedUsersLoadErrorTitle: {
		ru: 'Не удалось загрузить список',
		en: 'Failed to load blocked users'
	},
	blockedUsersLoadError: {
		ru: 'Не удалось загрузить заблокированных пользователей',
		en: 'Could not load blocked users'
	},
	blockedUsersEmptyTitle: {
		ru: 'Список пуст',
		en: 'Nothing blocked yet'
	},
	blockedUsersEmpty: {
		ru: 'Здесь появятся люди, которых вы заблокировали.',
		en: 'People you block will appear here.'
	},
	blockedOn: {
		ru: 'Заблокирован',
		en: 'Blocked on'
	},
	directChatUnavailable: {
		ru: 'Личный чат недоступен',
		en: 'Direct chat unavailable'
	},
	directChatBlockedDescription: {
		ru: 'Личное общение недоступно, потому что один из вас заблокировал другого.',
		en: 'Direct contact is unavailable because one of you has blocked the other.'
	},
	blockedProfileTitle: {
		ru: 'Пользователь заблокирован',
		en: 'User is blocked'
	},
	blockedProfileDescription: {
		ru: 'Пока блокировка активна, личный и секретный чат недоступны.',
		en: 'While this block is active, direct and secret chats stay unavailable.'
	},
	manageBlockedUsers: {
		ru: 'Управлять блокировками',
		en: 'Manage blocked users'
	},
	unknownUser: { ru: 'Неизвестный', en: 'Unknown user' },
	friends: { ru: 'Друзья', en: 'Friends' },
	incoming: { ru: 'Входящие', en: 'Incoming' },
	outgoing: { ru: 'Исходящие', en: 'Outgoing' },
	incomingRequest: { ru: 'Входящая заявка', en: 'Incoming request' },
	acceptFriendRequest: { ru: 'Принять заявку', en: 'Accept request' },
	outgoingRequest: { ru: 'Исходящая заявка', en: 'Outgoing request' },
	noFriends: { ru: 'Пока нет друзей', en: 'No friends yet' },
	noPendingRequests: {
		ru: 'Нет ожидающих заявок',
		en: 'No pending requests'
	},
	enterUsername: { ru: 'Введите никнейм', en: 'Enter username' },
	chatNamePlaceholder: {
		ru: 'Введите название чата...',
		en: 'Enter chat name...'
	},
	deleteChatConfirm: {
		ru: 'Вы уверены, что хотите удалить этот чат? Это действие необратимо.',
		en: 'Are you sure you want to delete this chat? This action cannot be undone.'
	},
	noSendPermission: {
		ru: 'У вас нет прав на отправку сообщений',
		en: 'You do not have permission to send messages'
	},
	send: { ru: 'Отправить', en: 'Send' },
	retry: { ru: 'Повторить', en: 'Retry' },
	typing: { ru: 'Печатает...', en: 'Typing...' },
	pinChat: { ru: 'Закрепить чат', en: 'Pin chat' },
	unpinChat: { ru: 'Открепить чат', en: 'Unpin chat' },
	canInviteMembers: {
		ru: 'Приглашать участников',
		en: 'Invite members'
	},
	canInviteMembersDesc: {
		ru: 'Позволяет добавлять новых участников',
		en: 'Allows inviting new members'
	},
	canRemoveMembers: {
		ru: 'Удалять участников',
		en: 'Remove members'
	},
	canRemoveMembersDesc: {
		ru: 'Позволяет исключать участников из группы или чата',
		en: 'Allows removing members from a group or chat'
	},
	canCreateRoles: { ru: 'Создавать роли', en: 'Create roles' },
	canCreateRolesDesc: {
		ru: 'Позволяет создавать новые роли',
		en: 'Allows creating new roles'
	},
	canDeleteRoles: { ru: 'Удалять роли', en: 'Delete roles' },
	canDeleteRolesDesc: {
		ru: 'Позволяет удалять уже созданные роли',
		en: 'Allows deleting existing roles'
	},
	canChangeRoleInfo: {
		ru: 'Изменять информацию о роли',
		en: 'Change role info'
	},
	canChangeRoleInfoDesc: {
		ru: 'Позволяет изменять название, цвет и настройки роли',
		en: 'Allows changing role name, color and settings'
	},
	canEditMessages: {
		ru: 'Редактировать сообщения',
		en: 'Edit messages'
	},
	canEditMessagesDesc: {
		ru: 'Позволяет изменять отправленные сообщения',
		en: 'Allows editing sent messages'
	},
	canChangeChatInfo: {
		ru: 'Изменять информацию о чате',
		en: 'Change chat info'
	},
	canChangeChatInfoDesc: {
		ru: 'Позволяет изменять описание и настройки чата',
		en: 'Allows changing chat description and settings'
	},
	canChangeChatName: {
		ru: 'Изменять название чата',
		en: 'Change chat name'
	},
	canChangeChatNameDesc: {
		ru: 'Позволяет переименовывать чат',
		en: 'Allows renaming the chat'
	},
	canChangeChatAvatar: {
		ru: 'Изменять аватар чата',
		en: 'Change chat avatar'
	},
	canChangeChatAvatarDesc: {
		ru: 'Позволяет менять аватар чата',
		en: 'Allows changing the chat avatar'
	},
	canChangeGroupInfo: {
		ru: 'Изменять информацию о группе',
		en: 'Change group info'
	},
	canChangeGroupInfoDesc: {
		ru: 'Позволяет изменять описание и настройки группы',
		en: 'Allows changing group description and settings'
	},
	canChangeGroupName: {
		ru: 'Изменять название группы',
		en: 'Change group name'
	},
	canChangeGroupNameDesc: {
		ru: 'Позволяет переименовывать группу',
		en: 'Allows renaming the group'
	},
	canChangeGroupAvatar: {
		ru: 'Изменять аватар группы',
		en: 'Change group avatar'
	},
	canChangeGroupAvatarDesc: {
		ru: 'Позволяет менять аватар группы',
		en: 'Allows changing the group avatar'
	},
	canDeleteGroup: { ru: 'Удалять группу', en: 'Delete group' },
	canDeleteGroupDesc: {
		ru: 'Позволяет полностью удалить группу',
		en: 'Allows deleting the entire group'
	},
	canSecretChat: {
		ru: 'Использовать секретный чат',
		en: 'Use secret chat'
	},
	canSecretChatDesc: {
		ru: 'Позволяет открывать секретные чаты',
		en: 'Allows opening secret chats'
	},
	window: { ru: 'Окно', en: 'Window' }
}

const fallbackTranslations: Record<string, { ru: string; en: string }> = {
	searchFriendsPlaceholder: {
		ru: 'Поиск друзей и заявок...',
		en: 'Search friends and requests...'
	},
	searchDirectMessagesPlaceholder: {
		ru: 'Поиск чатов...',
		en: 'Search chats...'
	},
	noSearchResults: {
		ru: 'Ничего не найдено',
		en: 'Nothing found'
	},
	tryDifferentQuery: {
		ru: 'Попробуйте другой запрос',
		en: 'Try a different query'
	},
	searchChatsPlaceholder: {
		ru: 'Поиск чатов...',
		en: 'Search chats...'
	},
	searchGroupsPlaceholder: {
		ru: 'Поиск групп...',
		en: 'Search groups...'
	}
}

export function useTranslation() {
	const language = settingsStore(state => state.language)

	const t = (key: string): string => {
		const entry = translations[key] ?? fallbackTranslations[key]
		if (!entry) return key
		return entry[language] ?? key
	}

	return { t, language }
}
