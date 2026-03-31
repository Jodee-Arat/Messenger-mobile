import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AttachFileModel = {
  __typename?: 'AttachFileModel';
  chatDraftMessageId: Scalars['String']['output'];
  fileId: Scalars['String']['output'];
};

export type AuthModel = {
  __typename?: 'AuthModel';
  accessToken?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  sessionId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UserModel>;
};

export type ChangeChatInfoInput = {
  chatName: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type ChangeGroupInfoInput = {
  description: Scalars['String']['input'];
  groupName: Scalars['String']['input'];
};

export type ChangeProfileInfoInput = {
  bio: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type ChatDraftMessageModel = {
  __typename?: 'ChatDraftMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  editId?: Maybe<Scalars['String']['output']>;
  files: Array<FileMessageModel>;
  filesEditId: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isForwarded: Scalars['Boolean']['output'];
  repliedToLinks: Array<ChatDraftMessageReplyModel>;
  text: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMemberModel = {
  __typename?: 'ChatMemberModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  pinnedMessageId?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<ChatRoleModel>>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMessageIdModel = {
  __typename?: 'ChatMessageIdModel';
  id: Scalars['String']['output'];
};

export type ChatMessageModel = {
  __typename?: 'ChatMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  draftOfChat?: Maybe<Array<ChatModel>>;
  draftOfChatId?: Maybe<Scalars['String']['output']>;
  files?: Maybe<Array<FileMessageModel>>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isDraft: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  isForwarded: Scalars['Boolean']['output'];
  isReply: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
  lastMessageForChat?: Maybe<ChatModel>;
  pinnedInChat?: Maybe<ChatModel>;
  readCount?: Maybe<Scalars['String']['output']>;
  repliedToLinks?: Maybe<Array<Maybe<ChatMessageReplyModel>>>;
  replies?: Maybe<Array<Maybe<ChatMessageReplyModel>>>;
  text?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMessageReplyModel = {
  __typename?: 'ChatMessageReplyModel';
  id: Scalars['ID']['output'];
  repliedTo?: Maybe<ChatMessageModel>;
  repliedToId: Scalars['String']['output'];
  reply?: Maybe<ChatMessageModel>;
  replyId: Scalars['String']['output'];
};

export type ChatModel = {
  __typename?: 'ChatModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chatName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  draftMessages?: Maybe<Array<ChatDraftMessageModel>>;
  group?: Maybe<GroupModel>;
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isGroup: Scalars['Boolean']['output'];
  isPinned?: Maybe<Scalars['Boolean']['output']>;
  isSecret: Scalars['Boolean']['output'];
  lastMessage?: Maybe<ChatMessageModel>;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  lastMessageId?: Maybe<Scalars['String']['output']>;
  members: Array<ChatMemberModel>;
  pinnedMessage?: Maybe<ChatMessageModel>;
  pinnedMessageId?: Maybe<Scalars['String']['output']>;
  pinnedOrder?: Maybe<Scalars['Int']['output']>;
  requireTotp: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum ChatPermissionEnum {
  ChangeChatAvatar = 'CHANGE_CHAT_AVATAR',
  ChangeChatInfo = 'CHANGE_CHAT_INFO',
  ChangeChatName = 'CHANGE_CHAT_NAME',
  ChangeRoleInfo = 'CHANGE_ROLE_INFO',
  CreateRoles = 'CREATE_ROLES',
  DeleteMessages = 'DELETE_MESSAGES',
  DeleteRoles = 'DELETE_ROLES',
  EditMessages = 'EDIT_MESSAGES',
  InviteMembers = 'INVITE_MEMBERS',
  ManageRoles = 'MANAGE_ROLES',
  PinMessages = 'PIN_MESSAGES',
  RemoveMembers = 'REMOVE_MEMBERS',
  SendMessages = 'SEND_MESSAGES'
}

export type ChatRoleModel = {
  __typename?: 'ChatRoleModel';
  chatId: Scalars['String']['output'];
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  permissions: Array<ChatPermissionEnum>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChatInput = {
  chatName: Scalars['String']['input'];
  isGroup: Scalars['Boolean']['input'];
  isSecret?: InputMaybe<Scalars['Boolean']['input']>;
  userIds: Array<Scalars['String']['input']>;
};

export type CreateGroupInput = {
  groupName: Scalars['String']['input'];
  userIds: Array<Scalars['String']['input']>;
};

export type CreateUserWEmailInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type DeviceModel = {
  __typename?: 'DeviceModel';
  browser: Scalars['String']['output'];
  os: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type FileDownloadData = {
  __typename?: 'FileDownloadData';
  fileUrl: Scalars['String']['output'];
  filename: Scalars['String']['output'];
};

export type FileMessageModel = {
  __typename?: 'FileMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  chatMessage?: Maybe<ChatMessageModel>;
  chatMessageId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  draftMessage?: Maybe<ChatDraftMessageModel>;
  draftMessageId: Scalars['String']['output'];
  fileFormat: Scalars['String']['output'];
  fileFullName: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['String']['output'];
  fileUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type FiltersInput = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Float']['input']>;
  take?: InputMaybe<Scalars['Float']['input']>;
};

export type FriendshipModel = {
  __typename?: 'FriendshipModel';
  createdAt: Scalars['DateTime']['output'];
  friend?: Maybe<UserModel>;
  friendId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: FriendshipStatusEnum;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<UserModel>;
  userId: Scalars['String']['output'];
};

export enum FriendshipStatusEnum {
  Accepted = 'ACCEPTED',
  Blocked = 'BLOCKED',
  Declined = 'DECLINED',
  Pending = 'PENDING'
}

export type GroupMemberModel = {
  __typename?: 'GroupMemberModel';
  createdAt: Scalars['DateTime']['output'];
  group: GroupModel;
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  roles?: Maybe<Array<GroupRoleModel>>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type GroupModel = {
  __typename?: 'GroupModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chats: Array<ChatModel>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  groupName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  members: Array<GroupMemberModel>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum GroupPermissionEnum {
  ChangeGroupAvatar = 'CHANGE_GROUP_AVATAR',
  ChangeGroupInfo = 'CHANGE_GROUP_INFO',
  ChangeGroupName = 'CHANGE_GROUP_NAME',
  ChangeRoleInfo = 'CHANGE_ROLE_INFO',
  CreateChats = 'CREATE_CHATS',
  CreateRoles = 'CREATE_ROLES',
  DeleteChats = 'DELETE_CHATS',
  DeleteGroup = 'DELETE_GROUP',
  DeleteRoles = 'DELETE_ROLES',
  InviteMembers = 'INVITE_MEMBERS',
  ManageRoles = 'MANAGE_ROLES',
  RemoveMembers = 'REMOVE_MEMBERS'
}

export type GroupRoleModel = {
  __typename?: 'GroupRoleModel';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  permissions: Array<GroupPermissionEnum>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LocationModel = {
  __typename?: 'LocationModel';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type LoginInput = {
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
  pin?: InputMaybe<Scalars['String']['input']>;
};

export type MemberChatRoleModel = {
  __typename?: 'MemberChatRoleModel';
  chatId: Scalars['String']['output'];
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isCreator: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: Array<ChatPermissionEnum>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberRoleModel = {
  __typename?: 'MemberRoleModel';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isCreator: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: Array<GroupPermissionEnum>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptFriendRequest: Scalars['Boolean']['output'];
  ackSecretMessages: Scalars['Boolean']['output'];
  ackSharedSecretKeys: Scalars['Boolean']['output'];
  assignGroupRoleToMember: Scalars['Boolean']['output'];
  assignRoleToUser: Scalars['Boolean']['output'];
  blockUser: Scalars['Boolean']['output'];
  cancelFriendRequest: Scalars['Boolean']['output'];
  changeChatAvatar: Scalars['String']['output'];
  changeChatInfo: Scalars['Boolean']['output'];
  changeGroupAvatar: Scalars['String']['output'];
  changeGroupInfo: Scalars['Boolean']['output'];
  changeProfileAvatar: Scalars['String']['output'];
  changeProfileInfo: Scalars['Boolean']['output'];
  clearSessionCookie: Scalars['Boolean']['output'];
  createChat: ChatModel;
  createGroup: GroupModel;
  createUserWEmail: Scalars['Boolean']['output'];
  declineFriendRequest: Scalars['Boolean']['output'];
  deleteChat: Scalars['Boolean']['output'];
  deleteChatRole: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteGroupRole: Scalars['Boolean']['output'];
  disableTotp: Scalars['Boolean']['output'];
  discardSecretAttachment: Scalars['Boolean']['output'];
  downloadFile: FileDownloadData;
  downloadSecretAttachment: SecretAttachmentDownloadModel;
  enableTotp: Scalars['Boolean']['output'];
  findOrCreateDirectChat: ChatModel;
  forwardChatMessage: Scalars['Boolean']['output'];
  generateTotpSecret: TotpSetupModel;
  inviteMemberToChat: Scalars['Boolean']['output'];
  inviteMemberToGroup: Scalars['Boolean']['output'];
  leaveChat: Scalars['Boolean']['output'];
  loginUser: AuthModel;
  logoutUser: Scalars['Boolean']['output'];
  pinChat: Scalars['Boolean']['output'];
  pinMessage: Scalars['Boolean']['output'];
  refreshToken: Scalars['String']['output'];
  removeChatAvatar: Scalars['Boolean']['output'];
  removeDraft: Scalars['Boolean']['output'];
  removeFile: Scalars['Boolean']['output'];
  removeFriend: Scalars['Boolean']['output'];
  removeGroupAvatar: Scalars['Boolean']['output'];
  removeGroupRoleFromMember: Scalars['Boolean']['output'];
  removeMemberFromChat: Scalars['Boolean']['output'];
  removeMemberFromGroup: Scalars['Boolean']['output'];
  removeMessages: Scalars['Boolean']['output'];
  removeProfileAvatar: Scalars['Boolean']['output'];
  removeRoleFromUser: Scalars['Boolean']['output'];
  sendChatDraftMessage: Scalars['Boolean']['output'];
  sendChatMessage: Scalars['Boolean']['output'];
  sendFile: AttachFileModel;
  sendFriendRequest: Scalars['Boolean']['output'];
  sendFriendRequestByUsername: Scalars['Boolean']['output'];
  sendPreKey: Scalars['Boolean']['output'];
  sendSecretMessage: QueueSecretMessageModel;
  sendSharedSecretKey: QueueSharedSecretKeyModel;
  startTyping: Scalars['Boolean']['output'];
  toggleChatRequireTotp: Scalars['Boolean']['output'];
  unPinChat: Scalars['Boolean']['output'];
  unPinMessage: Scalars['Boolean']['output'];
  unblockUser: Scalars['Boolean']['output'];
  updatePinnedChatsOrder: Scalars['Boolean']['output'];
  uploadSecretAttachment: SecretAttachmentModel;
  upsertChatRole: Scalars['Boolean']['output'];
  upsertGroupRole: Scalars['Boolean']['output'];
  verifyChatTotp: Scalars['Boolean']['output'];
};


export type MutationAcceptFriendRequestArgs = {
  friendshipId: Scalars['String']['input'];
};


export type MutationAckSecretMessagesArgs = {
  chatId: Scalars['String']['input'];
  messageIds: Array<Scalars['String']['input']>;
};


export type MutationAckSharedSecretKeysArgs = {
  chatId: Scalars['String']['input'];
  sharedKeyIds: Array<Scalars['String']['input']>;
};


export type MutationAssignGroupRoleToMemberArgs = {
  groupId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationAssignRoleToUserArgs = {
  chatId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationBlockUserArgs = {
  targetUserId: Scalars['String']['input'];
};


export type MutationCancelFriendRequestArgs = {
  friendshipId: Scalars['String']['input'];
};


export type MutationChangeChatAvatarArgs = {
  avatar: Scalars['Upload']['input'];
  chatId: Scalars['String']['input'];
};


export type MutationChangeChatInfoArgs = {
  chatId: Scalars['String']['input'];
  data: ChangeChatInfoInput;
};


export type MutationChangeGroupAvatarArgs = {
  avatar: Scalars['Upload']['input'];
  groupId: Scalars['String']['input'];
};


export type MutationChangeGroupInfoArgs = {
  data: ChangeGroupInfoInput;
  groupId: Scalars['String']['input'];
};


export type MutationChangeProfileAvatarArgs = {
  avatar: Scalars['Upload']['input'];
};


export type MutationChangeProfileInfoArgs = {
  data: ChangeProfileInfoInput;
};


export type MutationCreateChatArgs = {
  data: CreateChatInput;
  groupId: Scalars['String']['input'];
};


export type MutationCreateGroupArgs = {
  data: CreateGroupInput;
};


export type MutationCreateUserWEmailArgs = {
  data: CreateUserWEmailInput;
};


export type MutationDeclineFriendRequestArgs = {
  friendshipId: Scalars['String']['input'];
};


export type MutationDeleteChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationDeleteChatRoleArgs = {
  chatId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDeleteGroupRoleArgs = {
  groupId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationDisableTotpArgs = {
  token: Scalars['String']['input'];
};


export type MutationDiscardSecretAttachmentArgs = {
  attachmentId: Scalars['String']['input'];
  chatId: Scalars['String']['input'];
};


export type MutationDownloadFileArgs = {
  chatId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
};


export type MutationDownloadSecretAttachmentArgs = {
  attachmentId: Scalars['String']['input'];
  chatId: Scalars['String']['input'];
};


export type MutationEnableTotpArgs = {
  token: Scalars['String']['input'];
};


export type MutationFindOrCreateDirectChatArgs = {
  friendUserId: Scalars['String']['input'];
  isSecret?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationForwardChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationInviteMemberToChatArgs = {
  chatId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
};


export type MutationInviteMemberToGroupArgs = {
  groupId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
};


export type MutationLeaveChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationLoginUserArgs = {
  data: LoginInput;
};


export type MutationPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationPinMessageArgs = {
  chatId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
};


export type MutationRefreshTokenArgs = {
  data: Scalars['String']['input'];
};


export type MutationRemoveChatAvatarArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationRemoveDraftArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationRemoveFileArgs = {
  chatId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
};


export type MutationRemoveFriendArgs = {
  friendshipId: Scalars['String']['input'];
};


export type MutationRemoveGroupAvatarArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationRemoveGroupRoleFromMemberArgs = {
  groupId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationRemoveMemberFromChatArgs = {
  chatId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
};


export type MutationRemoveMemberFromGroupArgs = {
  groupId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
};


export type MutationRemoveMessagesArgs = {
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
};


export type MutationRemoveRoleFromUserArgs = {
  chatId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationSendChatDraftMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationSendChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationSendFileArgs = {
  chatId: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  messageId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendFriendRequestArgs = {
  friendId: Scalars['String']['input'];
};


export type MutationSendFriendRequestByUsernameArgs = {
  username: Scalars['String']['input'];
};


export type MutationSendPreKeyArgs = {
  data: PreKeyInput;
};


export type MutationSendSecretMessageArgs = {
  data: SendSecretMessageInput;
};


export type MutationSendSharedSecretKeyArgs = {
  data: SharedSecretKeyInput;
};


export type MutationStartTypingArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationToggleChatRequireTotpArgs = {
  chatId: Scalars['String']['input'];
  enable: Scalars['Boolean']['input'];
};


export type MutationUnPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationUnPinMessageArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationUnblockUserArgs = {
  friendshipId: Scalars['String']['input'];
};


export type MutationUpdatePinnedChatsOrderArgs = {
  chatIds: Array<Scalars['String']['input']>;
};


export type MutationUploadSecretAttachmentArgs = {
  data: UploadSecretAttachmentInput;
};


export type MutationUpsertChatRoleArgs = {
  chatId: Scalars['String']['input'];
  data: UpsertChatRoleInput;
};


export type MutationUpsertGroupRoleArgs = {
  data: UpsertGroupRoleInput;
  groupId: Scalars['String']['input'];
};


export type MutationVerifyChatTotpArgs = {
  chatId: Scalars['String']['input'];
  code: Scalars['String']['input'];
};

export type PreKeyInput = {
  ikPub: Scalars['String']['input'];
  opkPubs: Array<Scalars['String']['input']>;
  spkPub: Scalars['String']['input'];
  spkSig: Scalars['String']['input'];
};

export type PreKeyModel = {
  __typename?: 'PreKeyModel';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ikPub: Scalars['String']['output'];
  indexOpkPub: Scalars['Float']['output'];
  opkPubs: Array<Scalars['String']['output']>;
  spkPub: Scalars['String']['output'];
  spkSig: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  checkChatAccess: Scalars['Boolean']['output'];
  checkGroupAccess: Scalars['Boolean']['output'];
  findAllChatsByGroup: Array<ChatModel>;
  findAllChatsByUser: Array<ChatModel>;
  findAllGroupsByUser: Array<GroupModel>;
  findAllMessagesByChat: Array<ChatMessageModel>;
  findAllUsers: Array<UserModel>;
  findChatByChatId: ChatModel;
  findCurrentSession: SessionModel;
  findGroupByGroupId: GroupModel;
  findProfile: UserModel;
  findSessionsByUser: Array<SessionModel>;
  getBlockedUsers: Array<FriendshipModel>;
  getChatRoles: Array<ChatRoleModel>;
  getFriends: Array<FriendshipModel>;
  getGroupRoles: Array<GroupRoleModel>;
  getIncomingFriendRequests: Array<FriendshipModel>;
  getMemberChatRole: MemberChatRoleModel;
  getMemberRole: MemberRoleModel;
  getOutgoingFriendRequests: Array<FriendshipModel>;
  getPreKeys: Array<PreKeyModel>;
  getSecretMessage: QueueSecretMessageModel;
  getSecretMessages: Array<QueueSecretMessageModel>;
  getSharedSecretKey: Array<QueueSharedSecretKeyModel>;
  hasSharedSecretKey: Scalars['Boolean']['output'];
};


export type QueryCheckChatAccessArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryCheckGroupAccessArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryFindAllChatsByGroupArgs = {
  filters: FiltersInput;
  groupId: Scalars['String']['input'];
};


export type QueryFindAllChatsByUserArgs = {
  filters: FiltersInput;
};


export type QueryFindAllGroupsByUserArgs = {
  filters: FiltersInput;
};


export type QueryFindAllMessagesByChatArgs = {
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
};


export type QueryFindAllUsersArgs = {
  filters?: InputMaybe<FiltersInput>;
};


export type QueryFindChatByChatIdArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryFindGroupByGroupIdArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetChatRolesArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetGroupRolesArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetMemberChatRoleArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetMemberRoleArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetPreKeysArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetSecretMessageArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetSecretMessagesArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetSharedSecretKeyArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryHasSharedSecretKeyArgs = {
  chatId: Scalars['String']['input'];
};

export type QueueSecretMessageModel = {
  __typename?: 'QueueSecretMessageModel';
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  ekPub?: Maybe<Scalars['String']['output']>;
  encryptedMessage: Scalars['String']['output'];
  fromUserId: Scalars['String']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ikPub?: Maybe<Scalars['String']['output']>;
  isKey: Scalars['Boolean']['output'];
  iv: Scalars['String']['output'];
  secretAttachmentIds: Array<Scalars['String']['output']>;
  sig: Scalars['String']['output'];
  toUserIds: Array<Scalars['String']['output']>;
  ukm?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usedOpk?: Maybe<Scalars['String']['output']>;
  whoCheckedIds: Array<Scalars['String']['output']>;
};

export type QueueSharedSecretKeyModel = {
  __typename?: 'QueueSharedSecretKeyModel';
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  ekPub: Scalars['String']['output'];
  encryptedKey: Scalars['String']['output'];
  fromUserId: Scalars['String']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ikPub: Scalars['String']['output'];
  iv: Scalars['String']['output'];
  sig: Scalars['String']['output'];
  toUserId: Scalars['String']['output'];
  ukm: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usedOpk?: Maybe<Scalars['String']['output']>;
};

export type RemoveMessagesInput = {
  messageIds: Array<Scalars['String']['input']>;
};

export type SecretAttachmentDownloadModel = {
  __typename?: 'SecretAttachmentDownloadModel';
  attachmentId: Scalars['String']['output'];
  chatId: Scalars['String']['output'];
  ciphertextBase64: Scalars['String']['output'];
  ciphertextSize: Scalars['String']['output'];
};

export type SecretAttachmentModel = {
  __typename?: 'SecretAttachmentModel';
  chatId: Scalars['String']['output'];
  ciphertextSize: Scalars['String']['output'];
  committedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SecretKeyRotationModel = {
  __typename?: 'SecretKeyRotationModel';
  chatId: Scalars['String']['output'];
};

export type SendChatMessageInput = {
  editId?: InputMaybe<Scalars['String']['input']>;
  fileIds?: InputMaybe<Array<Scalars['String']['input']>>;
  forwardedMessageIds?: InputMaybe<Array<Scalars['String']['input']>>;
  targetChatsId?: InputMaybe<Array<Scalars['String']['input']>>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type SendSecretMessageInput = {
  chatId: Scalars['String']['input'];
  encryptedMessage: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
  isKey?: InputMaybe<Scalars['Boolean']['input']>;
  iv: Scalars['String']['input'];
  secretAttachmentIds?: InputMaybe<Array<Scalars['String']['input']>>;
  sig: Scalars['String']['input'];
  toUserIds: Array<Scalars['String']['input']>;
  ukm?: InputMaybe<Scalars['String']['input']>;
};

export type SessionMetadataModel = {
  __typename?: 'SessionMetadataModel';
  device: DeviceModel;
  ip: Scalars['String']['output'];
  location: LocationModel;
};

export type SessionModel = {
  __typename?: 'SessionModel';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metadata: SessionMetadataModel;
  userId: Scalars['String']['output'];
};

export type SharedSecretKeyInput = {
  chatId: Scalars['String']['input'];
  ekPub: Scalars['String']['input'];
  encryptedKey: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
  ikPub: Scalars['String']['input'];
  iv: Scalars['String']['input'];
  sig: Scalars['String']['input'];
  toUserId: Scalars['String']['input'];
  ukm: Scalars['String']['input'];
  usedOpk?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  addSecretMessage: QueueSecretMessageModel;
  addSharedSecretKey?: Maybe<QueueSharedSecretKeyModel>;
  chatAdded: ChatModel;
  chatAssignedRole: ChatRoleModel;
  chatDeleted: ChatModel;
  chatDeletedRole: ChatRoleModel;
  chatMessageAdded: ChatMessageModel;
  chatMessageRemoved: Array<ChatMessageIdModel>;
  chatRemovedRole: ChatRoleModel;
  chatUpdated: ChatModel;
  chatUpsertedRole: ChatRoleModel;
  friendRemoved: FriendshipModel;
  friendRequestAccepted: FriendshipModel;
  friendRequestCancelled: FriendshipModel;
  friendRequestDeclined: FriendshipModel;
  friendRequestSent: FriendshipModel;
  groupAdded: GroupModel;
  groupAssignedRole: GroupRoleModel;
  groupDeleted: GroupModel;
  groupDeletedRole: GroupRoleModel;
  groupRemovedRole: GroupRoleModel;
  groupUpsertedRole: GroupRoleModel;
  secretKeyRotation: SecretKeyRotationModel;
  typingStarted: TypingIndicatorModel;
};


export type SubscriptionAddSecretMessageArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionAddSharedSecretKeyArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionChatAddedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatAssignedRoleArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionChatDeletedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatDeletedRoleArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionChatMessageAddedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageRemovedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatRemovedRoleArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionChatUpdatedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionChatUpsertedRoleArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionFriendRemovedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionFriendRequestAcceptedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionFriendRequestCancelledArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionFriendRequestDeclinedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionFriendRequestSentArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupAddedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupAssignedRoleArgs = {
  groupId: Scalars['String']['input'];
};


export type SubscriptionGroupDeletedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupDeletedRoleArgs = {
  groupId: Scalars['String']['input'];
};


export type SubscriptionGroupRemovedRoleArgs = {
  groupId: Scalars['String']['input'];
};


export type SubscriptionGroupUpsertedRoleArgs = {
  groupId: Scalars['String']['input'];
};


export type SubscriptionSecretKeyRotationArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionTypingStartedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type TotpSetupModel = {
  __typename?: 'TotpSetupModel';
  qrCodeUrl: Scalars['String']['output'];
  totpSecret: Scalars['String']['output'];
};

export type TypingIndicatorModel = {
  __typename?: 'TypingIndicatorModel';
  chatId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UploadSecretAttachmentInput = {
  chatId: Scalars['String']['input'];
  ciphertextBase64: Scalars['String']['input'];
};

export type UpsertChatRoleInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
  permissions: Array<ChatPermissionEnum>;
};

export type UpsertGroupRoleInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
  permissions: Array<GroupPermissionEnum>;
};

export type UserModel = {
  __typename?: 'UserModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeactivated: Scalars['Boolean']['output'];
  isTotpEnabled: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type ChatDraftMessageReplyModel = {
  __typename?: 'chatDraftMessageReplyModel';
  createdAt: Scalars['DateTime']['output'];
  draftMessage: ChatDraftMessageModel;
  draftMessageId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  repliedTo: ChatMessageModel;
  repliedToId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateUserWEmailMutationVariables = Exact<{
  data: CreateUserWEmailInput;
}>;


export type CreateUserWEmailMutation = { __typename?: 'Mutation', createUserWEmail: boolean };

export type DisableTotpMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type DisableTotpMutation = { __typename?: 'Mutation', disableTotp: boolean };

export type EnableTotpMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type EnableTotpMutation = { __typename?: 'Mutation', enableTotp: boolean };

export type GenerateTotpSecretMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateTotpSecretMutation = { __typename?: 'Mutation', generateTotpSecret: { __typename?: 'TotpSetupModel', totpSecret: string, qrCodeUrl: string } };

export type LoginUserMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'AuthModel', message?: string | null, accessToken?: string | null, refreshToken?: string | null, sessionId?: string | null, user?: { __typename?: 'UserModel', id: string } | null } };

export type LogoutUserMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutUserMutation = { __typename?: 'Mutation', logoutUser: boolean };

export type ToggleChatRequireTotpMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  enable: Scalars['Boolean']['input'];
}>;


export type ToggleChatRequireTotpMutation = { __typename?: 'Mutation', toggleChatRequireTotp: boolean };

export type VerifyChatTotpMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  code: Scalars['String']['input'];
}>;


export type VerifyChatTotpMutation = { __typename?: 'Mutation', verifyChatTotp: boolean };

export type AssignRoleToUserMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
}>;


export type AssignRoleToUserMutation = { __typename?: 'Mutation', assignRoleToUser: boolean };

export type ChangeChatAvatarMutationVariables = Exact<{
  avatar: Scalars['Upload']['input'];
  chatId: Scalars['String']['input'];
}>;


export type ChangeChatAvatarMutation = { __typename?: 'Mutation', changeChatAvatar: string };

export type ChangeChatInfoMutationVariables = Exact<{
  data: ChangeChatInfoInput;
  chatId: Scalars['String']['input'];
}>;


export type ChangeChatInfoMutation = { __typename?: 'Mutation', changeChatInfo: boolean };

export type CreateChatMutationVariables = Exact<{
  data: CreateChatInput;
  groupId: Scalars['String']['input'];
}>;


export type CreateChatMutation = { __typename?: 'Mutation', createChat: { __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, id: string, updatedAt: any, isSecret: boolean } };

export type DeleteChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type DeleteChatMutation = { __typename?: 'Mutation', deleteChat: boolean };

export type DeleteChatRoleMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
}>;


export type DeleteChatRoleMutation = { __typename?: 'Mutation', deleteChatRole: boolean };

export type DownloadFileMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
  chatId: Scalars['String']['input'];
}>;


export type DownloadFileMutation = { __typename?: 'Mutation', downloadFile: { __typename?: 'FileDownloadData', filename: string, fileUrl: string } };

export type FindOrCreateDirectChatMutationVariables = Exact<{
  friendUserId: Scalars['String']['input'];
  isSecret?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type FindOrCreateDirectChatMutation = { __typename?: 'Mutation', findOrCreateDirectChat: { __typename?: 'ChatModel', id: string, chatName?: string | null, isSecret: boolean, isGroup: boolean, groupId?: string | null } };

export type ForwardChatMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
}>;


export type ForwardChatMessageMutation = { __typename?: 'Mutation', forwardChatMessage: boolean };

export type InviteMemberToChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
}>;


export type InviteMemberToChatMutation = { __typename?: 'Mutation', inviteMemberToChat: boolean };

export type LeaveChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type LeaveChatMutation = { __typename?: 'Mutation', leaveChat: boolean };

export type PinChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type PinChatMutation = { __typename?: 'Mutation', pinChat: boolean };

export type PinMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
}>;


export type PinMessageMutation = { __typename?: 'Mutation', pinMessage: boolean };

export type RemoveChatAvatarMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type RemoveChatAvatarMutation = { __typename?: 'Mutation', removeChatAvatar: boolean };

export type RemoveDraftMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type RemoveDraftMutation = { __typename?: 'Mutation', removeDraft: boolean };

export type RemoveFileMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
  chatId: Scalars['String']['input'];
}>;


export type RemoveFileMutation = { __typename?: 'Mutation', removeFile: boolean };

export type RemoveMemberFromChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
}>;


export type RemoveMemberFromChatMutation = { __typename?: 'Mutation', removeMemberFromChat: boolean };

export type RemoveMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
}>;


export type RemoveMessagesMutation = { __typename?: 'Mutation', removeMessages: boolean };

export type RemoveRoleFromUserMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
}>;


export type RemoveRoleFromUserMutation = { __typename?: 'Mutation', removeRoleFromUser: boolean };

export type SendChatDraftMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
}>;


export type SendChatDraftMessageMutation = { __typename?: 'Mutation', sendChatDraftMessage: boolean };

export type SendChatMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
}>;


export type SendChatMessageMutation = { __typename?: 'Mutation', sendChatMessage: boolean };

export type SendFileMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  messageId: Scalars['String']['input'];
}>;


export type SendFileMutation = { __typename?: 'Mutation', sendFile: { __typename?: 'AttachFileModel', chatDraftMessageId: string, fileId: string } };

export type StartTypingMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type StartTypingMutation = { __typename?: 'Mutation', startTyping: boolean };

export type UnPinChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type UnPinChatMutation = { __typename?: 'Mutation', unPinChat: boolean };

export type UnPinMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type UnPinMessageMutation = { __typename?: 'Mutation', unPinMessage: boolean };

export type UpdatePinnedChatsOrderMutationVariables = Exact<{
  chatIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UpdatePinnedChatsOrderMutation = { __typename?: 'Mutation', updatePinnedChatsOrder: boolean };

export type UpsertChatRoleMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: UpsertChatRoleInput;
}>;


export type UpsertChatRoleMutation = { __typename?: 'Mutation', upsertChatRole: boolean };

export type AcceptFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['String']['input'];
}>;


export type AcceptFriendRequestMutation = { __typename?: 'Mutation', acceptFriendRequest: boolean };

export type BlockUserMutationVariables = Exact<{
  targetUserId: Scalars['String']['input'];
}>;


export type BlockUserMutation = { __typename?: 'Mutation', blockUser: boolean };

export type CancelFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['String']['input'];
}>;


export type CancelFriendRequestMutation = { __typename?: 'Mutation', cancelFriendRequest: boolean };

export type DeclineFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['String']['input'];
}>;


export type DeclineFriendRequestMutation = { __typename?: 'Mutation', declineFriendRequest: boolean };

export type RemoveFriendMutationVariables = Exact<{
  friendshipId: Scalars['String']['input'];
}>;


export type RemoveFriendMutation = { __typename?: 'Mutation', removeFriend: boolean };

export type SendFriendRequestByUsernameMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type SendFriendRequestByUsernameMutation = { __typename?: 'Mutation', sendFriendRequestByUsername: boolean };

export type UnblockUserMutationVariables = Exact<{
  friendshipId: Scalars['String']['input'];
}>;


export type UnblockUserMutation = { __typename?: 'Mutation', unblockUser: boolean };

export type AssignGroupRoleToMemberMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
}>;


export type AssignGroupRoleToMemberMutation = { __typename?: 'Mutation', assignGroupRoleToMember: boolean };

export type ChangeGroupAvatarMutationVariables = Exact<{
  avatar: Scalars['Upload']['input'];
  groupId: Scalars['String']['input'];
}>;


export type ChangeGroupAvatarMutation = { __typename?: 'Mutation', changeGroupAvatar: string };

export type ChangeGroupInfoMutationVariables = Exact<{
  data: ChangeGroupInfoInput;
  groupId: Scalars['String']['input'];
}>;


export type ChangeGroupInfoMutation = { __typename?: 'Mutation', changeGroupInfo: boolean };

export type CreateGroupMutationVariables = Exact<{
  data: CreateGroupInput;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup: { __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null } };

export type DeleteGroupMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', deleteGroup: boolean };

export type DeleteGroupRoleMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
}>;


export type DeleteGroupRoleMutation = { __typename?: 'Mutation', deleteGroupRole: boolean };

export type InviteMemberToGroupMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
}>;


export type InviteMemberToGroupMutation = { __typename?: 'Mutation', inviteMemberToGroup: boolean };

export type RemoveGroupAvatarMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type RemoveGroupAvatarMutation = { __typename?: 'Mutation', removeGroupAvatar: boolean };

export type RemoveGroupRoleFromMemberMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
}>;


export type RemoveGroupRoleFromMemberMutation = { __typename?: 'Mutation', removeGroupRoleFromMember: boolean };

export type RemoveMemberFromGroupMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  targetUserId: Scalars['String']['input'];
}>;


export type RemoveMemberFromGroupMutation = { __typename?: 'Mutation', removeMemberFromGroup: boolean };

export type UpsertGroupRoleMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
  data: UpsertGroupRoleInput;
}>;


export type UpsertGroupRoleMutation = { __typename?: 'Mutation', upsertGroupRole: boolean };

export type AckSecretMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  messageIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AckSecretMessagesMutation = { __typename?: 'Mutation', ackSecretMessages: boolean };

export type AckSharedSecretKeysMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  sharedKeyIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AckSharedSecretKeysMutation = { __typename?: 'Mutation', ackSharedSecretKeys: boolean };

export type DiscardSecretAttachmentMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
}>;


export type DiscardSecretAttachmentMutation = { __typename?: 'Mutation', discardSecretAttachment: boolean };

export type DownloadSecretAttachmentMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
}>;


export type DownloadSecretAttachmentMutation = { __typename?: 'Mutation', downloadSecretAttachment: { __typename?: 'SecretAttachmentDownloadModel', attachmentId: string, chatId: string, ciphertextBase64: string, ciphertextSize: string } };

export type SendPreKeyMutationVariables = Exact<{
  data: PreKeyInput;
}>;


export type SendPreKeyMutation = { __typename?: 'Mutation', sendPreKey: boolean };

export type SendSecretMessageMutationVariables = Exact<{
  data: SendSecretMessageInput;
}>;


export type SendSecretMessageMutation = { __typename?: 'Mutation', sendSecretMessage: { __typename?: 'QueueSecretMessageModel', id: string } };

export type SendSharedSecretKeyMutationVariables = Exact<{
  data: SharedSecretKeyInput;
}>;


export type SendSharedSecretKeyMutation = { __typename?: 'Mutation', sendSharedSecretKey: { __typename?: 'QueueSharedSecretKeyModel', id: string } };

export type UploadSecretAttachmentMutationVariables = Exact<{
  data: UploadSecretAttachmentInput;
}>;


export type UploadSecretAttachmentMutation = { __typename?: 'Mutation', uploadSecretAttachment: { __typename?: 'SecretAttachmentModel', id: string, chatId: string, ciphertextSize: string, committedAt?: any | null, expiresAt?: any | null, createdAt: any, updatedAt: any } };

export type ChangeProfileAvatarMutationVariables = Exact<{
  avatar: Scalars['Upload']['input'];
}>;


export type ChangeProfileAvatarMutation = { __typename?: 'Mutation', changeProfileAvatar: string };

export type ChangeProfileInfoMutationVariables = Exact<{
  data: ChangeProfileInfoInput;
}>;


export type ChangeProfileInfoMutation = { __typename?: 'Mutation', changeProfileInfo: boolean };

export type RemoveProfileAvatarMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveProfileAvatarMutation = { __typename?: 'Mutation', removeProfileAvatar: boolean };

export type CheckChatAccessQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type CheckChatAccessQuery = { __typename?: 'Query', checkChatAccess: boolean };

export type FindAllChatsByGroupQueryVariables = Exact<{
  filters: FiltersInput;
  groupId: Scalars['String']['input'];
}>;


export type FindAllChatsByGroupQuery = { __typename?: 'Query', findAllChatsByGroup: Array<{ __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, updatedAt: any, isSecret: boolean, requireTotp: boolean, id: string, isGroup: boolean, groupId?: string | null, isPinned?: boolean | null, pinnedOrder?: number | null, lastMessageAt?: any | null, members: Array<{ __typename?: 'ChatMemberModel', id: string, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } }>, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null }> };

export type FindAllChatsByUserQueryVariables = Exact<{
  filters: FiltersInput;
}>;


export type FindAllChatsByUserQuery = { __typename?: 'Query', findAllChatsByUser: Array<{ __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, updatedAt: any, isSecret: boolean, id: string, isGroup: boolean, groupId?: string | null, isPinned?: boolean | null, pinnedOrder?: number | null, lastMessageAt?: any | null, members: Array<{ __typename?: 'ChatMemberModel', id: string, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } }>, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null }> };

export type FindAllMessagesByChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
}>;


export type FindAllMessagesByChatQuery = { __typename?: 'Query', findAllMessagesByChat: Array<{ __typename?: 'ChatMessageModel', id: string, isEdited: boolean, isStarted: boolean, text?: string | null, createdAt: any, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } | null } | null> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', avatarUrl?: string | null, id: string, username: string } }> };

export type FindChatByChatIdQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type FindChatByChatIdQuery = { __typename?: 'Query', findChatByChatId: { __typename?: 'ChatModel', id: string, chatName?: string | null, avatarUrl?: string | null, updatedAt: any, isSecret: boolean, requireTotp: boolean, isGroup: boolean, groupId?: string | null, description?: string | null, pinnedMessage?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, createdAt: any, isEdited: boolean, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', id: string, username: string }, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', username: string, id: string } } | null } | null> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', editId?: string | null, id: string, text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }>, repliedToLinks: Array<{ __typename?: 'chatDraftMessageReplyModel', id: string, repliedTo: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', username: string, id: string } } }> }> | null, members: Array<{ __typename?: 'ChatMemberModel', id: string, isCreator?: boolean | null, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null }, roles?: Array<{ __typename?: 'ChatRoleModel', id: string, name: string, color: string, permissions: Array<ChatPermissionEnum> }> | null }> } };

export type GetChatRolesQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetChatRolesQuery = { __typename?: 'Query', getChatRoles: Array<{ __typename?: 'ChatRoleModel', id: string, name: string, color: string, chatId: string, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any }> };

export type GetMemberChatRoleQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetMemberChatRoleQuery = { __typename?: 'Query', getMemberChatRole: { __typename?: 'MemberChatRoleModel', id: string, name: string, color: string, chatId: string, isCreator: boolean, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any } };

export type GetBlockedUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlockedUsersQuery = { __typename?: 'Query', getBlockedUsers: Array<{ __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null }> };

export type GetFriendsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFriendsQuery = { __typename?: 'Query', getFriends: Array<{ __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null, bio?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null, bio?: string | null } | null }> };

export type GetIncomingFriendRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIncomingFriendRequestsQuery = { __typename?: 'Query', getIncomingFriendRequests: Array<{ __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null }> };

export type GetOutgoingFriendRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOutgoingFriendRequestsQuery = { __typename?: 'Query', getOutgoingFriendRequests: Array<{ __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null }> };

export type FindAllGroupsByUserQueryVariables = Exact<{
  filters: FiltersInput;
}>;


export type FindAllGroupsByUserQuery = { __typename?: 'Query', findAllGroupsByUser: Array<{ __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null }> };

export type FindGroupByGroupIdQueryVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type FindGroupByGroupIdQuery = { __typename?: 'Query', findGroupByGroupId: { __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null, description?: string | null, members: Array<{ __typename?: 'GroupMemberModel', isCreator?: boolean | null, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null }, roles?: Array<{ __typename?: 'GroupRoleModel', id: string, name: string, color: string, permissions: Array<GroupPermissionEnum> }> | null }> } };

export type GetGroupRolesQueryVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GetGroupRolesQuery = { __typename?: 'Query', getGroupRoles: Array<{ __typename?: 'GroupRoleModel', id: string, name: string, color: string, groupId: string, permissions: Array<GroupPermissionEnum>, createdAt: any, updatedAt: any }> };

export type GetMemberRoleQueryVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GetMemberRoleQuery = { __typename?: 'Query', getMemberRole: { __typename?: 'MemberRoleModel', id: string, name: string, permissions: Array<GroupPermissionEnum>, isCreator: boolean } };

export type GetPreKeysQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetPreKeysQuery = { __typename?: 'Query', getPreKeys: Array<{ __typename?: 'PreKeyModel', ikPub: string, spkPub: string, spkSig: string, opkPubs: Array<string>, indexOpkPub: number, userId: string }> };

export type GetSecretMessageQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetSecretMessageQuery = { __typename?: 'Query', getSecretMessage: { __typename?: 'QueueSecretMessageModel', id: string, chatId: string, fromUserId: string, ikPub?: string | null, usedOpk?: string | null, ukm?: string | null, ekPub?: string | null, iv: string, encryptedMessage: string, sig: string } };

export type GetSecretMessagesQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetSecretMessagesQuery = { __typename?: 'Query', getSecretMessages: Array<{ __typename?: 'QueueSecretMessageModel', id: string, groupId: string, isKey: boolean, chatId: string, fromUserId: string, toUserIds: Array<string>, whoCheckedIds: Array<string>, ukm?: string | null, iv: string, encryptedMessage: string, sig: string, secretAttachmentIds: Array<string>, ikPub?: string | null, ekPub?: string | null, usedOpk?: string | null, createdAt: any, updatedAt: any }> };

export type GetSharedSecretKeyQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type GetSharedSecretKeyQuery = { __typename?: 'Query', getSharedSecretKey: Array<{ __typename?: 'QueueSharedSecretKeyModel', id: string, groupId: string, createdAt: any, updatedAt: any, ikPub: string, chatId: string, fromUserId: string, toUserId: string, ekPub: string, usedOpk?: string | null, ukm: string, iv: string, encryptedKey: string, sig: string }> };

export type HasSharedSecretKeyQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type HasSharedSecretKeyQuery = { __typename?: 'Query', hasSharedSecretKey: boolean };

export type FindAllUsersQueryVariables = Exact<{
  filters?: InputMaybe<FiltersInput>;
}>;


export type FindAllUsersQuery = { __typename?: 'Query', findAllUsers: Array<{ __typename?: 'UserModel', username: string, avatarUrl?: string | null, bio?: string | null, id: string }> };

export type FindProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type FindProfileQuery = { __typename?: 'Query', findProfile: { __typename?: 'UserModel', id: string, avatarUrl?: string | null, username: string, bio?: string | null, isTotpEnabled: boolean } };

export type FindCurrentSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type FindCurrentSessionQuery = { __typename?: 'Query', findCurrentSession: { __typename?: 'SessionModel', id: string, userId: string, createdAt: string, metadata: { __typename?: 'SessionMetadataModel', ip: string, device: { __typename?: 'DeviceModel', browser: string, os: string, type: string }, location: { __typename?: 'LocationModel', city: string, country: string, latitude: number, longitude: number } } } };

export type FindSessionsByUserQueryVariables = Exact<{ [key: string]: never; }>;


export type FindSessionsByUserQuery = { __typename?: 'Query', findSessionsByUser: Array<{ __typename?: 'SessionModel', id: string, userId: string, createdAt: string, metadata: { __typename?: 'SessionMetadataModel', ip: string, device: { __typename?: 'DeviceModel', browser: string, os: string, type: string }, location: { __typename?: 'LocationModel', city: string, country: string, latitude: number, longitude: number } } }> };

export type ChatAddedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
}>;


export type ChatAddedSubscription = { __typename?: 'Subscription', chatAdded: { __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, updatedAt: any, isSecret: boolean, requireTotp: boolean, id: string, isGroup: boolean, groupId?: string | null, lastMessageAt?: any | null, members: Array<{ __typename?: 'ChatMemberModel', id: string, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } }>, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null } };

export type ChatAssignedRoleSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatAssignedRoleSubscription = { __typename?: 'Subscription', chatAssignedRole: { __typename?: 'ChatRoleModel', id: string, name: string, color: string, chatId: string, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any } };

export type ChatDeletedSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatDeletedSubscription = { __typename?: 'Subscription', chatDeleted: { __typename?: 'ChatModel', id: string, isSecret: boolean } };

export type ChatDeletedRoleSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatDeletedRoleSubscription = { __typename?: 'Subscription', chatDeletedRole: { __typename?: 'ChatRoleModel', id: string, name: string, color: string, chatId: string, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any } };

export type ChatMessageAddedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatMessageAddedSubscription = { __typename?: 'Subscription', chatMessageAdded: { __typename?: 'ChatMessageModel', id: string, text?: string | null, isEdited: boolean, isStarted: boolean, createdAt: any, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } | null } | null> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } };

export type ChatMessageRemovedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatMessageRemovedSubscription = { __typename?: 'Subscription', chatMessageRemoved: Array<{ __typename?: 'ChatMessageIdModel', id: string }> };

export type ChatRemovedRoleSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatRemovedRoleSubscription = { __typename?: 'Subscription', chatRemovedRole: { __typename?: 'ChatRoleModel', id: string, name: string, color: string, chatId: string, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any } };

export type ChatUpdatedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type ChatUpdatedSubscription = { __typename?: 'Subscription', chatUpdated: { __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, updatedAt: any, pinnedMessageId?: string | null, isSecret: boolean, requireTotp: boolean, id: string, isGroup: boolean, groupId?: string | null, lastMessageAt?: any | null, members: Array<{ __typename?: 'ChatMemberModel', id: string, user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } }>, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null } };

export type ChatUpsertedRoleSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatUpsertedRoleSubscription = { __typename?: 'Subscription', chatUpsertedRole: { __typename?: 'ChatRoleModel', id: string, name: string, color: string, chatId: string, permissions: Array<ChatPermissionEnum>, createdAt: any, updatedAt: any } };

export type TypingStartedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type TypingStartedSubscription = { __typename?: 'Subscription', typingStarted: { __typename?: 'TypingIndicatorModel', userId: string, username: string, chatId: string } };

export type FriendRemovedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type FriendRemovedSubscription = { __typename?: 'Subscription', friendRemoved: { __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, updatedAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null } };

export type FriendRequestAcceptedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type FriendRequestAcceptedSubscription = { __typename?: 'Subscription', friendRequestAccepted: { __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, updatedAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null } };

export type FriendRequestCancelledSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type FriendRequestCancelledSubscription = { __typename?: 'Subscription', friendRequestCancelled: { __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, updatedAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null } };

export type FriendRequestDeclinedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type FriendRequestDeclinedSubscription = { __typename?: 'Subscription', friendRequestDeclined: { __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, updatedAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null } };

export type FriendRequestSentSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type FriendRequestSentSubscription = { __typename?: 'Subscription', friendRequestSent: { __typename?: 'FriendshipModel', id: string, userId: string, friendId: string, status: FriendshipStatusEnum, createdAt: any, updatedAt: any, user?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null, friend?: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } | null } };

export type GroupAddedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GroupAddedSubscription = { __typename?: 'Subscription', groupAdded: { __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null } };

export type GroupAssignedRoleSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GroupAssignedRoleSubscription = { __typename?: 'Subscription', groupAssignedRole: { __typename?: 'GroupRoleModel', id: string, name: string, color: string, groupId: string, permissions: Array<GroupPermissionEnum>, createdAt: any, updatedAt: any } };

export type GroupDeletedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GroupDeletedSubscription = { __typename?: 'Subscription', groupDeleted: { __typename?: 'GroupModel', id: string } };

export type GroupDeletedRoleSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GroupDeletedRoleSubscription = { __typename?: 'Subscription', groupDeletedRole: { __typename?: 'GroupRoleModel', id: string, name: string, color: string, groupId: string, permissions: Array<GroupPermissionEnum>, createdAt: any, updatedAt: any } };

export type GroupRemovedRoleSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GroupRemovedRoleSubscription = { __typename?: 'Subscription', groupRemovedRole: { __typename?: 'GroupRoleModel', id: string, name: string, color: string, groupId: string, permissions: Array<GroupPermissionEnum>, createdAt: any, updatedAt: any } };

export type GroupUpsertedRoleSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type GroupUpsertedRoleSubscription = { __typename?: 'Subscription', groupUpsertedRole: { __typename?: 'GroupRoleModel', id: string, name: string, color: string, groupId: string, permissions: Array<GroupPermissionEnum>, createdAt: any, updatedAt: any } };

export type AddSecretMessageSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type AddSecretMessageSubscription = { __typename?: 'Subscription', addSecretMessage: { __typename?: 'QueueSecretMessageModel', id: string, chatId: string, fromUserId: string, ukm?: string | null, iv: string, encryptedMessage: string, sig: string } };

export type AddSharedSecretKeySubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type AddSharedSecretKeySubscription = { __typename?: 'Subscription', addSharedSecretKey?: { __typename?: 'QueueSharedSecretKeyModel', chatId: string, fromUserId: string, toUserId: string, ekPub: string, usedOpk?: string | null, ukm: string, iv: string, encryptedKey: string, sig: string } | null };

export type SecretKeyRotationSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type SecretKeyRotationSubscription = { __typename?: 'Subscription', secretKeyRotation: { __typename?: 'SecretKeyRotationModel', chatId: string } };


export const CreateUserWEmailDocument = gql`
    mutation CreateUserWEmail($data: CreateUserWEmailInput!) {
  createUserWEmail(data: $data)
}
    `;
export type CreateUserWEmailMutationFn = Apollo.MutationFunction<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>;

/**
 * __useCreateUserWEmailMutation__
 *
 * To run a mutation, you first call `useCreateUserWEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserWEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserWEmailMutation, { data, loading, error }] = useCreateUserWEmailMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateUserWEmailMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>(CreateUserWEmailDocument, options);
      }
export type CreateUserWEmailMutationHookResult = ReturnType<typeof useCreateUserWEmailMutation>;
export type CreateUserWEmailMutationResult = Apollo.MutationResult<CreateUserWEmailMutation>;
export type CreateUserWEmailMutationOptions = Apollo.BaseMutationOptions<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>;
export const DisableTotpDocument = gql`
    mutation DisableTotp($token: String!) {
  disableTotp(token: $token)
}
    `;
export type DisableTotpMutationFn = Apollo.MutationFunction<DisableTotpMutation, DisableTotpMutationVariables>;

/**
 * __useDisableTotpMutation__
 *
 * To run a mutation, you first call `useDisableTotpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDisableTotpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [disableTotpMutation, { data, loading, error }] = useDisableTotpMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useDisableTotpMutation(baseOptions?: Apollo.MutationHookOptions<DisableTotpMutation, DisableTotpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DisableTotpMutation, DisableTotpMutationVariables>(DisableTotpDocument, options);
      }
export type DisableTotpMutationHookResult = ReturnType<typeof useDisableTotpMutation>;
export type DisableTotpMutationResult = Apollo.MutationResult<DisableTotpMutation>;
export type DisableTotpMutationOptions = Apollo.BaseMutationOptions<DisableTotpMutation, DisableTotpMutationVariables>;
export const EnableTotpDocument = gql`
    mutation EnableTotp($token: String!) {
  enableTotp(token: $token)
}
    `;
export type EnableTotpMutationFn = Apollo.MutationFunction<EnableTotpMutation, EnableTotpMutationVariables>;

/**
 * __useEnableTotpMutation__
 *
 * To run a mutation, you first call `useEnableTotpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEnableTotpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [enableTotpMutation, { data, loading, error }] = useEnableTotpMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useEnableTotpMutation(baseOptions?: Apollo.MutationHookOptions<EnableTotpMutation, EnableTotpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EnableTotpMutation, EnableTotpMutationVariables>(EnableTotpDocument, options);
      }
export type EnableTotpMutationHookResult = ReturnType<typeof useEnableTotpMutation>;
export type EnableTotpMutationResult = Apollo.MutationResult<EnableTotpMutation>;
export type EnableTotpMutationOptions = Apollo.BaseMutationOptions<EnableTotpMutation, EnableTotpMutationVariables>;
export const GenerateTotpSecretDocument = gql`
    mutation GenerateTotpSecret {
  generateTotpSecret {
    totpSecret
    qrCodeUrl
  }
}
    `;
export type GenerateTotpSecretMutationFn = Apollo.MutationFunction<GenerateTotpSecretMutation, GenerateTotpSecretMutationVariables>;

/**
 * __useGenerateTotpSecretMutation__
 *
 * To run a mutation, you first call `useGenerateTotpSecretMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateTotpSecretMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateTotpSecretMutation, { data, loading, error }] = useGenerateTotpSecretMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateTotpSecretMutation(baseOptions?: Apollo.MutationHookOptions<GenerateTotpSecretMutation, GenerateTotpSecretMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateTotpSecretMutation, GenerateTotpSecretMutationVariables>(GenerateTotpSecretDocument, options);
      }
export type GenerateTotpSecretMutationHookResult = ReturnType<typeof useGenerateTotpSecretMutation>;
export type GenerateTotpSecretMutationResult = Apollo.MutationResult<GenerateTotpSecretMutation>;
export type GenerateTotpSecretMutationOptions = Apollo.BaseMutationOptions<GenerateTotpSecretMutation, GenerateTotpSecretMutationVariables>;
export const LoginUserDocument = gql`
    mutation LoginUser($data: LoginInput!) {
  loginUser(data: $data) {
    message
    user {
      id
    }
    accessToken
    refreshToken
    sessionId
  }
}
    `;
export type LoginUserMutationFn = Apollo.MutationFunction<LoginUserMutation, LoginUserMutationVariables>;

/**
 * __useLoginUserMutation__
 *
 * To run a mutation, you first call `useLoginUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginUserMutation, { data, loading, error }] = useLoginUserMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLoginUserMutation(baseOptions?: Apollo.MutationHookOptions<LoginUserMutation, LoginUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginUserMutation, LoginUserMutationVariables>(LoginUserDocument, options);
      }
export type LoginUserMutationHookResult = ReturnType<typeof useLoginUserMutation>;
export type LoginUserMutationResult = Apollo.MutationResult<LoginUserMutation>;
export type LoginUserMutationOptions = Apollo.BaseMutationOptions<LoginUserMutation, LoginUserMutationVariables>;
export const LogoutUserDocument = gql`
    mutation LogoutUser {
  logoutUser
}
    `;
export type LogoutUserMutationFn = Apollo.MutationFunction<LogoutUserMutation, LogoutUserMutationVariables>;

/**
 * __useLogoutUserMutation__
 *
 * To run a mutation, you first call `useLogoutUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutUserMutation, { data, loading, error }] = useLogoutUserMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutUserMutation(baseOptions?: Apollo.MutationHookOptions<LogoutUserMutation, LogoutUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutUserMutation, LogoutUserMutationVariables>(LogoutUserDocument, options);
      }
export type LogoutUserMutationHookResult = ReturnType<typeof useLogoutUserMutation>;
export type LogoutUserMutationResult = Apollo.MutationResult<LogoutUserMutation>;
export type LogoutUserMutationOptions = Apollo.BaseMutationOptions<LogoutUserMutation, LogoutUserMutationVariables>;
export const ToggleChatRequireTotpDocument = gql`
    mutation ToggleChatRequireTotp($chatId: String!, $enable: Boolean!) {
  toggleChatRequireTotp(chatId: $chatId, enable: $enable)
}
    `;
export type ToggleChatRequireTotpMutationFn = Apollo.MutationFunction<ToggleChatRequireTotpMutation, ToggleChatRequireTotpMutationVariables>;

/**
 * __useToggleChatRequireTotpMutation__
 *
 * To run a mutation, you first call `useToggleChatRequireTotpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleChatRequireTotpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleChatRequireTotpMutation, { data, loading, error }] = useToggleChatRequireTotpMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      enable: // value for 'enable'
 *   },
 * });
 */
export function useToggleChatRequireTotpMutation(baseOptions?: Apollo.MutationHookOptions<ToggleChatRequireTotpMutation, ToggleChatRequireTotpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleChatRequireTotpMutation, ToggleChatRequireTotpMutationVariables>(ToggleChatRequireTotpDocument, options);
      }
export type ToggleChatRequireTotpMutationHookResult = ReturnType<typeof useToggleChatRequireTotpMutation>;
export type ToggleChatRequireTotpMutationResult = Apollo.MutationResult<ToggleChatRequireTotpMutation>;
export type ToggleChatRequireTotpMutationOptions = Apollo.BaseMutationOptions<ToggleChatRequireTotpMutation, ToggleChatRequireTotpMutationVariables>;
export const VerifyChatTotpDocument = gql`
    mutation VerifyChatTotp($chatId: String!, $code: String!) {
  verifyChatTotp(chatId: $chatId, code: $code)
}
    `;
export type VerifyChatTotpMutationFn = Apollo.MutationFunction<VerifyChatTotpMutation, VerifyChatTotpMutationVariables>;

/**
 * __useVerifyChatTotpMutation__
 *
 * To run a mutation, you first call `useVerifyChatTotpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyChatTotpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyChatTotpMutation, { data, loading, error }] = useVerifyChatTotpMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      code: // value for 'code'
 *   },
 * });
 */
export function useVerifyChatTotpMutation(baseOptions?: Apollo.MutationHookOptions<VerifyChatTotpMutation, VerifyChatTotpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyChatTotpMutation, VerifyChatTotpMutationVariables>(VerifyChatTotpDocument, options);
      }
export type VerifyChatTotpMutationHookResult = ReturnType<typeof useVerifyChatTotpMutation>;
export type VerifyChatTotpMutationResult = Apollo.MutationResult<VerifyChatTotpMutation>;
export type VerifyChatTotpMutationOptions = Apollo.BaseMutationOptions<VerifyChatTotpMutation, VerifyChatTotpMutationVariables>;
export const AssignRoleToUserDocument = gql`
    mutation AssignRoleToUser($chatId: String!, $roleId: String!, $memberId: String!) {
  assignRoleToUser(chatId: $chatId, roleId: $roleId, memberId: $memberId)
}
    `;
export type AssignRoleToUserMutationFn = Apollo.MutationFunction<AssignRoleToUserMutation, AssignRoleToUserMutationVariables>;

/**
 * __useAssignRoleToUserMutation__
 *
 * To run a mutation, you first call `useAssignRoleToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToUserMutation, { data, loading, error }] = useAssignRoleToUserMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      roleId: // value for 'roleId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignRoleToUserMutation(baseOptions?: Apollo.MutationHookOptions<AssignRoleToUserMutation, AssignRoleToUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignRoleToUserMutation, AssignRoleToUserMutationVariables>(AssignRoleToUserDocument, options);
      }
export type AssignRoleToUserMutationHookResult = ReturnType<typeof useAssignRoleToUserMutation>;
export type AssignRoleToUserMutationResult = Apollo.MutationResult<AssignRoleToUserMutation>;
export type AssignRoleToUserMutationOptions = Apollo.BaseMutationOptions<AssignRoleToUserMutation, AssignRoleToUserMutationVariables>;
export const ChangeChatAvatarDocument = gql`
    mutation ChangeChatAvatar($avatar: Upload!, $chatId: String!) {
  changeChatAvatar(avatar: $avatar, chatId: $chatId)
}
    `;
export type ChangeChatAvatarMutationFn = Apollo.MutationFunction<ChangeChatAvatarMutation, ChangeChatAvatarMutationVariables>;

/**
 * __useChangeChatAvatarMutation__
 *
 * To run a mutation, you first call `useChangeChatAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeChatAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeChatAvatarMutation, { data, loading, error }] = useChangeChatAvatarMutation({
 *   variables: {
 *      avatar: // value for 'avatar'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChangeChatAvatarMutation(baseOptions?: Apollo.MutationHookOptions<ChangeChatAvatarMutation, ChangeChatAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeChatAvatarMutation, ChangeChatAvatarMutationVariables>(ChangeChatAvatarDocument, options);
      }
export type ChangeChatAvatarMutationHookResult = ReturnType<typeof useChangeChatAvatarMutation>;
export type ChangeChatAvatarMutationResult = Apollo.MutationResult<ChangeChatAvatarMutation>;
export type ChangeChatAvatarMutationOptions = Apollo.BaseMutationOptions<ChangeChatAvatarMutation, ChangeChatAvatarMutationVariables>;
export const ChangeChatInfoDocument = gql`
    mutation ChangeChatInfo($data: ChangeChatInfoInput!, $chatId: String!) {
  changeChatInfo(data: $data, chatId: $chatId)
}
    `;
export type ChangeChatInfoMutationFn = Apollo.MutationFunction<ChangeChatInfoMutation, ChangeChatInfoMutationVariables>;

/**
 * __useChangeChatInfoMutation__
 *
 * To run a mutation, you first call `useChangeChatInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeChatInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeChatInfoMutation, { data, loading, error }] = useChangeChatInfoMutation({
 *   variables: {
 *      data: // value for 'data'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChangeChatInfoMutation(baseOptions?: Apollo.MutationHookOptions<ChangeChatInfoMutation, ChangeChatInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeChatInfoMutation, ChangeChatInfoMutationVariables>(ChangeChatInfoDocument, options);
      }
export type ChangeChatInfoMutationHookResult = ReturnType<typeof useChangeChatInfoMutation>;
export type ChangeChatInfoMutationResult = Apollo.MutationResult<ChangeChatInfoMutation>;
export type ChangeChatInfoMutationOptions = Apollo.BaseMutationOptions<ChangeChatInfoMutation, ChangeChatInfoMutationVariables>;
export const CreateChatDocument = gql`
    mutation createChat($data: CreateChatInput!, $groupId: String!) {
  createChat(data: $data, groupId: $groupId) {
    chatName
    avatarUrl
    id
    updatedAt
    isSecret
  }
}
    `;
export type CreateChatMutationFn = Apollo.MutationFunction<CreateChatMutation, CreateChatMutationVariables>;

/**
 * __useCreateChatMutation__
 *
 * To run a mutation, you first call `useCreateChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatMutation, { data, loading, error }] = useCreateChatMutation({
 *   variables: {
 *      data: // value for 'data'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useCreateChatMutation(baseOptions?: Apollo.MutationHookOptions<CreateChatMutation, CreateChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateChatMutation, CreateChatMutationVariables>(CreateChatDocument, options);
      }
export type CreateChatMutationHookResult = ReturnType<typeof useCreateChatMutation>;
export type CreateChatMutationResult = Apollo.MutationResult<CreateChatMutation>;
export type CreateChatMutationOptions = Apollo.BaseMutationOptions<CreateChatMutation, CreateChatMutationVariables>;
export const DeleteChatDocument = gql`
    mutation DeleteChat($chatId: String!) {
  deleteChat(chatId: $chatId)
}
    `;
export type DeleteChatMutationFn = Apollo.MutationFunction<DeleteChatMutation, DeleteChatMutationVariables>;

/**
 * __useDeleteChatMutation__
 *
 * To run a mutation, you first call `useDeleteChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatMutation, { data, loading, error }] = useDeleteChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useDeleteChatMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatMutation, DeleteChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatMutation, DeleteChatMutationVariables>(DeleteChatDocument, options);
      }
export type DeleteChatMutationHookResult = ReturnType<typeof useDeleteChatMutation>;
export type DeleteChatMutationResult = Apollo.MutationResult<DeleteChatMutation>;
export type DeleteChatMutationOptions = Apollo.BaseMutationOptions<DeleteChatMutation, DeleteChatMutationVariables>;
export const DeleteChatRoleDocument = gql`
    mutation DeleteChatRole($chatId: String!, $roleId: String!) {
  deleteChatRole(chatId: $chatId, roleId: $roleId)
}
    `;
export type DeleteChatRoleMutationFn = Apollo.MutationFunction<DeleteChatRoleMutation, DeleteChatRoleMutationVariables>;

/**
 * __useDeleteChatRoleMutation__
 *
 * To run a mutation, you first call `useDeleteChatRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatRoleMutation, { data, loading, error }] = useDeleteChatRoleMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useDeleteChatRoleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatRoleMutation, DeleteChatRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatRoleMutation, DeleteChatRoleMutationVariables>(DeleteChatRoleDocument, options);
      }
export type DeleteChatRoleMutationHookResult = ReturnType<typeof useDeleteChatRoleMutation>;
export type DeleteChatRoleMutationResult = Apollo.MutationResult<DeleteChatRoleMutation>;
export type DeleteChatRoleMutationOptions = Apollo.BaseMutationOptions<DeleteChatRoleMutation, DeleteChatRoleMutationVariables>;
export const DownloadFileDocument = gql`
    mutation DownloadFile($fileId: String!, $chatId: String!) {
  downloadFile(fileId: $fileId, chatId: $chatId) {
    filename
    fileUrl
  }
}
    `;
export type DownloadFileMutationFn = Apollo.MutationFunction<DownloadFileMutation, DownloadFileMutationVariables>;

/**
 * __useDownloadFileMutation__
 *
 * To run a mutation, you first call `useDownloadFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadFileMutation, { data, loading, error }] = useDownloadFileMutation({
 *   variables: {
 *      fileId: // value for 'fileId'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useDownloadFileMutation(baseOptions?: Apollo.MutationHookOptions<DownloadFileMutation, DownloadFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadFileMutation, DownloadFileMutationVariables>(DownloadFileDocument, options);
      }
export type DownloadFileMutationHookResult = ReturnType<typeof useDownloadFileMutation>;
export type DownloadFileMutationResult = Apollo.MutationResult<DownloadFileMutation>;
export type DownloadFileMutationOptions = Apollo.BaseMutationOptions<DownloadFileMutation, DownloadFileMutationVariables>;
export const FindOrCreateDirectChatDocument = gql`
    mutation FindOrCreateDirectChat($friendUserId: String!, $isSecret: Boolean) {
  findOrCreateDirectChat(friendUserId: $friendUserId, isSecret: $isSecret) {
    id
    chatName
    isSecret
    isGroup
    groupId
  }
}
    `;
export type FindOrCreateDirectChatMutationFn = Apollo.MutationFunction<FindOrCreateDirectChatMutation, FindOrCreateDirectChatMutationVariables>;

/**
 * __useFindOrCreateDirectChatMutation__
 *
 * To run a mutation, you first call `useFindOrCreateDirectChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFindOrCreateDirectChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [findOrCreateDirectChatMutation, { data, loading, error }] = useFindOrCreateDirectChatMutation({
 *   variables: {
 *      friendUserId: // value for 'friendUserId'
 *      isSecret: // value for 'isSecret'
 *   },
 * });
 */
export function useFindOrCreateDirectChatMutation(baseOptions?: Apollo.MutationHookOptions<FindOrCreateDirectChatMutation, FindOrCreateDirectChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<FindOrCreateDirectChatMutation, FindOrCreateDirectChatMutationVariables>(FindOrCreateDirectChatDocument, options);
      }
export type FindOrCreateDirectChatMutationHookResult = ReturnType<typeof useFindOrCreateDirectChatMutation>;
export type FindOrCreateDirectChatMutationResult = Apollo.MutationResult<FindOrCreateDirectChatMutation>;
export type FindOrCreateDirectChatMutationOptions = Apollo.BaseMutationOptions<FindOrCreateDirectChatMutation, FindOrCreateDirectChatMutationVariables>;
export const ForwardChatMessageDocument = gql`
    mutation ForwardChatMessage($chatId: String!, $data: SendChatMessageInput!) {
  forwardChatMessage(chatId: $chatId, data: $data)
}
    `;
export type ForwardChatMessageMutationFn = Apollo.MutationFunction<ForwardChatMessageMutation, ForwardChatMessageMutationVariables>;

/**
 * __useForwardChatMessageMutation__
 *
 * To run a mutation, you first call `useForwardChatMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForwardChatMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forwardChatMessageMutation, { data, loading, error }] = useForwardChatMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useForwardChatMessageMutation(baseOptions?: Apollo.MutationHookOptions<ForwardChatMessageMutation, ForwardChatMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForwardChatMessageMutation, ForwardChatMessageMutationVariables>(ForwardChatMessageDocument, options);
      }
export type ForwardChatMessageMutationHookResult = ReturnType<typeof useForwardChatMessageMutation>;
export type ForwardChatMessageMutationResult = Apollo.MutationResult<ForwardChatMessageMutation>;
export type ForwardChatMessageMutationOptions = Apollo.BaseMutationOptions<ForwardChatMessageMutation, ForwardChatMessageMutationVariables>;
export const InviteMemberToChatDocument = gql`
    mutation InviteMemberToChat($chatId: String!, $targetUserId: String!) {
  inviteMemberToChat(chatId: $chatId, targetUserId: $targetUserId)
}
    `;
export type InviteMemberToChatMutationFn = Apollo.MutationFunction<InviteMemberToChatMutation, InviteMemberToChatMutationVariables>;

/**
 * __useInviteMemberToChatMutation__
 *
 * To run a mutation, you first call `useInviteMemberToChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteMemberToChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteMemberToChatMutation, { data, loading, error }] = useInviteMemberToChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      targetUserId: // value for 'targetUserId'
 *   },
 * });
 */
export function useInviteMemberToChatMutation(baseOptions?: Apollo.MutationHookOptions<InviteMemberToChatMutation, InviteMemberToChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InviteMemberToChatMutation, InviteMemberToChatMutationVariables>(InviteMemberToChatDocument, options);
      }
export type InviteMemberToChatMutationHookResult = ReturnType<typeof useInviteMemberToChatMutation>;
export type InviteMemberToChatMutationResult = Apollo.MutationResult<InviteMemberToChatMutation>;
export type InviteMemberToChatMutationOptions = Apollo.BaseMutationOptions<InviteMemberToChatMutation, InviteMemberToChatMutationVariables>;
export const LeaveChatDocument = gql`
    mutation LeaveChat($chatId: String!) {
  leaveChat(chatId: $chatId)
}
    `;
export type LeaveChatMutationFn = Apollo.MutationFunction<LeaveChatMutation, LeaveChatMutationVariables>;

/**
 * __useLeaveChatMutation__
 *
 * To run a mutation, you first call `useLeaveChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveChatMutation, { data, loading, error }] = useLeaveChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useLeaveChatMutation(baseOptions?: Apollo.MutationHookOptions<LeaveChatMutation, LeaveChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveChatMutation, LeaveChatMutationVariables>(LeaveChatDocument, options);
      }
export type LeaveChatMutationHookResult = ReturnType<typeof useLeaveChatMutation>;
export type LeaveChatMutationResult = Apollo.MutationResult<LeaveChatMutation>;
export type LeaveChatMutationOptions = Apollo.BaseMutationOptions<LeaveChatMutation, LeaveChatMutationVariables>;
export const PinChatDocument = gql`
    mutation PinChat($chatId: String!) {
  pinChat(chatId: $chatId)
}
    `;
export type PinChatMutationFn = Apollo.MutationFunction<PinChatMutation, PinChatMutationVariables>;

/**
 * __usePinChatMutation__
 *
 * To run a mutation, you first call `usePinChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePinChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pinChatMutation, { data, loading, error }] = usePinChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function usePinChatMutation(baseOptions?: Apollo.MutationHookOptions<PinChatMutation, PinChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PinChatMutation, PinChatMutationVariables>(PinChatDocument, options);
      }
export type PinChatMutationHookResult = ReturnType<typeof usePinChatMutation>;
export type PinChatMutationResult = Apollo.MutationResult<PinChatMutation>;
export type PinChatMutationOptions = Apollo.BaseMutationOptions<PinChatMutation, PinChatMutationVariables>;
export const PinMessageDocument = gql`
    mutation PinMessage($chatId: String!, $messageId: String!) {
  pinMessage(chatId: $chatId, messageId: $messageId)
}
    `;
export type PinMessageMutationFn = Apollo.MutationFunction<PinMessageMutation, PinMessageMutationVariables>;

/**
 * __usePinMessageMutation__
 *
 * To run a mutation, you first call `usePinMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePinMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pinMessageMutation, { data, loading, error }] = usePinMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      messageId: // value for 'messageId'
 *   },
 * });
 */
export function usePinMessageMutation(baseOptions?: Apollo.MutationHookOptions<PinMessageMutation, PinMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PinMessageMutation, PinMessageMutationVariables>(PinMessageDocument, options);
      }
export type PinMessageMutationHookResult = ReturnType<typeof usePinMessageMutation>;
export type PinMessageMutationResult = Apollo.MutationResult<PinMessageMutation>;
export type PinMessageMutationOptions = Apollo.BaseMutationOptions<PinMessageMutation, PinMessageMutationVariables>;
export const RemoveChatAvatarDocument = gql`
    mutation RemoveChatAvatar($chatId: String!) {
  removeChatAvatar(chatId: $chatId)
}
    `;
export type RemoveChatAvatarMutationFn = Apollo.MutationFunction<RemoveChatAvatarMutation, RemoveChatAvatarMutationVariables>;

/**
 * __useRemoveChatAvatarMutation__
 *
 * To run a mutation, you first call `useRemoveChatAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveChatAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeChatAvatarMutation, { data, loading, error }] = useRemoveChatAvatarMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useRemoveChatAvatarMutation(baseOptions?: Apollo.MutationHookOptions<RemoveChatAvatarMutation, RemoveChatAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveChatAvatarMutation, RemoveChatAvatarMutationVariables>(RemoveChatAvatarDocument, options);
      }
export type RemoveChatAvatarMutationHookResult = ReturnType<typeof useRemoveChatAvatarMutation>;
export type RemoveChatAvatarMutationResult = Apollo.MutationResult<RemoveChatAvatarMutation>;
export type RemoveChatAvatarMutationOptions = Apollo.BaseMutationOptions<RemoveChatAvatarMutation, RemoveChatAvatarMutationVariables>;
export const RemoveDraftDocument = gql`
    mutation RemoveDraft($chatId: String!) {
  removeDraft(chatId: $chatId)
}
    `;
export type RemoveDraftMutationFn = Apollo.MutationFunction<RemoveDraftMutation, RemoveDraftMutationVariables>;

/**
 * __useRemoveDraftMutation__
 *
 * To run a mutation, you first call `useRemoveDraftMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveDraftMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeDraftMutation, { data, loading, error }] = useRemoveDraftMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useRemoveDraftMutation(baseOptions?: Apollo.MutationHookOptions<RemoveDraftMutation, RemoveDraftMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveDraftMutation, RemoveDraftMutationVariables>(RemoveDraftDocument, options);
      }
export type RemoveDraftMutationHookResult = ReturnType<typeof useRemoveDraftMutation>;
export type RemoveDraftMutationResult = Apollo.MutationResult<RemoveDraftMutation>;
export type RemoveDraftMutationOptions = Apollo.BaseMutationOptions<RemoveDraftMutation, RemoveDraftMutationVariables>;
export const RemoveFileDocument = gql`
    mutation RemoveFile($fileId: String!, $chatId: String!) {
  removeFile(fileId: $fileId, chatId: $chatId)
}
    `;
export type RemoveFileMutationFn = Apollo.MutationFunction<RemoveFileMutation, RemoveFileMutationVariables>;

/**
 * __useRemoveFileMutation__
 *
 * To run a mutation, you first call `useRemoveFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFileMutation, { data, loading, error }] = useRemoveFileMutation({
 *   variables: {
 *      fileId: // value for 'fileId'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useRemoveFileMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFileMutation, RemoveFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFileMutation, RemoveFileMutationVariables>(RemoveFileDocument, options);
      }
export type RemoveFileMutationHookResult = ReturnType<typeof useRemoveFileMutation>;
export type RemoveFileMutationResult = Apollo.MutationResult<RemoveFileMutation>;
export type RemoveFileMutationOptions = Apollo.BaseMutationOptions<RemoveFileMutation, RemoveFileMutationVariables>;
export const RemoveMemberFromChatDocument = gql`
    mutation RemoveMemberFromChat($chatId: String!, $targetUserId: String!) {
  removeMemberFromChat(chatId: $chatId, targetUserId: $targetUserId)
}
    `;
export type RemoveMemberFromChatMutationFn = Apollo.MutationFunction<RemoveMemberFromChatMutation, RemoveMemberFromChatMutationVariables>;

/**
 * __useRemoveMemberFromChatMutation__
 *
 * To run a mutation, you first call `useRemoveMemberFromChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberFromChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberFromChatMutation, { data, loading, error }] = useRemoveMemberFromChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      targetUserId: // value for 'targetUserId'
 *   },
 * });
 */
export function useRemoveMemberFromChatMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberFromChatMutation, RemoveMemberFromChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberFromChatMutation, RemoveMemberFromChatMutationVariables>(RemoveMemberFromChatDocument, options);
      }
export type RemoveMemberFromChatMutationHookResult = ReturnType<typeof useRemoveMemberFromChatMutation>;
export type RemoveMemberFromChatMutationResult = Apollo.MutationResult<RemoveMemberFromChatMutation>;
export type RemoveMemberFromChatMutationOptions = Apollo.BaseMutationOptions<RemoveMemberFromChatMutation, RemoveMemberFromChatMutationVariables>;
export const RemoveMessagesDocument = gql`
    mutation RemoveMessages($chatId: String!, $data: RemoveMessagesInput!) {
  removeMessages(chatId: $chatId, data: $data)
}
    `;
export type RemoveMessagesMutationFn = Apollo.MutationFunction<RemoveMessagesMutation, RemoveMessagesMutationVariables>;

/**
 * __useRemoveMessagesMutation__
 *
 * To run a mutation, you first call `useRemoveMessagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMessagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMessagesMutation, { data, loading, error }] = useRemoveMessagesMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useRemoveMessagesMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMessagesMutation, RemoveMessagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMessagesMutation, RemoveMessagesMutationVariables>(RemoveMessagesDocument, options);
      }
export type RemoveMessagesMutationHookResult = ReturnType<typeof useRemoveMessagesMutation>;
export type RemoveMessagesMutationResult = Apollo.MutationResult<RemoveMessagesMutation>;
export type RemoveMessagesMutationOptions = Apollo.BaseMutationOptions<RemoveMessagesMutation, RemoveMessagesMutationVariables>;
export const RemoveRoleFromUserDocument = gql`
    mutation RemoveRoleFromUser($chatId: String!, $roleId: String!, $memberId: String!) {
  removeRoleFromUser(chatId: $chatId, roleId: $roleId, memberId: $memberId)
}
    `;
export type RemoveRoleFromUserMutationFn = Apollo.MutationFunction<RemoveRoleFromUserMutation, RemoveRoleFromUserMutationVariables>;

/**
 * __useRemoveRoleFromUserMutation__
 *
 * To run a mutation, you first call `useRemoveRoleFromUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRoleFromUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRoleFromUserMutation, { data, loading, error }] = useRemoveRoleFromUserMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      roleId: // value for 'roleId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveRoleFromUserMutation(baseOptions?: Apollo.MutationHookOptions<RemoveRoleFromUserMutation, RemoveRoleFromUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveRoleFromUserMutation, RemoveRoleFromUserMutationVariables>(RemoveRoleFromUserDocument, options);
      }
export type RemoveRoleFromUserMutationHookResult = ReturnType<typeof useRemoveRoleFromUserMutation>;
export type RemoveRoleFromUserMutationResult = Apollo.MutationResult<RemoveRoleFromUserMutation>;
export type RemoveRoleFromUserMutationOptions = Apollo.BaseMutationOptions<RemoveRoleFromUserMutation, RemoveRoleFromUserMutationVariables>;
export const SendChatDraftMessageDocument = gql`
    mutation SendChatDraftMessage($chatId: String!, $data: SendChatMessageInput!) {
  sendChatDraftMessage(chatId: $chatId, data: $data)
}
    `;
export type SendChatDraftMessageMutationFn = Apollo.MutationFunction<SendChatDraftMessageMutation, SendChatDraftMessageMutationVariables>;

/**
 * __useSendChatDraftMessageMutation__
 *
 * To run a mutation, you first call `useSendChatDraftMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendChatDraftMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendChatDraftMessageMutation, { data, loading, error }] = useSendChatDraftMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendChatDraftMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendChatDraftMessageMutation, SendChatDraftMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendChatDraftMessageMutation, SendChatDraftMessageMutationVariables>(SendChatDraftMessageDocument, options);
      }
export type SendChatDraftMessageMutationHookResult = ReturnType<typeof useSendChatDraftMessageMutation>;
export type SendChatDraftMessageMutationResult = Apollo.MutationResult<SendChatDraftMessageMutation>;
export type SendChatDraftMessageMutationOptions = Apollo.BaseMutationOptions<SendChatDraftMessageMutation, SendChatDraftMessageMutationVariables>;
export const SendChatMessageDocument = gql`
    mutation SendChatMessage($chatId: String!, $data: SendChatMessageInput!) {
  sendChatMessage(chatId: $chatId, data: $data)
}
    `;
export type SendChatMessageMutationFn = Apollo.MutationFunction<SendChatMessageMutation, SendChatMessageMutationVariables>;

/**
 * __useSendChatMessageMutation__
 *
 * To run a mutation, you first call `useSendChatMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendChatMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendChatMessageMutation, { data, loading, error }] = useSendChatMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendChatMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendChatMessageMutation, SendChatMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendChatMessageMutation, SendChatMessageMutationVariables>(SendChatMessageDocument, options);
      }
export type SendChatMessageMutationHookResult = ReturnType<typeof useSendChatMessageMutation>;
export type SendChatMessageMutationResult = Apollo.MutationResult<SendChatMessageMutation>;
export type SendChatMessageMutationOptions = Apollo.BaseMutationOptions<SendChatMessageMutation, SendChatMessageMutationVariables>;
export const SendFileDocument = gql`
    mutation SendFile($chatId: String!, $file: Upload!, $messageId: String!) {
  sendFile(chatId: $chatId, file: $file, messageId: $messageId) {
    chatDraftMessageId
    fileId
  }
}
    `;
export type SendFileMutationFn = Apollo.MutationFunction<SendFileMutation, SendFileMutationVariables>;

/**
 * __useSendFileMutation__
 *
 * To run a mutation, you first call `useSendFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFileMutation, { data, loading, error }] = useSendFileMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      file: // value for 'file'
 *      messageId: // value for 'messageId'
 *   },
 * });
 */
export function useSendFileMutation(baseOptions?: Apollo.MutationHookOptions<SendFileMutation, SendFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendFileMutation, SendFileMutationVariables>(SendFileDocument, options);
      }
export type SendFileMutationHookResult = ReturnType<typeof useSendFileMutation>;
export type SendFileMutationResult = Apollo.MutationResult<SendFileMutation>;
export type SendFileMutationOptions = Apollo.BaseMutationOptions<SendFileMutation, SendFileMutationVariables>;
export const StartTypingDocument = gql`
    mutation StartTyping($chatId: String!) {
  startTyping(chatId: $chatId)
}
    `;
export type StartTypingMutationFn = Apollo.MutationFunction<StartTypingMutation, StartTypingMutationVariables>;

/**
 * __useStartTypingMutation__
 *
 * To run a mutation, you first call `useStartTypingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartTypingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startTypingMutation, { data, loading, error }] = useStartTypingMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useStartTypingMutation(baseOptions?: Apollo.MutationHookOptions<StartTypingMutation, StartTypingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartTypingMutation, StartTypingMutationVariables>(StartTypingDocument, options);
      }
export type StartTypingMutationHookResult = ReturnType<typeof useStartTypingMutation>;
export type StartTypingMutationResult = Apollo.MutationResult<StartTypingMutation>;
export type StartTypingMutationOptions = Apollo.BaseMutationOptions<StartTypingMutation, StartTypingMutationVariables>;
export const UnPinChatDocument = gql`
    mutation UnPinChat($chatId: String!) {
  unPinChat(chatId: $chatId)
}
    `;
export type UnPinChatMutationFn = Apollo.MutationFunction<UnPinChatMutation, UnPinChatMutationVariables>;

/**
 * __useUnPinChatMutation__
 *
 * To run a mutation, you first call `useUnPinChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnPinChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unPinChatMutation, { data, loading, error }] = useUnPinChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useUnPinChatMutation(baseOptions?: Apollo.MutationHookOptions<UnPinChatMutation, UnPinChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnPinChatMutation, UnPinChatMutationVariables>(UnPinChatDocument, options);
      }
export type UnPinChatMutationHookResult = ReturnType<typeof useUnPinChatMutation>;
export type UnPinChatMutationResult = Apollo.MutationResult<UnPinChatMutation>;
export type UnPinChatMutationOptions = Apollo.BaseMutationOptions<UnPinChatMutation, UnPinChatMutationVariables>;
export const UnPinMessageDocument = gql`
    mutation UnPinMessage($chatId: String!) {
  unPinMessage(chatId: $chatId)
}
    `;
export type UnPinMessageMutationFn = Apollo.MutationFunction<UnPinMessageMutation, UnPinMessageMutationVariables>;

/**
 * __useUnPinMessageMutation__
 *
 * To run a mutation, you first call `useUnPinMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnPinMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unPinMessageMutation, { data, loading, error }] = useUnPinMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useUnPinMessageMutation(baseOptions?: Apollo.MutationHookOptions<UnPinMessageMutation, UnPinMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnPinMessageMutation, UnPinMessageMutationVariables>(UnPinMessageDocument, options);
      }
export type UnPinMessageMutationHookResult = ReturnType<typeof useUnPinMessageMutation>;
export type UnPinMessageMutationResult = Apollo.MutationResult<UnPinMessageMutation>;
export type UnPinMessageMutationOptions = Apollo.BaseMutationOptions<UnPinMessageMutation, UnPinMessageMutationVariables>;
export const UpdatePinnedChatsOrderDocument = gql`
    mutation UpdatePinnedChatsOrder($chatIds: [String!]!) {
  updatePinnedChatsOrder(chatIds: $chatIds)
}
    `;
export type UpdatePinnedChatsOrderMutationFn = Apollo.MutationFunction<UpdatePinnedChatsOrderMutation, UpdatePinnedChatsOrderMutationVariables>;

/**
 * __useUpdatePinnedChatsOrderMutation__
 *
 * To run a mutation, you first call `useUpdatePinnedChatsOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePinnedChatsOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePinnedChatsOrderMutation, { data, loading, error }] = useUpdatePinnedChatsOrderMutation({
 *   variables: {
 *      chatIds: // value for 'chatIds'
 *   },
 * });
 */
export function useUpdatePinnedChatsOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePinnedChatsOrderMutation, UpdatePinnedChatsOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePinnedChatsOrderMutation, UpdatePinnedChatsOrderMutationVariables>(UpdatePinnedChatsOrderDocument, options);
      }
export type UpdatePinnedChatsOrderMutationHookResult = ReturnType<typeof useUpdatePinnedChatsOrderMutation>;
export type UpdatePinnedChatsOrderMutationResult = Apollo.MutationResult<UpdatePinnedChatsOrderMutation>;
export type UpdatePinnedChatsOrderMutationOptions = Apollo.BaseMutationOptions<UpdatePinnedChatsOrderMutation, UpdatePinnedChatsOrderMutationVariables>;
export const UpsertChatRoleDocument = gql`
    mutation UpsertChatRole($chatId: String!, $data: UpsertChatRoleInput!) {
  upsertChatRole(chatId: $chatId, data: $data)
}
    `;
export type UpsertChatRoleMutationFn = Apollo.MutationFunction<UpsertChatRoleMutation, UpsertChatRoleMutationVariables>;

/**
 * __useUpsertChatRoleMutation__
 *
 * To run a mutation, you first call `useUpsertChatRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertChatRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertChatRoleMutation, { data, loading, error }] = useUpsertChatRoleMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpsertChatRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpsertChatRoleMutation, UpsertChatRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertChatRoleMutation, UpsertChatRoleMutationVariables>(UpsertChatRoleDocument, options);
      }
export type UpsertChatRoleMutationHookResult = ReturnType<typeof useUpsertChatRoleMutation>;
export type UpsertChatRoleMutationResult = Apollo.MutationResult<UpsertChatRoleMutation>;
export type UpsertChatRoleMutationOptions = Apollo.BaseMutationOptions<UpsertChatRoleMutation, UpsertChatRoleMutationVariables>;
export const AcceptFriendRequestDocument = gql`
    mutation AcceptFriendRequest($friendshipId: String!) {
  acceptFriendRequest(friendshipId: $friendshipId)
}
    `;
export type AcceptFriendRequestMutationFn = Apollo.MutationFunction<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;

/**
 * __useAcceptFriendRequestMutation__
 *
 * To run a mutation, you first call `useAcceptFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptFriendRequestMutation, { data, loading, error }] = useAcceptFriendRequestMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useAcceptFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>(AcceptFriendRequestDocument, options);
      }
export type AcceptFriendRequestMutationHookResult = ReturnType<typeof useAcceptFriendRequestMutation>;
export type AcceptFriendRequestMutationResult = Apollo.MutationResult<AcceptFriendRequestMutation>;
export type AcceptFriendRequestMutationOptions = Apollo.BaseMutationOptions<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;
export const BlockUserDocument = gql`
    mutation BlockUser($targetUserId: String!) {
  blockUser(targetUserId: $targetUserId)
}
    `;
export type BlockUserMutationFn = Apollo.MutationFunction<BlockUserMutation, BlockUserMutationVariables>;

/**
 * __useBlockUserMutation__
 *
 * To run a mutation, you first call `useBlockUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBlockUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [blockUserMutation, { data, loading, error }] = useBlockUserMutation({
 *   variables: {
 *      targetUserId: // value for 'targetUserId'
 *   },
 * });
 */
export function useBlockUserMutation(baseOptions?: Apollo.MutationHookOptions<BlockUserMutation, BlockUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BlockUserMutation, BlockUserMutationVariables>(BlockUserDocument, options);
      }
export type BlockUserMutationHookResult = ReturnType<typeof useBlockUserMutation>;
export type BlockUserMutationResult = Apollo.MutationResult<BlockUserMutation>;
export type BlockUserMutationOptions = Apollo.BaseMutationOptions<BlockUserMutation, BlockUserMutationVariables>;
export const CancelFriendRequestDocument = gql`
    mutation CancelFriendRequest($friendshipId: String!) {
  cancelFriendRequest(friendshipId: $friendshipId)
}
    `;
export type CancelFriendRequestMutationFn = Apollo.MutationFunction<CancelFriendRequestMutation, CancelFriendRequestMutationVariables>;

/**
 * __useCancelFriendRequestMutation__
 *
 * To run a mutation, you first call `useCancelFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelFriendRequestMutation, { data, loading, error }] = useCancelFriendRequestMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useCancelFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<CancelFriendRequestMutation, CancelFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelFriendRequestMutation, CancelFriendRequestMutationVariables>(CancelFriendRequestDocument, options);
      }
export type CancelFriendRequestMutationHookResult = ReturnType<typeof useCancelFriendRequestMutation>;
export type CancelFriendRequestMutationResult = Apollo.MutationResult<CancelFriendRequestMutation>;
export type CancelFriendRequestMutationOptions = Apollo.BaseMutationOptions<CancelFriendRequestMutation, CancelFriendRequestMutationVariables>;
export const DeclineFriendRequestDocument = gql`
    mutation DeclineFriendRequest($friendshipId: String!) {
  declineFriendRequest(friendshipId: $friendshipId)
}
    `;
export type DeclineFriendRequestMutationFn = Apollo.MutationFunction<DeclineFriendRequestMutation, DeclineFriendRequestMutationVariables>;

/**
 * __useDeclineFriendRequestMutation__
 *
 * To run a mutation, you first call `useDeclineFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeclineFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [declineFriendRequestMutation, { data, loading, error }] = useDeclineFriendRequestMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useDeclineFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<DeclineFriendRequestMutation, DeclineFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeclineFriendRequestMutation, DeclineFriendRequestMutationVariables>(DeclineFriendRequestDocument, options);
      }
export type DeclineFriendRequestMutationHookResult = ReturnType<typeof useDeclineFriendRequestMutation>;
export type DeclineFriendRequestMutationResult = Apollo.MutationResult<DeclineFriendRequestMutation>;
export type DeclineFriendRequestMutationOptions = Apollo.BaseMutationOptions<DeclineFriendRequestMutation, DeclineFriendRequestMutationVariables>;
export const RemoveFriendDocument = gql`
    mutation RemoveFriend($friendshipId: String!) {
  removeFriend(friendshipId: $friendshipId)
}
    `;
export type RemoveFriendMutationFn = Apollo.MutationFunction<RemoveFriendMutation, RemoveFriendMutationVariables>;

/**
 * __useRemoveFriendMutation__
 *
 * To run a mutation, you first call `useRemoveFriendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFriendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFriendMutation, { data, loading, error }] = useRemoveFriendMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useRemoveFriendMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFriendMutation, RemoveFriendMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFriendMutation, RemoveFriendMutationVariables>(RemoveFriendDocument, options);
      }
export type RemoveFriendMutationHookResult = ReturnType<typeof useRemoveFriendMutation>;
export type RemoveFriendMutationResult = Apollo.MutationResult<RemoveFriendMutation>;
export type RemoveFriendMutationOptions = Apollo.BaseMutationOptions<RemoveFriendMutation, RemoveFriendMutationVariables>;
export const SendFriendRequestByUsernameDocument = gql`
    mutation SendFriendRequestByUsername($username: String!) {
  sendFriendRequestByUsername(username: $username)
}
    `;
export type SendFriendRequestByUsernameMutationFn = Apollo.MutationFunction<SendFriendRequestByUsernameMutation, SendFriendRequestByUsernameMutationVariables>;

/**
 * __useSendFriendRequestByUsernameMutation__
 *
 * To run a mutation, you first call `useSendFriendRequestByUsernameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFriendRequestByUsernameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFriendRequestByUsernameMutation, { data, loading, error }] = useSendFriendRequestByUsernameMutation({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useSendFriendRequestByUsernameMutation(baseOptions?: Apollo.MutationHookOptions<SendFriendRequestByUsernameMutation, SendFriendRequestByUsernameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendFriendRequestByUsernameMutation, SendFriendRequestByUsernameMutationVariables>(SendFriendRequestByUsernameDocument, options);
      }
export type SendFriendRequestByUsernameMutationHookResult = ReturnType<typeof useSendFriendRequestByUsernameMutation>;
export type SendFriendRequestByUsernameMutationResult = Apollo.MutationResult<SendFriendRequestByUsernameMutation>;
export type SendFriendRequestByUsernameMutationOptions = Apollo.BaseMutationOptions<SendFriendRequestByUsernameMutation, SendFriendRequestByUsernameMutationVariables>;
export const UnblockUserDocument = gql`
    mutation UnblockUser($friendshipId: String!) {
  unblockUser(friendshipId: $friendshipId)
}
    `;
export type UnblockUserMutationFn = Apollo.MutationFunction<UnblockUserMutation, UnblockUserMutationVariables>;

/**
 * __useUnblockUserMutation__
 *
 * To run a mutation, you first call `useUnblockUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnblockUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unblockUserMutation, { data, loading, error }] = useUnblockUserMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useUnblockUserMutation(baseOptions?: Apollo.MutationHookOptions<UnblockUserMutation, UnblockUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnblockUserMutation, UnblockUserMutationVariables>(UnblockUserDocument, options);
      }
export type UnblockUserMutationHookResult = ReturnType<typeof useUnblockUserMutation>;
export type UnblockUserMutationResult = Apollo.MutationResult<UnblockUserMutation>;
export type UnblockUserMutationOptions = Apollo.BaseMutationOptions<UnblockUserMutation, UnblockUserMutationVariables>;
export const AssignGroupRoleToMemberDocument = gql`
    mutation AssignGroupRoleToMember($groupId: String!, $roleId: String!, $memberId: String!) {
  assignGroupRoleToMember(groupId: $groupId, roleId: $roleId, memberId: $memberId)
}
    `;
export type AssignGroupRoleToMemberMutationFn = Apollo.MutationFunction<AssignGroupRoleToMemberMutation, AssignGroupRoleToMemberMutationVariables>;

/**
 * __useAssignGroupRoleToMemberMutation__
 *
 * To run a mutation, you first call `useAssignGroupRoleToMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignGroupRoleToMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignGroupRoleToMemberMutation, { data, loading, error }] = useAssignGroupRoleToMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      roleId: // value for 'roleId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignGroupRoleToMemberMutation(baseOptions?: Apollo.MutationHookOptions<AssignGroupRoleToMemberMutation, AssignGroupRoleToMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignGroupRoleToMemberMutation, AssignGroupRoleToMemberMutationVariables>(AssignGroupRoleToMemberDocument, options);
      }
export type AssignGroupRoleToMemberMutationHookResult = ReturnType<typeof useAssignGroupRoleToMemberMutation>;
export type AssignGroupRoleToMemberMutationResult = Apollo.MutationResult<AssignGroupRoleToMemberMutation>;
export type AssignGroupRoleToMemberMutationOptions = Apollo.BaseMutationOptions<AssignGroupRoleToMemberMutation, AssignGroupRoleToMemberMutationVariables>;
export const ChangeGroupAvatarDocument = gql`
    mutation ChangeGroupAvatar($avatar: Upload!, $groupId: String!) {
  changeGroupAvatar(avatar: $avatar, groupId: $groupId)
}
    `;
export type ChangeGroupAvatarMutationFn = Apollo.MutationFunction<ChangeGroupAvatarMutation, ChangeGroupAvatarMutationVariables>;

/**
 * __useChangeGroupAvatarMutation__
 *
 * To run a mutation, you first call `useChangeGroupAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeGroupAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeGroupAvatarMutation, { data, loading, error }] = useChangeGroupAvatarMutation({
 *   variables: {
 *      avatar: // value for 'avatar'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useChangeGroupAvatarMutation(baseOptions?: Apollo.MutationHookOptions<ChangeGroupAvatarMutation, ChangeGroupAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeGroupAvatarMutation, ChangeGroupAvatarMutationVariables>(ChangeGroupAvatarDocument, options);
      }
export type ChangeGroupAvatarMutationHookResult = ReturnType<typeof useChangeGroupAvatarMutation>;
export type ChangeGroupAvatarMutationResult = Apollo.MutationResult<ChangeGroupAvatarMutation>;
export type ChangeGroupAvatarMutationOptions = Apollo.BaseMutationOptions<ChangeGroupAvatarMutation, ChangeGroupAvatarMutationVariables>;
export const ChangeGroupInfoDocument = gql`
    mutation ChangeGroupInfo($data: ChangeGroupInfoInput!, $groupId: String!) {
  changeGroupInfo(data: $data, groupId: $groupId)
}
    `;
export type ChangeGroupInfoMutationFn = Apollo.MutationFunction<ChangeGroupInfoMutation, ChangeGroupInfoMutationVariables>;

/**
 * __useChangeGroupInfoMutation__
 *
 * To run a mutation, you first call `useChangeGroupInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeGroupInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeGroupInfoMutation, { data, loading, error }] = useChangeGroupInfoMutation({
 *   variables: {
 *      data: // value for 'data'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useChangeGroupInfoMutation(baseOptions?: Apollo.MutationHookOptions<ChangeGroupInfoMutation, ChangeGroupInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeGroupInfoMutation, ChangeGroupInfoMutationVariables>(ChangeGroupInfoDocument, options);
      }
export type ChangeGroupInfoMutationHookResult = ReturnType<typeof useChangeGroupInfoMutation>;
export type ChangeGroupInfoMutationResult = Apollo.MutationResult<ChangeGroupInfoMutation>;
export type ChangeGroupInfoMutationOptions = Apollo.BaseMutationOptions<ChangeGroupInfoMutation, ChangeGroupInfoMutationVariables>;
export const CreateGroupDocument = gql`
    mutation CreateGroup($data: CreateGroupInput!) {
  createGroup(data: $data) {
    id
    groupName
    avatarUrl
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const DeleteGroupDocument = gql`
    mutation DeleteGroup($groupId: String!) {
  deleteGroup(groupId: $groupId)
}
    `;
export type DeleteGroupMutationFn = Apollo.MutationFunction<DeleteGroupMutation, DeleteGroupMutationVariables>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useDeleteGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMutation, DeleteGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, options);
      }
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const DeleteGroupRoleDocument = gql`
    mutation DeleteGroupRole($groupId: String!, $roleId: String!) {
  deleteGroupRole(groupId: $groupId, roleId: $roleId)
}
    `;
export type DeleteGroupRoleMutationFn = Apollo.MutationFunction<DeleteGroupRoleMutation, DeleteGroupRoleMutationVariables>;

/**
 * __useDeleteGroupRoleMutation__
 *
 * To run a mutation, you first call `useDeleteGroupRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupRoleMutation, { data, loading, error }] = useDeleteGroupRoleMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useDeleteGroupRoleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupRoleMutation, DeleteGroupRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupRoleMutation, DeleteGroupRoleMutationVariables>(DeleteGroupRoleDocument, options);
      }
export type DeleteGroupRoleMutationHookResult = ReturnType<typeof useDeleteGroupRoleMutation>;
export type DeleteGroupRoleMutationResult = Apollo.MutationResult<DeleteGroupRoleMutation>;
export type DeleteGroupRoleMutationOptions = Apollo.BaseMutationOptions<DeleteGroupRoleMutation, DeleteGroupRoleMutationVariables>;
export const InviteMemberToGroupDocument = gql`
    mutation InviteMemberToGroup($groupId: String!, $targetUserId: String!) {
  inviteMemberToGroup(groupId: $groupId, targetUserId: $targetUserId)
}
    `;
export type InviteMemberToGroupMutationFn = Apollo.MutationFunction<InviteMemberToGroupMutation, InviteMemberToGroupMutationVariables>;

/**
 * __useInviteMemberToGroupMutation__
 *
 * To run a mutation, you first call `useInviteMemberToGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteMemberToGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteMemberToGroupMutation, { data, loading, error }] = useInviteMemberToGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      targetUserId: // value for 'targetUserId'
 *   },
 * });
 */
export function useInviteMemberToGroupMutation(baseOptions?: Apollo.MutationHookOptions<InviteMemberToGroupMutation, InviteMemberToGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InviteMemberToGroupMutation, InviteMemberToGroupMutationVariables>(InviteMemberToGroupDocument, options);
      }
export type InviteMemberToGroupMutationHookResult = ReturnType<typeof useInviteMemberToGroupMutation>;
export type InviteMemberToGroupMutationResult = Apollo.MutationResult<InviteMemberToGroupMutation>;
export type InviteMemberToGroupMutationOptions = Apollo.BaseMutationOptions<InviteMemberToGroupMutation, InviteMemberToGroupMutationVariables>;
export const RemoveGroupAvatarDocument = gql`
    mutation RemoveGroupAvatar($groupId: String!) {
  removeGroupAvatar(groupId: $groupId)
}
    `;
export type RemoveGroupAvatarMutationFn = Apollo.MutationFunction<RemoveGroupAvatarMutation, RemoveGroupAvatarMutationVariables>;

/**
 * __useRemoveGroupAvatarMutation__
 *
 * To run a mutation, you first call `useRemoveGroupAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveGroupAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeGroupAvatarMutation, { data, loading, error }] = useRemoveGroupAvatarMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useRemoveGroupAvatarMutation(baseOptions?: Apollo.MutationHookOptions<RemoveGroupAvatarMutation, RemoveGroupAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveGroupAvatarMutation, RemoveGroupAvatarMutationVariables>(RemoveGroupAvatarDocument, options);
      }
export type RemoveGroupAvatarMutationHookResult = ReturnType<typeof useRemoveGroupAvatarMutation>;
export type RemoveGroupAvatarMutationResult = Apollo.MutationResult<RemoveGroupAvatarMutation>;
export type RemoveGroupAvatarMutationOptions = Apollo.BaseMutationOptions<RemoveGroupAvatarMutation, RemoveGroupAvatarMutationVariables>;
export const RemoveGroupRoleFromMemberDocument = gql`
    mutation RemoveGroupRoleFromMember($groupId: String!, $roleId: String!, $memberId: String!) {
  removeGroupRoleFromMember(
    groupId: $groupId
    roleId: $roleId
    memberId: $memberId
  )
}
    `;
export type RemoveGroupRoleFromMemberMutationFn = Apollo.MutationFunction<RemoveGroupRoleFromMemberMutation, RemoveGroupRoleFromMemberMutationVariables>;

/**
 * __useRemoveGroupRoleFromMemberMutation__
 *
 * To run a mutation, you first call `useRemoveGroupRoleFromMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveGroupRoleFromMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeGroupRoleFromMemberMutation, { data, loading, error }] = useRemoveGroupRoleFromMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      roleId: // value for 'roleId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveGroupRoleFromMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveGroupRoleFromMemberMutation, RemoveGroupRoleFromMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveGroupRoleFromMemberMutation, RemoveGroupRoleFromMemberMutationVariables>(RemoveGroupRoleFromMemberDocument, options);
      }
export type RemoveGroupRoleFromMemberMutationHookResult = ReturnType<typeof useRemoveGroupRoleFromMemberMutation>;
export type RemoveGroupRoleFromMemberMutationResult = Apollo.MutationResult<RemoveGroupRoleFromMemberMutation>;
export type RemoveGroupRoleFromMemberMutationOptions = Apollo.BaseMutationOptions<RemoveGroupRoleFromMemberMutation, RemoveGroupRoleFromMemberMutationVariables>;
export const RemoveMemberFromGroupDocument = gql`
    mutation RemoveMemberFromGroup($groupId: String!, $targetUserId: String!) {
  removeMemberFromGroup(groupId: $groupId, targetUserId: $targetUserId)
}
    `;
export type RemoveMemberFromGroupMutationFn = Apollo.MutationFunction<RemoveMemberFromGroupMutation, RemoveMemberFromGroupMutationVariables>;

/**
 * __useRemoveMemberFromGroupMutation__
 *
 * To run a mutation, you first call `useRemoveMemberFromGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberFromGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberFromGroupMutation, { data, loading, error }] = useRemoveMemberFromGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      targetUserId: // value for 'targetUserId'
 *   },
 * });
 */
export function useRemoveMemberFromGroupMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberFromGroupMutation, RemoveMemberFromGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberFromGroupMutation, RemoveMemberFromGroupMutationVariables>(RemoveMemberFromGroupDocument, options);
      }
export type RemoveMemberFromGroupMutationHookResult = ReturnType<typeof useRemoveMemberFromGroupMutation>;
export type RemoveMemberFromGroupMutationResult = Apollo.MutationResult<RemoveMemberFromGroupMutation>;
export type RemoveMemberFromGroupMutationOptions = Apollo.BaseMutationOptions<RemoveMemberFromGroupMutation, RemoveMemberFromGroupMutationVariables>;
export const UpsertGroupRoleDocument = gql`
    mutation UpsertGroupRole($groupId: String!, $data: UpsertGroupRoleInput!) {
  upsertGroupRole(groupId: $groupId, data: $data)
}
    `;
export type UpsertGroupRoleMutationFn = Apollo.MutationFunction<UpsertGroupRoleMutation, UpsertGroupRoleMutationVariables>;

/**
 * __useUpsertGroupRoleMutation__
 *
 * To run a mutation, you first call `useUpsertGroupRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGroupRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGroupRoleMutation, { data, loading, error }] = useUpsertGroupRoleMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpsertGroupRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGroupRoleMutation, UpsertGroupRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGroupRoleMutation, UpsertGroupRoleMutationVariables>(UpsertGroupRoleDocument, options);
      }
export type UpsertGroupRoleMutationHookResult = ReturnType<typeof useUpsertGroupRoleMutation>;
export type UpsertGroupRoleMutationResult = Apollo.MutationResult<UpsertGroupRoleMutation>;
export type UpsertGroupRoleMutationOptions = Apollo.BaseMutationOptions<UpsertGroupRoleMutation, UpsertGroupRoleMutationVariables>;
export const AckSecretMessagesDocument = gql`
    mutation AckSecretMessages($chatId: String!, $messageIds: [String!]!) {
  ackSecretMessages(chatId: $chatId, messageIds: $messageIds)
}
    `;
export type AckSecretMessagesMutationFn = Apollo.MutationFunction<AckSecretMessagesMutation, AckSecretMessagesMutationVariables>;

/**
 * __useAckSecretMessagesMutation__
 *
 * To run a mutation, you first call `useAckSecretMessagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAckSecretMessagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [ackSecretMessagesMutation, { data, loading, error }] = useAckSecretMessagesMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      messageIds: // value for 'messageIds'
 *   },
 * });
 */
export function useAckSecretMessagesMutation(baseOptions?: Apollo.MutationHookOptions<AckSecretMessagesMutation, AckSecretMessagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AckSecretMessagesMutation, AckSecretMessagesMutationVariables>(AckSecretMessagesDocument, options);
      }
export type AckSecretMessagesMutationHookResult = ReturnType<typeof useAckSecretMessagesMutation>;
export type AckSecretMessagesMutationResult = Apollo.MutationResult<AckSecretMessagesMutation>;
export type AckSecretMessagesMutationOptions = Apollo.BaseMutationOptions<AckSecretMessagesMutation, AckSecretMessagesMutationVariables>;
export const AckSharedSecretKeysDocument = gql`
    mutation AckSharedSecretKeys($chatId: String!, $sharedKeyIds: [String!]!) {
  ackSharedSecretKeys(chatId: $chatId, sharedKeyIds: $sharedKeyIds)
}
    `;
export type AckSharedSecretKeysMutationFn = Apollo.MutationFunction<AckSharedSecretKeysMutation, AckSharedSecretKeysMutationVariables>;

/**
 * __useAckSharedSecretKeysMutation__
 *
 * To run a mutation, you first call `useAckSharedSecretKeysMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAckSharedSecretKeysMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [ackSharedSecretKeysMutation, { data, loading, error }] = useAckSharedSecretKeysMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      sharedKeyIds: // value for 'sharedKeyIds'
 *   },
 * });
 */
export function useAckSharedSecretKeysMutation(baseOptions?: Apollo.MutationHookOptions<AckSharedSecretKeysMutation, AckSharedSecretKeysMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AckSharedSecretKeysMutation, AckSharedSecretKeysMutationVariables>(AckSharedSecretKeysDocument, options);
      }
export type AckSharedSecretKeysMutationHookResult = ReturnType<typeof useAckSharedSecretKeysMutation>;
export type AckSharedSecretKeysMutationResult = Apollo.MutationResult<AckSharedSecretKeysMutation>;
export type AckSharedSecretKeysMutationOptions = Apollo.BaseMutationOptions<AckSharedSecretKeysMutation, AckSharedSecretKeysMutationVariables>;
export const DiscardSecretAttachmentDocument = gql`
    mutation DiscardSecretAttachment($chatId: String!, $attachmentId: String!) {
  discardSecretAttachment(chatId: $chatId, attachmentId: $attachmentId)
}
    `;
export type DiscardSecretAttachmentMutationFn = Apollo.MutationFunction<DiscardSecretAttachmentMutation, DiscardSecretAttachmentMutationVariables>;

/**
 * __useDiscardSecretAttachmentMutation__
 *
 * To run a mutation, you first call `useDiscardSecretAttachmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDiscardSecretAttachmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [discardSecretAttachmentMutation, { data, loading, error }] = useDiscardSecretAttachmentMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      attachmentId: // value for 'attachmentId'
 *   },
 * });
 */
export function useDiscardSecretAttachmentMutation(baseOptions?: Apollo.MutationHookOptions<DiscardSecretAttachmentMutation, DiscardSecretAttachmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DiscardSecretAttachmentMutation, DiscardSecretAttachmentMutationVariables>(DiscardSecretAttachmentDocument, options);
      }
export type DiscardSecretAttachmentMutationHookResult = ReturnType<typeof useDiscardSecretAttachmentMutation>;
export type DiscardSecretAttachmentMutationResult = Apollo.MutationResult<DiscardSecretAttachmentMutation>;
export type DiscardSecretAttachmentMutationOptions = Apollo.BaseMutationOptions<DiscardSecretAttachmentMutation, DiscardSecretAttachmentMutationVariables>;
export const DownloadSecretAttachmentDocument = gql`
    mutation DownloadSecretAttachment($chatId: String!, $attachmentId: String!) {
  downloadSecretAttachment(chatId: $chatId, attachmentId: $attachmentId) {
    attachmentId
    chatId
    ciphertextBase64
    ciphertextSize
  }
}
    `;
export type DownloadSecretAttachmentMutationFn = Apollo.MutationFunction<DownloadSecretAttachmentMutation, DownloadSecretAttachmentMutationVariables>;

/**
 * __useDownloadSecretAttachmentMutation__
 *
 * To run a mutation, you first call `useDownloadSecretAttachmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadSecretAttachmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadSecretAttachmentMutation, { data, loading, error }] = useDownloadSecretAttachmentMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      attachmentId: // value for 'attachmentId'
 *   },
 * });
 */
export function useDownloadSecretAttachmentMutation(baseOptions?: Apollo.MutationHookOptions<DownloadSecretAttachmentMutation, DownloadSecretAttachmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadSecretAttachmentMutation, DownloadSecretAttachmentMutationVariables>(DownloadSecretAttachmentDocument, options);
      }
export type DownloadSecretAttachmentMutationHookResult = ReturnType<typeof useDownloadSecretAttachmentMutation>;
export type DownloadSecretAttachmentMutationResult = Apollo.MutationResult<DownloadSecretAttachmentMutation>;
export type DownloadSecretAttachmentMutationOptions = Apollo.BaseMutationOptions<DownloadSecretAttachmentMutation, DownloadSecretAttachmentMutationVariables>;
export const SendPreKeyDocument = gql`
    mutation SendPreKey($data: PreKeyInput!) {
  sendPreKey(data: $data)
}
    `;
export type SendPreKeyMutationFn = Apollo.MutationFunction<SendPreKeyMutation, SendPreKeyMutationVariables>;

/**
 * __useSendPreKeyMutation__
 *
 * To run a mutation, you first call `useSendPreKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendPreKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendPreKeyMutation, { data, loading, error }] = useSendPreKeyMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendPreKeyMutation(baseOptions?: Apollo.MutationHookOptions<SendPreKeyMutation, SendPreKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendPreKeyMutation, SendPreKeyMutationVariables>(SendPreKeyDocument, options);
      }
export type SendPreKeyMutationHookResult = ReturnType<typeof useSendPreKeyMutation>;
export type SendPreKeyMutationResult = Apollo.MutationResult<SendPreKeyMutation>;
export type SendPreKeyMutationOptions = Apollo.BaseMutationOptions<SendPreKeyMutation, SendPreKeyMutationVariables>;
export const SendSecretMessageDocument = gql`
    mutation SendSecretMessage($data: SendSecretMessageInput!) {
  sendSecretMessage(data: $data) {
    id
  }
}
    `;
export type SendSecretMessageMutationFn = Apollo.MutationFunction<SendSecretMessageMutation, SendSecretMessageMutationVariables>;

/**
 * __useSendSecretMessageMutation__
 *
 * To run a mutation, you first call `useSendSecretMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendSecretMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendSecretMessageMutation, { data, loading, error }] = useSendSecretMessageMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendSecretMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendSecretMessageMutation, SendSecretMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendSecretMessageMutation, SendSecretMessageMutationVariables>(SendSecretMessageDocument, options);
      }
export type SendSecretMessageMutationHookResult = ReturnType<typeof useSendSecretMessageMutation>;
export type SendSecretMessageMutationResult = Apollo.MutationResult<SendSecretMessageMutation>;
export type SendSecretMessageMutationOptions = Apollo.BaseMutationOptions<SendSecretMessageMutation, SendSecretMessageMutationVariables>;
export const SendSharedSecretKeyDocument = gql`
    mutation SendSharedSecretKey($data: SharedSecretKeyInput!) {
  sendSharedSecretKey(data: $data) {
    id
  }
}
    `;
export type SendSharedSecretKeyMutationFn = Apollo.MutationFunction<SendSharedSecretKeyMutation, SendSharedSecretKeyMutationVariables>;

/**
 * __useSendSharedSecretKeyMutation__
 *
 * To run a mutation, you first call `useSendSharedSecretKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendSharedSecretKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendSharedSecretKeyMutation, { data, loading, error }] = useSendSharedSecretKeyMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendSharedSecretKeyMutation(baseOptions?: Apollo.MutationHookOptions<SendSharedSecretKeyMutation, SendSharedSecretKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendSharedSecretKeyMutation, SendSharedSecretKeyMutationVariables>(SendSharedSecretKeyDocument, options);
      }
export type SendSharedSecretKeyMutationHookResult = ReturnType<typeof useSendSharedSecretKeyMutation>;
export type SendSharedSecretKeyMutationResult = Apollo.MutationResult<SendSharedSecretKeyMutation>;
export type SendSharedSecretKeyMutationOptions = Apollo.BaseMutationOptions<SendSharedSecretKeyMutation, SendSharedSecretKeyMutationVariables>;
export const UploadSecretAttachmentDocument = gql`
    mutation UploadSecretAttachment($data: UploadSecretAttachmentInput!) {
  uploadSecretAttachment(data: $data) {
    id
    chatId
    ciphertextSize
    committedAt
    expiresAt
    createdAt
    updatedAt
  }
}
    `;
export type UploadSecretAttachmentMutationFn = Apollo.MutationFunction<UploadSecretAttachmentMutation, UploadSecretAttachmentMutationVariables>;

/**
 * __useUploadSecretAttachmentMutation__
 *
 * To run a mutation, you first call `useUploadSecretAttachmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadSecretAttachmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadSecretAttachmentMutation, { data, loading, error }] = useUploadSecretAttachmentMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUploadSecretAttachmentMutation(baseOptions?: Apollo.MutationHookOptions<UploadSecretAttachmentMutation, UploadSecretAttachmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadSecretAttachmentMutation, UploadSecretAttachmentMutationVariables>(UploadSecretAttachmentDocument, options);
      }
export type UploadSecretAttachmentMutationHookResult = ReturnType<typeof useUploadSecretAttachmentMutation>;
export type UploadSecretAttachmentMutationResult = Apollo.MutationResult<UploadSecretAttachmentMutation>;
export type UploadSecretAttachmentMutationOptions = Apollo.BaseMutationOptions<UploadSecretAttachmentMutation, UploadSecretAttachmentMutationVariables>;
export const ChangeProfileAvatarDocument = gql`
    mutation ChangeProfileAvatar($avatar: Upload!) {
  changeProfileAvatar(avatar: $avatar)
}
    `;
export type ChangeProfileAvatarMutationFn = Apollo.MutationFunction<ChangeProfileAvatarMutation, ChangeProfileAvatarMutationVariables>;

/**
 * __useChangeProfileAvatarMutation__
 *
 * To run a mutation, you first call `useChangeProfileAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeProfileAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeProfileAvatarMutation, { data, loading, error }] = useChangeProfileAvatarMutation({
 *   variables: {
 *      avatar: // value for 'avatar'
 *   },
 * });
 */
export function useChangeProfileAvatarMutation(baseOptions?: Apollo.MutationHookOptions<ChangeProfileAvatarMutation, ChangeProfileAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeProfileAvatarMutation, ChangeProfileAvatarMutationVariables>(ChangeProfileAvatarDocument, options);
      }
export type ChangeProfileAvatarMutationHookResult = ReturnType<typeof useChangeProfileAvatarMutation>;
export type ChangeProfileAvatarMutationResult = Apollo.MutationResult<ChangeProfileAvatarMutation>;
export type ChangeProfileAvatarMutationOptions = Apollo.BaseMutationOptions<ChangeProfileAvatarMutation, ChangeProfileAvatarMutationVariables>;
export const ChangeProfileInfoDocument = gql`
    mutation ChangeProfileInfo($data: ChangeProfileInfoInput!) {
  changeProfileInfo(data: $data)
}
    `;
export type ChangeProfileInfoMutationFn = Apollo.MutationFunction<ChangeProfileInfoMutation, ChangeProfileInfoMutationVariables>;

/**
 * __useChangeProfileInfoMutation__
 *
 * To run a mutation, you first call `useChangeProfileInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeProfileInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeProfileInfoMutation, { data, loading, error }] = useChangeProfileInfoMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useChangeProfileInfoMutation(baseOptions?: Apollo.MutationHookOptions<ChangeProfileInfoMutation, ChangeProfileInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeProfileInfoMutation, ChangeProfileInfoMutationVariables>(ChangeProfileInfoDocument, options);
      }
export type ChangeProfileInfoMutationHookResult = ReturnType<typeof useChangeProfileInfoMutation>;
export type ChangeProfileInfoMutationResult = Apollo.MutationResult<ChangeProfileInfoMutation>;
export type ChangeProfileInfoMutationOptions = Apollo.BaseMutationOptions<ChangeProfileInfoMutation, ChangeProfileInfoMutationVariables>;
export const RemoveProfileAvatarDocument = gql`
    mutation RemoveProfileAvatar {
  removeProfileAvatar
}
    `;
export type RemoveProfileAvatarMutationFn = Apollo.MutationFunction<RemoveProfileAvatarMutation, RemoveProfileAvatarMutationVariables>;

/**
 * __useRemoveProfileAvatarMutation__
 *
 * To run a mutation, you first call `useRemoveProfileAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveProfileAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeProfileAvatarMutation, { data, loading, error }] = useRemoveProfileAvatarMutation({
 *   variables: {
 *   },
 * });
 */
export function useRemoveProfileAvatarMutation(baseOptions?: Apollo.MutationHookOptions<RemoveProfileAvatarMutation, RemoveProfileAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveProfileAvatarMutation, RemoveProfileAvatarMutationVariables>(RemoveProfileAvatarDocument, options);
      }
export type RemoveProfileAvatarMutationHookResult = ReturnType<typeof useRemoveProfileAvatarMutation>;
export type RemoveProfileAvatarMutationResult = Apollo.MutationResult<RemoveProfileAvatarMutation>;
export type RemoveProfileAvatarMutationOptions = Apollo.BaseMutationOptions<RemoveProfileAvatarMutation, RemoveProfileAvatarMutationVariables>;
export const CheckChatAccessDocument = gql`
    query CheckChatAccess($chatId: String!) {
  checkChatAccess(chatId: $chatId)
}
    `;

/**
 * __useCheckChatAccessQuery__
 *
 * To run a query within a React component, call `useCheckChatAccessQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckChatAccessQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckChatAccessQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useCheckChatAccessQuery(baseOptions: Apollo.QueryHookOptions<CheckChatAccessQuery, CheckChatAccessQueryVariables> & ({ variables: CheckChatAccessQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckChatAccessQuery, CheckChatAccessQueryVariables>(CheckChatAccessDocument, options);
      }
export function useCheckChatAccessLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckChatAccessQuery, CheckChatAccessQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckChatAccessQuery, CheckChatAccessQueryVariables>(CheckChatAccessDocument, options);
        }
export function useCheckChatAccessSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckChatAccessQuery, CheckChatAccessQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckChatAccessQuery, CheckChatAccessQueryVariables>(CheckChatAccessDocument, options);
        }
export type CheckChatAccessQueryHookResult = ReturnType<typeof useCheckChatAccessQuery>;
export type CheckChatAccessLazyQueryHookResult = ReturnType<typeof useCheckChatAccessLazyQuery>;
export type CheckChatAccessSuspenseQueryHookResult = ReturnType<typeof useCheckChatAccessSuspenseQuery>;
export type CheckChatAccessQueryResult = Apollo.QueryResult<CheckChatAccessQuery, CheckChatAccessQueryVariables>;
export const FindAllChatsByGroupDocument = gql`
    query FindAllChatsByGroup($filters: FiltersInput!, $groupId: String!) {
  findAllChatsByGroup(filters: $filters, groupId: $groupId) {
    chatName
    avatarUrl
    updatedAt
    isSecret
    requireTotp
    id
    isGroup
    groupId
    isPinned
    pinnedOrder
    members {
      id
      user {
        id
        username
        avatarUrl
      }
    }
    lastMessage {
      text
      user {
        username
      }
      files {
        fileName
      }
    }
    draftMessages {
      text
      files {
        fileName
      }
    }
    lastMessageAt
  }
}
    `;

/**
 * __useFindAllChatsByGroupQuery__
 *
 * To run a query within a React component, call `useFindAllChatsByGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllChatsByGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllChatsByGroupQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useFindAllChatsByGroupQuery(baseOptions: Apollo.QueryHookOptions<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables> & ({ variables: FindAllChatsByGroupQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>(FindAllChatsByGroupDocument, options);
      }
export function useFindAllChatsByGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>(FindAllChatsByGroupDocument, options);
        }
export function useFindAllChatsByGroupSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>(FindAllChatsByGroupDocument, options);
        }
export type FindAllChatsByGroupQueryHookResult = ReturnType<typeof useFindAllChatsByGroupQuery>;
export type FindAllChatsByGroupLazyQueryHookResult = ReturnType<typeof useFindAllChatsByGroupLazyQuery>;
export type FindAllChatsByGroupSuspenseQueryHookResult = ReturnType<typeof useFindAllChatsByGroupSuspenseQuery>;
export type FindAllChatsByGroupQueryResult = Apollo.QueryResult<FindAllChatsByGroupQuery, FindAllChatsByGroupQueryVariables>;
export const FindAllChatsByUserDocument = gql`
    query FindAllChatsByUser($filters: FiltersInput!) {
  findAllChatsByUser(filters: $filters) {
    chatName
    avatarUrl
    updatedAt
    isSecret
    id
    isGroup
    groupId
    isPinned
    pinnedOrder
    members {
      id
      user {
        id
        username
        avatarUrl
      }
    }
    lastMessage {
      text
      user {
        username
      }
      files {
        fileName
      }
    }
    draftMessages {
      text
      files {
        fileName
      }
    }
    lastMessageAt
  }
}
    `;

/**
 * __useFindAllChatsByUserQuery__
 *
 * To run a query within a React component, call `useFindAllChatsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllChatsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllChatsByUserQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllChatsByUserQuery(baseOptions: Apollo.QueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables> & ({ variables: FindAllChatsByUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
      }
export function useFindAllChatsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
        }
export function useFindAllChatsByUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
        }
export type FindAllChatsByUserQueryHookResult = ReturnType<typeof useFindAllChatsByUserQuery>;
export type FindAllChatsByUserLazyQueryHookResult = ReturnType<typeof useFindAllChatsByUserLazyQuery>;
export type FindAllChatsByUserSuspenseQueryHookResult = ReturnType<typeof useFindAllChatsByUserSuspenseQuery>;
export type FindAllChatsByUserQueryResult = Apollo.QueryResult<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>;
export const FindAllMessagesByChatDocument = gql`
    query FindAllMessagesByChat($chatId: String!, $filters: FiltersInput!) {
  findAllMessagesByChat(chatId: $chatId, filters: $filters) {
    id
    isEdited
    isStarted
    text
    createdAt
    files {
      fileName
      fileFormat
      fileSize
      id
    }
    repliedToLinks {
      id
      repliedTo {
        id
        text
        files {
          fileName
          fileFormat
          fileSize
          id
        }
        user {
          avatarUrl
          username
          id
        }
      }
    }
    chat {
      chatName
    }
    user {
      avatarUrl
      id
      username
    }
  }
}
    `;

/**
 * __useFindAllMessagesByChatQuery__
 *
 * To run a query within a React component, call `useFindAllMessagesByChatQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllMessagesByChatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllMessagesByChatQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllMessagesByChatQuery(baseOptions: Apollo.QueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables> & ({ variables: FindAllMessagesByChatQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
      }
export function useFindAllMessagesByChatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
        }
export function useFindAllMessagesByChatSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
        }
export type FindAllMessagesByChatQueryHookResult = ReturnType<typeof useFindAllMessagesByChatQuery>;
export type FindAllMessagesByChatLazyQueryHookResult = ReturnType<typeof useFindAllMessagesByChatLazyQuery>;
export type FindAllMessagesByChatSuspenseQueryHookResult = ReturnType<typeof useFindAllMessagesByChatSuspenseQuery>;
export type FindAllMessagesByChatQueryResult = Apollo.QueryResult<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>;
export const FindChatByChatIdDocument = gql`
    query FindChatByChatId($chatId: String!) {
  findChatByChatId(chatId: $chatId) {
    id
    chatName
    avatarUrl
    updatedAt
    isSecret
    requireTotp
    isGroup
    groupId
    description
    pinnedMessage {
      id
      text
      createdAt
      isEdited
      files {
        fileName
        fileFormat
        fileSize
        id
      }
      user {
        id
        username
      }
      id
      repliedToLinks {
        id
        repliedTo {
          id
          text
          files {
            fileName
            fileFormat
            fileSize
            id
          }
          user {
            username
            id
          }
        }
      }
    }
    draftMessages {
      editId
      id
      text
      files {
        fileName
        fileFormat
        fileSize
        id
      }
      repliedToLinks {
        id
        repliedTo {
          id
          text
          files {
            fileName
            fileFormat
            fileSize
            id
          }
          user {
            username
            id
          }
        }
      }
    }
    members {
      id
      isCreator
      user {
        id
        username
        avatarUrl
      }
      roles {
        id
        name
        color
        permissions
      }
    }
  }
}
    `;

/**
 * __useFindChatByChatIdQuery__
 *
 * To run a query within a React component, call `useFindChatByChatIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindChatByChatIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindChatByChatIdQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useFindChatByChatIdQuery(baseOptions: Apollo.QueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables> & ({ variables: FindChatByChatIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
      }
export function useFindChatByChatIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
        }
export function useFindChatByChatIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
        }
export type FindChatByChatIdQueryHookResult = ReturnType<typeof useFindChatByChatIdQuery>;
export type FindChatByChatIdLazyQueryHookResult = ReturnType<typeof useFindChatByChatIdLazyQuery>;
export type FindChatByChatIdSuspenseQueryHookResult = ReturnType<typeof useFindChatByChatIdSuspenseQuery>;
export type FindChatByChatIdQueryResult = Apollo.QueryResult<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>;
export const GetChatRolesDocument = gql`
    query GetChatRoles($chatId: String!) {
  getChatRoles(chatId: $chatId) {
    id
    name
    color
    chatId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetChatRolesQuery__
 *
 * To run a query within a React component, call `useGetChatRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatRolesQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetChatRolesQuery(baseOptions: Apollo.QueryHookOptions<GetChatRolesQuery, GetChatRolesQueryVariables> & ({ variables: GetChatRolesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatRolesQuery, GetChatRolesQueryVariables>(GetChatRolesDocument, options);
      }
export function useGetChatRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatRolesQuery, GetChatRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatRolesQuery, GetChatRolesQueryVariables>(GetChatRolesDocument, options);
        }
export function useGetChatRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChatRolesQuery, GetChatRolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChatRolesQuery, GetChatRolesQueryVariables>(GetChatRolesDocument, options);
        }
export type GetChatRolesQueryHookResult = ReturnType<typeof useGetChatRolesQuery>;
export type GetChatRolesLazyQueryHookResult = ReturnType<typeof useGetChatRolesLazyQuery>;
export type GetChatRolesSuspenseQueryHookResult = ReturnType<typeof useGetChatRolesSuspenseQuery>;
export type GetChatRolesQueryResult = Apollo.QueryResult<GetChatRolesQuery, GetChatRolesQueryVariables>;
export const GetMemberChatRoleDocument = gql`
    query GetMemberChatRole($chatId: String!) {
  getMemberChatRole(chatId: $chatId) {
    id
    name
    color
    chatId
    isCreator
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetMemberChatRoleQuery__
 *
 * To run a query within a React component, call `useGetMemberChatRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMemberChatRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMemberChatRoleQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetMemberChatRoleQuery(baseOptions: Apollo.QueryHookOptions<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables> & ({ variables: GetMemberChatRoleQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>(GetMemberChatRoleDocument, options);
      }
export function useGetMemberChatRoleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>(GetMemberChatRoleDocument, options);
        }
export function useGetMemberChatRoleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>(GetMemberChatRoleDocument, options);
        }
export type GetMemberChatRoleQueryHookResult = ReturnType<typeof useGetMemberChatRoleQuery>;
export type GetMemberChatRoleLazyQueryHookResult = ReturnType<typeof useGetMemberChatRoleLazyQuery>;
export type GetMemberChatRoleSuspenseQueryHookResult = ReturnType<typeof useGetMemberChatRoleSuspenseQuery>;
export type GetMemberChatRoleQueryResult = Apollo.QueryResult<GetMemberChatRoleQuery, GetMemberChatRoleQueryVariables>;
export const GetBlockedUsersDocument = gql`
    query GetBlockedUsers {
  getBlockedUsers {
    id
    userId
    friendId
    status
    friend {
      id
      username
      avatarUrl
    }
    createdAt
  }
}
    `;

/**
 * __useGetBlockedUsersQuery__
 *
 * To run a query within a React component, call `useGetBlockedUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockedUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockedUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBlockedUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>(GetBlockedUsersDocument, options);
      }
export function useGetBlockedUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>(GetBlockedUsersDocument, options);
        }
export function useGetBlockedUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>(GetBlockedUsersDocument, options);
        }
export type GetBlockedUsersQueryHookResult = ReturnType<typeof useGetBlockedUsersQuery>;
export type GetBlockedUsersLazyQueryHookResult = ReturnType<typeof useGetBlockedUsersLazyQuery>;
export type GetBlockedUsersSuspenseQueryHookResult = ReturnType<typeof useGetBlockedUsersSuspenseQuery>;
export type GetBlockedUsersQueryResult = Apollo.QueryResult<GetBlockedUsersQuery, GetBlockedUsersQueryVariables>;
export const GetFriendsDocument = gql`
    query GetFriends {
  getFriends {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
      bio
    }
    friend {
      id
      username
      avatarUrl
      bio
    }
    createdAt
  }
}
    `;

/**
 * __useGetFriendsQuery__
 *
 * To run a query within a React component, call `useGetFriendsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFriendsQuery(baseOptions?: Apollo.QueryHookOptions<GetFriendsQuery, GetFriendsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, options);
      }
export function useGetFriendsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFriendsQuery, GetFriendsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, options);
        }
export function useGetFriendsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFriendsQuery, GetFriendsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, options);
        }
export type GetFriendsQueryHookResult = ReturnType<typeof useGetFriendsQuery>;
export type GetFriendsLazyQueryHookResult = ReturnType<typeof useGetFriendsLazyQuery>;
export type GetFriendsSuspenseQueryHookResult = ReturnType<typeof useGetFriendsSuspenseQuery>;
export type GetFriendsQueryResult = Apollo.QueryResult<GetFriendsQuery, GetFriendsQueryVariables>;
export const GetIncomingFriendRequestsDocument = gql`
    query GetIncomingFriendRequests {
  getIncomingFriendRequests {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    createdAt
  }
}
    `;

/**
 * __useGetIncomingFriendRequestsQuery__
 *
 * To run a query within a React component, call `useGetIncomingFriendRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIncomingFriendRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIncomingFriendRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetIncomingFriendRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>(GetIncomingFriendRequestsDocument, options);
      }
export function useGetIncomingFriendRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>(GetIncomingFriendRequestsDocument, options);
        }
export function useGetIncomingFriendRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>(GetIncomingFriendRequestsDocument, options);
        }
export type GetIncomingFriendRequestsQueryHookResult = ReturnType<typeof useGetIncomingFriendRequestsQuery>;
export type GetIncomingFriendRequestsLazyQueryHookResult = ReturnType<typeof useGetIncomingFriendRequestsLazyQuery>;
export type GetIncomingFriendRequestsSuspenseQueryHookResult = ReturnType<typeof useGetIncomingFriendRequestsSuspenseQuery>;
export type GetIncomingFriendRequestsQueryResult = Apollo.QueryResult<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>;
export const GetOutgoingFriendRequestsDocument = gql`
    query GetOutgoingFriendRequests {
  getOutgoingFriendRequests {
    id
    userId
    friendId
    status
    friend {
      id
      username
      avatarUrl
    }
    createdAt
  }
}
    `;

/**
 * __useGetOutgoingFriendRequestsQuery__
 *
 * To run a query within a React component, call `useGetOutgoingFriendRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOutgoingFriendRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOutgoingFriendRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOutgoingFriendRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>(GetOutgoingFriendRequestsDocument, options);
      }
export function useGetOutgoingFriendRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>(GetOutgoingFriendRequestsDocument, options);
        }
export function useGetOutgoingFriendRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>(GetOutgoingFriendRequestsDocument, options);
        }
export type GetOutgoingFriendRequestsQueryHookResult = ReturnType<typeof useGetOutgoingFriendRequestsQuery>;
export type GetOutgoingFriendRequestsLazyQueryHookResult = ReturnType<typeof useGetOutgoingFriendRequestsLazyQuery>;
export type GetOutgoingFriendRequestsSuspenseQueryHookResult = ReturnType<typeof useGetOutgoingFriendRequestsSuspenseQuery>;
export type GetOutgoingFriendRequestsQueryResult = Apollo.QueryResult<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>;
export const FindAllGroupsByUserDocument = gql`
    query FindAllGroupsByUser($filters: FiltersInput!) {
  findAllGroupsByUser(filters: $filters) {
    id
    groupName
    avatarUrl
  }
}
    `;

/**
 * __useFindAllGroupsByUserQuery__
 *
 * To run a query within a React component, call `useFindAllGroupsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllGroupsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllGroupsByUserQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllGroupsByUserQuery(baseOptions: Apollo.QueryHookOptions<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables> & ({ variables: FindAllGroupsByUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>(FindAllGroupsByUserDocument, options);
      }
export function useFindAllGroupsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>(FindAllGroupsByUserDocument, options);
        }
export function useFindAllGroupsByUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>(FindAllGroupsByUserDocument, options);
        }
export type FindAllGroupsByUserQueryHookResult = ReturnType<typeof useFindAllGroupsByUserQuery>;
export type FindAllGroupsByUserLazyQueryHookResult = ReturnType<typeof useFindAllGroupsByUserLazyQuery>;
export type FindAllGroupsByUserSuspenseQueryHookResult = ReturnType<typeof useFindAllGroupsByUserSuspenseQuery>;
export type FindAllGroupsByUserQueryResult = Apollo.QueryResult<FindAllGroupsByUserQuery, FindAllGroupsByUserQueryVariables>;
export const FindGroupByGroupIdDocument = gql`
    query FindGroupByGroupId($groupId: String!) {
  findGroupByGroupId(groupId: $groupId) {
    id
    groupName
    avatarUrl
    description
    members {
      isCreator
      user {
        id
        username
        avatarUrl
      }
      roles {
        id
        name
        color
        permissions
      }
    }
  }
}
    `;

/**
 * __useFindGroupByGroupIdQuery__
 *
 * To run a query within a React component, call `useFindGroupByGroupIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGroupByGroupIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGroupByGroupIdQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useFindGroupByGroupIdQuery(baseOptions: Apollo.QueryHookOptions<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables> & ({ variables: FindGroupByGroupIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>(FindGroupByGroupIdDocument, options);
      }
export function useFindGroupByGroupIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>(FindGroupByGroupIdDocument, options);
        }
export function useFindGroupByGroupIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>(FindGroupByGroupIdDocument, options);
        }
export type FindGroupByGroupIdQueryHookResult = ReturnType<typeof useFindGroupByGroupIdQuery>;
export type FindGroupByGroupIdLazyQueryHookResult = ReturnType<typeof useFindGroupByGroupIdLazyQuery>;
export type FindGroupByGroupIdSuspenseQueryHookResult = ReturnType<typeof useFindGroupByGroupIdSuspenseQuery>;
export type FindGroupByGroupIdQueryResult = Apollo.QueryResult<FindGroupByGroupIdQuery, FindGroupByGroupIdQueryVariables>;
export const GetGroupRolesDocument = gql`
    query GetGroupRoles($groupId: String!) {
  getGroupRoles(groupId: $groupId) {
    id
    name
    color
    groupId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetGroupRolesQuery__
 *
 * To run a query within a React component, call `useGetGroupRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupRolesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetGroupRolesQuery(baseOptions: Apollo.QueryHookOptions<GetGroupRolesQuery, GetGroupRolesQueryVariables> & ({ variables: GetGroupRolesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupRolesQuery, GetGroupRolesQueryVariables>(GetGroupRolesDocument, options);
      }
export function useGetGroupRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupRolesQuery, GetGroupRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupRolesQuery, GetGroupRolesQueryVariables>(GetGroupRolesDocument, options);
        }
export function useGetGroupRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGroupRolesQuery, GetGroupRolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGroupRolesQuery, GetGroupRolesQueryVariables>(GetGroupRolesDocument, options);
        }
export type GetGroupRolesQueryHookResult = ReturnType<typeof useGetGroupRolesQuery>;
export type GetGroupRolesLazyQueryHookResult = ReturnType<typeof useGetGroupRolesLazyQuery>;
export type GetGroupRolesSuspenseQueryHookResult = ReturnType<typeof useGetGroupRolesSuspenseQuery>;
export type GetGroupRolesQueryResult = Apollo.QueryResult<GetGroupRolesQuery, GetGroupRolesQueryVariables>;
export const GetMemberRoleDocument = gql`
    query GetMemberRole($groupId: String!) {
  getMemberRole(groupId: $groupId) {
    id
    name
    permissions
    isCreator
  }
}
    `;

/**
 * __useGetMemberRoleQuery__
 *
 * To run a query within a React component, call `useGetMemberRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMemberRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMemberRoleQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetMemberRoleQuery(baseOptions: Apollo.QueryHookOptions<GetMemberRoleQuery, GetMemberRoleQueryVariables> & ({ variables: GetMemberRoleQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMemberRoleQuery, GetMemberRoleQueryVariables>(GetMemberRoleDocument, options);
      }
export function useGetMemberRoleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMemberRoleQuery, GetMemberRoleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMemberRoleQuery, GetMemberRoleQueryVariables>(GetMemberRoleDocument, options);
        }
export function useGetMemberRoleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMemberRoleQuery, GetMemberRoleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMemberRoleQuery, GetMemberRoleQueryVariables>(GetMemberRoleDocument, options);
        }
export type GetMemberRoleQueryHookResult = ReturnType<typeof useGetMemberRoleQuery>;
export type GetMemberRoleLazyQueryHookResult = ReturnType<typeof useGetMemberRoleLazyQuery>;
export type GetMemberRoleSuspenseQueryHookResult = ReturnType<typeof useGetMemberRoleSuspenseQuery>;
export type GetMemberRoleQueryResult = Apollo.QueryResult<GetMemberRoleQuery, GetMemberRoleQueryVariables>;
export const GetPreKeysDocument = gql`
    query GetPreKeys($chatId: String!) {
  getPreKeys(chatId: $chatId) {
    ikPub
    spkPub
    spkSig
    opkPubs
    indexOpkPub
    userId
  }
}
    `;

/**
 * __useGetPreKeysQuery__
 *
 * To run a query within a React component, call `useGetPreKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPreKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPreKeysQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetPreKeysQuery(baseOptions: Apollo.QueryHookOptions<GetPreKeysQuery, GetPreKeysQueryVariables> & ({ variables: GetPreKeysQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPreKeysQuery, GetPreKeysQueryVariables>(GetPreKeysDocument, options);
      }
export function useGetPreKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPreKeysQuery, GetPreKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPreKeysQuery, GetPreKeysQueryVariables>(GetPreKeysDocument, options);
        }
export function useGetPreKeysSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreKeysQuery, GetPreKeysQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPreKeysQuery, GetPreKeysQueryVariables>(GetPreKeysDocument, options);
        }
export type GetPreKeysQueryHookResult = ReturnType<typeof useGetPreKeysQuery>;
export type GetPreKeysLazyQueryHookResult = ReturnType<typeof useGetPreKeysLazyQuery>;
export type GetPreKeysSuspenseQueryHookResult = ReturnType<typeof useGetPreKeysSuspenseQuery>;
export type GetPreKeysQueryResult = Apollo.QueryResult<GetPreKeysQuery, GetPreKeysQueryVariables>;
export const GetSecretMessageDocument = gql`
    query GetSecretMessage($chatId: String!) {
  getSecretMessage(chatId: $chatId) {
    id
    chatId
    fromUserId
    ikPub
    usedOpk
    ukm
    ekPub
    iv
    encryptedMessage
    sig
  }
}
    `;

/**
 * __useGetSecretMessageQuery__
 *
 * To run a query within a React component, call `useGetSecretMessageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecretMessageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecretMessageQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetSecretMessageQuery(baseOptions: Apollo.QueryHookOptions<GetSecretMessageQuery, GetSecretMessageQueryVariables> & ({ variables: GetSecretMessageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecretMessageQuery, GetSecretMessageQueryVariables>(GetSecretMessageDocument, options);
      }
export function useGetSecretMessageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecretMessageQuery, GetSecretMessageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecretMessageQuery, GetSecretMessageQueryVariables>(GetSecretMessageDocument, options);
        }
export function useGetSecretMessageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecretMessageQuery, GetSecretMessageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecretMessageQuery, GetSecretMessageQueryVariables>(GetSecretMessageDocument, options);
        }
export type GetSecretMessageQueryHookResult = ReturnType<typeof useGetSecretMessageQuery>;
export type GetSecretMessageLazyQueryHookResult = ReturnType<typeof useGetSecretMessageLazyQuery>;
export type GetSecretMessageSuspenseQueryHookResult = ReturnType<typeof useGetSecretMessageSuspenseQuery>;
export type GetSecretMessageQueryResult = Apollo.QueryResult<GetSecretMessageQuery, GetSecretMessageQueryVariables>;
export const GetSecretMessagesDocument = gql`
    query GetSecretMessages($chatId: String!) {
  getSecretMessages(chatId: $chatId) {
    id
    groupId
    isKey
    chatId
    fromUserId
    toUserIds
    whoCheckedIds
    ukm
    iv
    encryptedMessage
    sig
    secretAttachmentIds
    ikPub
    ekPub
    usedOpk
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetSecretMessagesQuery__
 *
 * To run a query within a React component, call `useGetSecretMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecretMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecretMessagesQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetSecretMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetSecretMessagesQuery, GetSecretMessagesQueryVariables> & ({ variables: GetSecretMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>(GetSecretMessagesDocument, options);
      }
export function useGetSecretMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>(GetSecretMessagesDocument, options);
        }
export function useGetSecretMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>(GetSecretMessagesDocument, options);
        }
export type GetSecretMessagesQueryHookResult = ReturnType<typeof useGetSecretMessagesQuery>;
export type GetSecretMessagesLazyQueryHookResult = ReturnType<typeof useGetSecretMessagesLazyQuery>;
export type GetSecretMessagesSuspenseQueryHookResult = ReturnType<typeof useGetSecretMessagesSuspenseQuery>;
export type GetSecretMessagesQueryResult = Apollo.QueryResult<GetSecretMessagesQuery, GetSecretMessagesQueryVariables>;
export const GetSharedSecretKeyDocument = gql`
    query GetSharedSecretKey($chatId: String!) {
  getSharedSecretKey(chatId: $chatId) {
    id
    groupId
    createdAt
    updatedAt
    ikPub
    chatId
    fromUserId
    toUserId
    ekPub
    usedOpk
    ukm
    iv
    encryptedKey
    sig
  }
}
    `;

/**
 * __useGetSharedSecretKeyQuery__
 *
 * To run a query within a React component, call `useGetSharedSecretKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSharedSecretKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSharedSecretKeyQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useGetSharedSecretKeyQuery(baseOptions: Apollo.QueryHookOptions<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables> & ({ variables: GetSharedSecretKeyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>(GetSharedSecretKeyDocument, options);
      }
export function useGetSharedSecretKeyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>(GetSharedSecretKeyDocument, options);
        }
export function useGetSharedSecretKeySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>(GetSharedSecretKeyDocument, options);
        }
export type GetSharedSecretKeyQueryHookResult = ReturnType<typeof useGetSharedSecretKeyQuery>;
export type GetSharedSecretKeyLazyQueryHookResult = ReturnType<typeof useGetSharedSecretKeyLazyQuery>;
export type GetSharedSecretKeySuspenseQueryHookResult = ReturnType<typeof useGetSharedSecretKeySuspenseQuery>;
export type GetSharedSecretKeyQueryResult = Apollo.QueryResult<GetSharedSecretKeyQuery, GetSharedSecretKeyQueryVariables>;
export const HasSharedSecretKeyDocument = gql`
    query HasSharedSecretKey($chatId: String!) {
  hasSharedSecretKey(chatId: $chatId)
}
    `;

/**
 * __useHasSharedSecretKeyQuery__
 *
 * To run a query within a React component, call `useHasSharedSecretKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useHasSharedSecretKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHasSharedSecretKeyQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useHasSharedSecretKeyQuery(baseOptions: Apollo.QueryHookOptions<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables> & ({ variables: HasSharedSecretKeyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>(HasSharedSecretKeyDocument, options);
      }
export function useHasSharedSecretKeyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>(HasSharedSecretKeyDocument, options);
        }
export function useHasSharedSecretKeySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>(HasSharedSecretKeyDocument, options);
        }
export type HasSharedSecretKeyQueryHookResult = ReturnType<typeof useHasSharedSecretKeyQuery>;
export type HasSharedSecretKeyLazyQueryHookResult = ReturnType<typeof useHasSharedSecretKeyLazyQuery>;
export type HasSharedSecretKeySuspenseQueryHookResult = ReturnType<typeof useHasSharedSecretKeySuspenseQuery>;
export type HasSharedSecretKeyQueryResult = Apollo.QueryResult<HasSharedSecretKeyQuery, HasSharedSecretKeyQueryVariables>;
export const FindAllUsersDocument = gql`
    query FindAllUsers($filters: FiltersInput) {
  findAllUsers(filters: $filters) {
    username
    avatarUrl
    bio
    id
  }
}
    `;

/**
 * __useFindAllUsersQuery__
 *
 * To run a query within a React component, call `useFindAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllUsersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
      }
export function useFindAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
        }
export function useFindAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
        }
export type FindAllUsersQueryHookResult = ReturnType<typeof useFindAllUsersQuery>;
export type FindAllUsersLazyQueryHookResult = ReturnType<typeof useFindAllUsersLazyQuery>;
export type FindAllUsersSuspenseQueryHookResult = ReturnType<typeof useFindAllUsersSuspenseQuery>;
export type FindAllUsersQueryResult = Apollo.QueryResult<FindAllUsersQuery, FindAllUsersQueryVariables>;
export const FindProfileDocument = gql`
    query FindProfile {
  findProfile {
    id
    avatarUrl
    username
    bio
    isTotpEnabled
  }
}
    `;

/**
 * __useFindProfileQuery__
 *
 * To run a query within a React component, call `useFindProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindProfileQuery(baseOptions?: Apollo.QueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
      }
export function useFindProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
        }
export function useFindProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
        }
export type FindProfileQueryHookResult = ReturnType<typeof useFindProfileQuery>;
export type FindProfileLazyQueryHookResult = ReturnType<typeof useFindProfileLazyQuery>;
export type FindProfileSuspenseQueryHookResult = ReturnType<typeof useFindProfileSuspenseQuery>;
export type FindProfileQueryResult = Apollo.QueryResult<FindProfileQuery, FindProfileQueryVariables>;
export const FindCurrentSessionDocument = gql`
    query FindCurrentSession {
  findCurrentSession {
    id
    userId
    createdAt
    metadata {
      ip
      device {
        browser
        os
        type
      }
      location {
        city
        country
        latitude
        longitude
      }
    }
  }
}
    `;

/**
 * __useFindCurrentSessionQuery__
 *
 * To run a query within a React component, call `useFindCurrentSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindCurrentSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindCurrentSessionQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindCurrentSessionQuery(baseOptions?: Apollo.QueryHookOptions<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>(FindCurrentSessionDocument, options);
      }
export function useFindCurrentSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>(FindCurrentSessionDocument, options);
        }
export function useFindCurrentSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>(FindCurrentSessionDocument, options);
        }
export type FindCurrentSessionQueryHookResult = ReturnType<typeof useFindCurrentSessionQuery>;
export type FindCurrentSessionLazyQueryHookResult = ReturnType<typeof useFindCurrentSessionLazyQuery>;
export type FindCurrentSessionSuspenseQueryHookResult = ReturnType<typeof useFindCurrentSessionSuspenseQuery>;
export type FindCurrentSessionQueryResult = Apollo.QueryResult<FindCurrentSessionQuery, FindCurrentSessionQueryVariables>;
export const FindSessionsByUserDocument = gql`
    query FindSessionsByUser {
  findSessionsByUser {
    id
    userId
    createdAt
    metadata {
      ip
      device {
        browser
        os
        type
      }
      location {
        city
        country
        latitude
        longitude
      }
    }
  }
}
    `;

/**
 * __useFindSessionsByUserQuery__
 *
 * To run a query within a React component, call `useFindSessionsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSessionsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindSessionsByUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindSessionsByUserQuery(baseOptions?: Apollo.QueryHookOptions<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>(FindSessionsByUserDocument, options);
      }
export function useFindSessionsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>(FindSessionsByUserDocument, options);
        }
export function useFindSessionsByUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>(FindSessionsByUserDocument, options);
        }
export type FindSessionsByUserQueryHookResult = ReturnType<typeof useFindSessionsByUserQuery>;
export type FindSessionsByUserLazyQueryHookResult = ReturnType<typeof useFindSessionsByUserLazyQuery>;
export type FindSessionsByUserSuspenseQueryHookResult = ReturnType<typeof useFindSessionsByUserSuspenseQuery>;
export type FindSessionsByUserQueryResult = Apollo.QueryResult<FindSessionsByUserQuery, FindSessionsByUserQueryVariables>;
export const ChatAddedDocument = gql`
    subscription ChatAdded($userId: String!, $groupId: String!) {
  chatAdded(userId: $userId, groupId: $groupId) {
    chatName
    avatarUrl
    updatedAt
    isSecret
    requireTotp
    id
    isGroup
    groupId
    members {
      id
      user {
        id
        username
        avatarUrl
      }
    }
    lastMessage {
      text
      user {
        username
      }
      files {
        fileName
      }
    }
    draftMessages {
      text
      files {
        fileName
      }
    }
    lastMessageAt
  }
}
    `;

/**
 * __useChatAddedSubscription__
 *
 * To run a query within a React component, call `useChatAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatAddedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useChatAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatAddedSubscription, ChatAddedSubscriptionVariables> & ({ variables: ChatAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatAddedSubscription, ChatAddedSubscriptionVariables>(ChatAddedDocument, options);
      }
export type ChatAddedSubscriptionHookResult = ReturnType<typeof useChatAddedSubscription>;
export type ChatAddedSubscriptionResult = Apollo.SubscriptionResult<ChatAddedSubscription>;
export const ChatAssignedRoleDocument = gql`
    subscription ChatAssignedRole($chatId: String!) {
  chatAssignedRole(chatId: $chatId) {
    id
    name
    color
    chatId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useChatAssignedRoleSubscription__
 *
 * To run a query within a React component, call `useChatAssignedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatAssignedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatAssignedRoleSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChatAssignedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatAssignedRoleSubscription, ChatAssignedRoleSubscriptionVariables> & ({ variables: ChatAssignedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatAssignedRoleSubscription, ChatAssignedRoleSubscriptionVariables>(ChatAssignedRoleDocument, options);
      }
export type ChatAssignedRoleSubscriptionHookResult = ReturnType<typeof useChatAssignedRoleSubscription>;
export type ChatAssignedRoleSubscriptionResult = Apollo.SubscriptionResult<ChatAssignedRoleSubscription>;
export const ChatDeletedDocument = gql`
    subscription ChatDeleted($groupId: String!, $userId: String!) {
  chatDeleted(groupId: $groupId, userId: $userId) {
    id
    isSecret
  }
}
    `;

/**
 * __useChatDeletedSubscription__
 *
 * To run a query within a React component, call `useChatDeletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatDeletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatDeletedSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatDeletedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatDeletedSubscription, ChatDeletedSubscriptionVariables> & ({ variables: ChatDeletedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatDeletedSubscription, ChatDeletedSubscriptionVariables>(ChatDeletedDocument, options);
      }
export type ChatDeletedSubscriptionHookResult = ReturnType<typeof useChatDeletedSubscription>;
export type ChatDeletedSubscriptionResult = Apollo.SubscriptionResult<ChatDeletedSubscription>;
export const ChatDeletedRoleDocument = gql`
    subscription ChatDeletedRole($chatId: String!) {
  chatDeletedRole(chatId: $chatId) {
    id
    name
    color
    chatId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useChatDeletedRoleSubscription__
 *
 * To run a query within a React component, call `useChatDeletedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatDeletedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatDeletedRoleSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChatDeletedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatDeletedRoleSubscription, ChatDeletedRoleSubscriptionVariables> & ({ variables: ChatDeletedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatDeletedRoleSubscription, ChatDeletedRoleSubscriptionVariables>(ChatDeletedRoleDocument, options);
      }
export type ChatDeletedRoleSubscriptionHookResult = ReturnType<typeof useChatDeletedRoleSubscription>;
export type ChatDeletedRoleSubscriptionResult = Apollo.SubscriptionResult<ChatDeletedRoleSubscription>;
export const ChatMessageAddedDocument = gql`
    subscription ChatMessageAdded($chatId: String!, $userId: String!) {
  chatMessageAdded(chatId: $chatId, userId: $userId) {
    id
    text
    isEdited
    isStarted
    createdAt
    files {
      fileName
      fileFormat
      fileSize
      id
    }
    repliedToLinks {
      id
      repliedTo {
        id
        text
        files {
          fileName
          fileFormat
          fileSize
          id
        }
        user {
          avatarUrl
          username
          id
        }
      }
    }
    chat {
      chatName
    }
    user {
      avatarUrl
      username
      id
    }
  }
}
    `;

/**
 * __useChatMessageAddedSubscription__
 *
 * To run a query within a React component, call `useChatMessageAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatMessageAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatMessageAddedSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatMessageAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatMessageAddedSubscription, ChatMessageAddedSubscriptionVariables> & ({ variables: ChatMessageAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatMessageAddedSubscription, ChatMessageAddedSubscriptionVariables>(ChatMessageAddedDocument, options);
      }
export type ChatMessageAddedSubscriptionHookResult = ReturnType<typeof useChatMessageAddedSubscription>;
export type ChatMessageAddedSubscriptionResult = Apollo.SubscriptionResult<ChatMessageAddedSubscription>;
export const ChatMessageRemovedDocument = gql`
    subscription ChatMessageRemoved($chatId: String!, $userId: String!) {
  chatMessageRemoved(chatId: $chatId, userId: $userId) {
    id
  }
}
    `;

/**
 * __useChatMessageRemovedSubscription__
 *
 * To run a query within a React component, call `useChatMessageRemovedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatMessageRemovedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatMessageRemovedSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatMessageRemovedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatMessageRemovedSubscription, ChatMessageRemovedSubscriptionVariables> & ({ variables: ChatMessageRemovedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatMessageRemovedSubscription, ChatMessageRemovedSubscriptionVariables>(ChatMessageRemovedDocument, options);
      }
export type ChatMessageRemovedSubscriptionHookResult = ReturnType<typeof useChatMessageRemovedSubscription>;
export type ChatMessageRemovedSubscriptionResult = Apollo.SubscriptionResult<ChatMessageRemovedSubscription>;
export const ChatRemovedRoleDocument = gql`
    subscription ChatRemovedRole($chatId: String!) {
  chatRemovedRole(chatId: $chatId) {
    id
    name
    color
    chatId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useChatRemovedRoleSubscription__
 *
 * To run a query within a React component, call `useChatRemovedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatRemovedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatRemovedRoleSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChatRemovedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatRemovedRoleSubscription, ChatRemovedRoleSubscriptionVariables> & ({ variables: ChatRemovedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatRemovedRoleSubscription, ChatRemovedRoleSubscriptionVariables>(ChatRemovedRoleDocument, options);
      }
export type ChatRemovedRoleSubscriptionHookResult = ReturnType<typeof useChatRemovedRoleSubscription>;
export type ChatRemovedRoleSubscriptionResult = Apollo.SubscriptionResult<ChatRemovedRoleSubscription>;
export const ChatUpdatedDocument = gql`
    subscription ChatUpdated($userId: String!) {
  chatUpdated(userId: $userId) {
    chatName
    avatarUrl
    updatedAt
    pinnedMessageId
    isSecret
    requireTotp
    id
    isGroup
    groupId
    members {
      id
      user {
        id
        username
        avatarUrl
      }
    }
    lastMessage {
      text
      user {
        username
      }
      files {
        fileName
      }
    }
    draftMessages {
      text
      files {
        fileName
      }
    }
    lastMessageAt
  }
}
    `;

/**
 * __useChatUpdatedSubscription__
 *
 * To run a query within a React component, call `useChatUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatUpdatedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatUpdatedSubscription, ChatUpdatedSubscriptionVariables> & ({ variables: ChatUpdatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatUpdatedSubscription, ChatUpdatedSubscriptionVariables>(ChatUpdatedDocument, options);
      }
export type ChatUpdatedSubscriptionHookResult = ReturnType<typeof useChatUpdatedSubscription>;
export type ChatUpdatedSubscriptionResult = Apollo.SubscriptionResult<ChatUpdatedSubscription>;
export const ChatUpsertedRoleDocument = gql`
    subscription ChatUpsertedRole($chatId: String!) {
  chatUpsertedRole(chatId: $chatId) {
    id
    name
    color
    chatId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useChatUpsertedRoleSubscription__
 *
 * To run a query within a React component, call `useChatUpsertedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatUpsertedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatUpsertedRoleSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useChatUpsertedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatUpsertedRoleSubscription, ChatUpsertedRoleSubscriptionVariables> & ({ variables: ChatUpsertedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatUpsertedRoleSubscription, ChatUpsertedRoleSubscriptionVariables>(ChatUpsertedRoleDocument, options);
      }
export type ChatUpsertedRoleSubscriptionHookResult = ReturnType<typeof useChatUpsertedRoleSubscription>;
export type ChatUpsertedRoleSubscriptionResult = Apollo.SubscriptionResult<ChatUpsertedRoleSubscription>;
export const TypingStartedDocument = gql`
    subscription TypingStarted($chatId: String!, $userId: String!) {
  typingStarted(chatId: $chatId, userId: $userId) {
    userId
    username
    chatId
  }
}
    `;

/**
 * __useTypingStartedSubscription__
 *
 * To run a query within a React component, call `useTypingStartedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTypingStartedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTypingStartedSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useTypingStartedSubscription(baseOptions: Apollo.SubscriptionHookOptions<TypingStartedSubscription, TypingStartedSubscriptionVariables> & ({ variables: TypingStartedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TypingStartedSubscription, TypingStartedSubscriptionVariables>(TypingStartedDocument, options);
      }
export type TypingStartedSubscriptionHookResult = ReturnType<typeof useTypingStartedSubscription>;
export type TypingStartedSubscriptionResult = Apollo.SubscriptionResult<TypingStartedSubscription>;
export const FriendRemovedDocument = gql`
    subscription FriendRemoved($userId: String!) {
  friendRemoved(userId: $userId) {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    friend {
      id
      username
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFriendRemovedSubscription__
 *
 * To run a query within a React component, call `useFriendRemovedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFriendRemovedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFriendRemovedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFriendRemovedSubscription(baseOptions: Apollo.SubscriptionHookOptions<FriendRemovedSubscription, FriendRemovedSubscriptionVariables> & ({ variables: FriendRemovedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FriendRemovedSubscription, FriendRemovedSubscriptionVariables>(FriendRemovedDocument, options);
      }
export type FriendRemovedSubscriptionHookResult = ReturnType<typeof useFriendRemovedSubscription>;
export type FriendRemovedSubscriptionResult = Apollo.SubscriptionResult<FriendRemovedSubscription>;
export const FriendRequestAcceptedDocument = gql`
    subscription FriendRequestAccepted($userId: String!) {
  friendRequestAccepted(userId: $userId) {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    friend {
      id
      username
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFriendRequestAcceptedSubscription__
 *
 * To run a query within a React component, call `useFriendRequestAcceptedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFriendRequestAcceptedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFriendRequestAcceptedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFriendRequestAcceptedSubscription(baseOptions: Apollo.SubscriptionHookOptions<FriendRequestAcceptedSubscription, FriendRequestAcceptedSubscriptionVariables> & ({ variables: FriendRequestAcceptedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FriendRequestAcceptedSubscription, FriendRequestAcceptedSubscriptionVariables>(FriendRequestAcceptedDocument, options);
      }
export type FriendRequestAcceptedSubscriptionHookResult = ReturnType<typeof useFriendRequestAcceptedSubscription>;
export type FriendRequestAcceptedSubscriptionResult = Apollo.SubscriptionResult<FriendRequestAcceptedSubscription>;
export const FriendRequestCancelledDocument = gql`
    subscription FriendRequestCancelled($userId: String!) {
  friendRequestCancelled(userId: $userId) {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    friend {
      id
      username
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFriendRequestCancelledSubscription__
 *
 * To run a query within a React component, call `useFriendRequestCancelledSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFriendRequestCancelledSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFriendRequestCancelledSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFriendRequestCancelledSubscription(baseOptions: Apollo.SubscriptionHookOptions<FriendRequestCancelledSubscription, FriendRequestCancelledSubscriptionVariables> & ({ variables: FriendRequestCancelledSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FriendRequestCancelledSubscription, FriendRequestCancelledSubscriptionVariables>(FriendRequestCancelledDocument, options);
      }
export type FriendRequestCancelledSubscriptionHookResult = ReturnType<typeof useFriendRequestCancelledSubscription>;
export type FriendRequestCancelledSubscriptionResult = Apollo.SubscriptionResult<FriendRequestCancelledSubscription>;
export const FriendRequestDeclinedDocument = gql`
    subscription FriendRequestDeclined($userId: String!) {
  friendRequestDeclined(userId: $userId) {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    friend {
      id
      username
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFriendRequestDeclinedSubscription__
 *
 * To run a query within a React component, call `useFriendRequestDeclinedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFriendRequestDeclinedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFriendRequestDeclinedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFriendRequestDeclinedSubscription(baseOptions: Apollo.SubscriptionHookOptions<FriendRequestDeclinedSubscription, FriendRequestDeclinedSubscriptionVariables> & ({ variables: FriendRequestDeclinedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FriendRequestDeclinedSubscription, FriendRequestDeclinedSubscriptionVariables>(FriendRequestDeclinedDocument, options);
      }
export type FriendRequestDeclinedSubscriptionHookResult = ReturnType<typeof useFriendRequestDeclinedSubscription>;
export type FriendRequestDeclinedSubscriptionResult = Apollo.SubscriptionResult<FriendRequestDeclinedSubscription>;
export const FriendRequestSentDocument = gql`
    subscription FriendRequestSent($userId: String!) {
  friendRequestSent(userId: $userId) {
    id
    userId
    friendId
    status
    user {
      id
      username
      avatarUrl
    }
    friend {
      id
      username
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFriendRequestSentSubscription__
 *
 * To run a query within a React component, call `useFriendRequestSentSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFriendRequestSentSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFriendRequestSentSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFriendRequestSentSubscription(baseOptions: Apollo.SubscriptionHookOptions<FriendRequestSentSubscription, FriendRequestSentSubscriptionVariables> & ({ variables: FriendRequestSentSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FriendRequestSentSubscription, FriendRequestSentSubscriptionVariables>(FriendRequestSentDocument, options);
      }
export type FriendRequestSentSubscriptionHookResult = ReturnType<typeof useFriendRequestSentSubscription>;
export type FriendRequestSentSubscriptionResult = Apollo.SubscriptionResult<FriendRequestSentSubscription>;
export const GroupAddedDocument = gql`
    subscription GroupAdded($userId: String!) {
  groupAdded(userId: $userId) {
    id
    groupName
    avatarUrl
  }
}
    `;

/**
 * __useGroupAddedSubscription__
 *
 * To run a query within a React component, call `useGroupAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupAddedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGroupAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupAddedSubscription, GroupAddedSubscriptionVariables> & ({ variables: GroupAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupAddedSubscription, GroupAddedSubscriptionVariables>(GroupAddedDocument, options);
      }
export type GroupAddedSubscriptionHookResult = ReturnType<typeof useGroupAddedSubscription>;
export type GroupAddedSubscriptionResult = Apollo.SubscriptionResult<GroupAddedSubscription>;
export const GroupAssignedRoleDocument = gql`
    subscription GroupAssignedRole($groupId: String!) {
  groupAssignedRole(groupId: $groupId) {
    id
    name
    color
    groupId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGroupAssignedRoleSubscription__
 *
 * To run a query within a React component, call `useGroupAssignedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupAssignedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupAssignedRoleSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupAssignedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupAssignedRoleSubscription, GroupAssignedRoleSubscriptionVariables> & ({ variables: GroupAssignedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupAssignedRoleSubscription, GroupAssignedRoleSubscriptionVariables>(GroupAssignedRoleDocument, options);
      }
export type GroupAssignedRoleSubscriptionHookResult = ReturnType<typeof useGroupAssignedRoleSubscription>;
export type GroupAssignedRoleSubscriptionResult = Apollo.SubscriptionResult<GroupAssignedRoleSubscription>;
export const GroupDeletedDocument = gql`
    subscription GroupDeleted($userId: String!) {
  groupDeleted(userId: $userId) {
    id
  }
}
    `;

/**
 * __useGroupDeletedSubscription__
 *
 * To run a query within a React component, call `useGroupDeletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupDeletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupDeletedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGroupDeletedSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupDeletedSubscription, GroupDeletedSubscriptionVariables> & ({ variables: GroupDeletedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupDeletedSubscription, GroupDeletedSubscriptionVariables>(GroupDeletedDocument, options);
      }
export type GroupDeletedSubscriptionHookResult = ReturnType<typeof useGroupDeletedSubscription>;
export type GroupDeletedSubscriptionResult = Apollo.SubscriptionResult<GroupDeletedSubscription>;
export const GroupDeletedRoleDocument = gql`
    subscription GroupDeletedRole($groupId: String!) {
  groupDeletedRole(groupId: $groupId) {
    id
    name
    color
    groupId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGroupDeletedRoleSubscription__
 *
 * To run a query within a React component, call `useGroupDeletedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupDeletedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupDeletedRoleSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupDeletedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupDeletedRoleSubscription, GroupDeletedRoleSubscriptionVariables> & ({ variables: GroupDeletedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupDeletedRoleSubscription, GroupDeletedRoleSubscriptionVariables>(GroupDeletedRoleDocument, options);
      }
export type GroupDeletedRoleSubscriptionHookResult = ReturnType<typeof useGroupDeletedRoleSubscription>;
export type GroupDeletedRoleSubscriptionResult = Apollo.SubscriptionResult<GroupDeletedRoleSubscription>;
export const GroupRemovedRoleDocument = gql`
    subscription GroupRemovedRole($groupId: String!) {
  groupRemovedRole(groupId: $groupId) {
    id
    name
    color
    groupId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGroupRemovedRoleSubscription__
 *
 * To run a query within a React component, call `useGroupRemovedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupRemovedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupRemovedRoleSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupRemovedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupRemovedRoleSubscription, GroupRemovedRoleSubscriptionVariables> & ({ variables: GroupRemovedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupRemovedRoleSubscription, GroupRemovedRoleSubscriptionVariables>(GroupRemovedRoleDocument, options);
      }
export type GroupRemovedRoleSubscriptionHookResult = ReturnType<typeof useGroupRemovedRoleSubscription>;
export type GroupRemovedRoleSubscriptionResult = Apollo.SubscriptionResult<GroupRemovedRoleSubscription>;
export const GroupUpsertedRoleDocument = gql`
    subscription GroupUpsertedRole($groupId: String!) {
  groupUpsertedRole(groupId: $groupId) {
    id
    name
    color
    groupId
    permissions
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGroupUpsertedRoleSubscription__
 *
 * To run a query within a React component, call `useGroupUpsertedRoleSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGroupUpsertedRoleSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupUpsertedRoleSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupUpsertedRoleSubscription(baseOptions: Apollo.SubscriptionHookOptions<GroupUpsertedRoleSubscription, GroupUpsertedRoleSubscriptionVariables> & ({ variables: GroupUpsertedRoleSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<GroupUpsertedRoleSubscription, GroupUpsertedRoleSubscriptionVariables>(GroupUpsertedRoleDocument, options);
      }
export type GroupUpsertedRoleSubscriptionHookResult = ReturnType<typeof useGroupUpsertedRoleSubscription>;
export type GroupUpsertedRoleSubscriptionResult = Apollo.SubscriptionResult<GroupUpsertedRoleSubscription>;
export const AddSecretMessageDocument = gql`
    subscription AddSecretMessage($userId: String!) {
  addSecretMessage(userId: $userId) {
    id
    chatId
    fromUserId
    ukm
    iv
    encryptedMessage
    sig
  }
}
    `;

/**
 * __useAddSecretMessageSubscription__
 *
 * To run a query within a React component, call `useAddSecretMessageSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAddSecretMessageSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddSecretMessageSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAddSecretMessageSubscription(baseOptions: Apollo.SubscriptionHookOptions<AddSecretMessageSubscription, AddSecretMessageSubscriptionVariables> & ({ variables: AddSecretMessageSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AddSecretMessageSubscription, AddSecretMessageSubscriptionVariables>(AddSecretMessageDocument, options);
      }
export type AddSecretMessageSubscriptionHookResult = ReturnType<typeof useAddSecretMessageSubscription>;
export type AddSecretMessageSubscriptionResult = Apollo.SubscriptionResult<AddSecretMessageSubscription>;
export const AddSharedSecretKeyDocument = gql`
    subscription AddSharedSecretKey($userId: String!) {
  addSharedSecretKey(userId: $userId) {
    chatId
    fromUserId
    toUserId
    ekPub
    usedOpk
    ukm
    iv
    encryptedKey
    sig
  }
}
    `;

/**
 * __useAddSharedSecretKeySubscription__
 *
 * To run a query within a React component, call `useAddSharedSecretKeySubscription` and pass it any options that fit your needs.
 * When your component renders, `useAddSharedSecretKeySubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddSharedSecretKeySubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAddSharedSecretKeySubscription(baseOptions: Apollo.SubscriptionHookOptions<AddSharedSecretKeySubscription, AddSharedSecretKeySubscriptionVariables> & ({ variables: AddSharedSecretKeySubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AddSharedSecretKeySubscription, AddSharedSecretKeySubscriptionVariables>(AddSharedSecretKeyDocument, options);
      }
export type AddSharedSecretKeySubscriptionHookResult = ReturnType<typeof useAddSharedSecretKeySubscription>;
export type AddSharedSecretKeySubscriptionResult = Apollo.SubscriptionResult<AddSharedSecretKeySubscription>;
export const SecretKeyRotationDocument = gql`
    subscription SecretKeyRotation($userId: String!) {
  secretKeyRotation(userId: $userId) {
    chatId
  }
}
    `;

/**
 * __useSecretKeyRotationSubscription__
 *
 * To run a query within a React component, call `useSecretKeyRotationSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSecretKeyRotationSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSecretKeyRotationSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useSecretKeyRotationSubscription(baseOptions: Apollo.SubscriptionHookOptions<SecretKeyRotationSubscription, SecretKeyRotationSubscriptionVariables> & ({ variables: SecretKeyRotationSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SecretKeyRotationSubscription, SecretKeyRotationSubscriptionVariables>(SecretKeyRotationDocument, options);
      }
export type SecretKeyRotationSubscriptionHookResult = ReturnType<typeof useSecretKeyRotationSubscription>;
export type SecretKeyRotationSubscriptionResult = Apollo.SubscriptionResult<SecretKeyRotationSubscription>;