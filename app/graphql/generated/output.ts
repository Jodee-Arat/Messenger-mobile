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
  message?: Maybe<Scalars['String']['output']>;
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
  lastMessage?: Maybe<ChatMessageModel>;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  lastMessageId?: Maybe<Scalars['String']['output']>;
  members: Array<ChatMemberModel>;
  pinnedMessage?: Maybe<ChatMessageModel>;
  pinnedMessageId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChatInput = {
  chatName: Scalars['String']['input'];
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

export type GroupMemberModel = {
  __typename?: 'GroupMemberModel';
  createdAt: Scalars['DateTime']['output'];
  group: GroupModel;
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  joinedAt: Scalars['DateTime']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  changeChatAvatar: Scalars['String']['output'];
  changeChatInfo: Scalars['Boolean']['output'];
  changeGroupAvatar: Scalars['String']['output'];
  changeGroupInfo: Scalars['Boolean']['output'];
  changeProfileAvatar: Scalars['String']['output'];
  changeProfileInfo: Scalars['Boolean']['output'];
  clearSessionCookie: Scalars['Boolean']['output'];
  createChat: ChatModel;
  createGroup: GroupModel;
  createUserWEmail: UserModel;
  deleteChat: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  downloadFile: FileDownloadData;
  forwardChatMessage: Scalars['Boolean']['output'];
  loginUser: AuthModel;
  logoutUser: Scalars['Boolean']['output'];
  pinChat: Scalars['Boolean']['output'];
  pinMessage: Scalars['Boolean']['output'];
  removeChatAvatar: Scalars['Boolean']['output'];
  removeDraft: Scalars['Boolean']['output'];
  removeFile: Scalars['Boolean']['output'];
  removeGroupAvatar: Scalars['Boolean']['output'];
  removeMessages: Scalars['Boolean']['output'];
  removeProfileAvatar: Scalars['Boolean']['output'];
  sendChatDraftMessage: Scalars['Boolean']['output'];
  sendChatMessage: Scalars['Boolean']['output'];
  sendFile: AttachFileModel;
  unPinChat: Scalars['Boolean']['output'];
  unPinMessage: Scalars['Boolean']['output'];
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


export type MutationDeleteChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDownloadFileArgs = {
  chatId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
};


export type MutationForwardChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
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


export type MutationRemoveGroupAvatarArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationRemoveMessagesArgs = {
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
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


export type MutationUnPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationUnPinMessageArgs = {
  chatId: Scalars['String']['input'];
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


export type QueryFindChatByChatIdArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryFindGroupByGroupIdArgs = {
  groupId: Scalars['String']['input'];
};

export type RemoveMessagesInput = {
  messageIds: Array<Scalars['String']['input']>;
};

export type SendChatMessageInput = {
  editId?: InputMaybe<Scalars['String']['input']>;
  fileIds?: InputMaybe<Array<Scalars['String']['input']>>;
  forwardedMessageIds?: InputMaybe<Array<Scalars['String']['input']>>;
  targetChatsId?: InputMaybe<Array<Scalars['String']['input']>>;
  text?: InputMaybe<Scalars['String']['input']>;
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

export type Subscription = {
  __typename?: 'Subscription';
  chatAdded: ChatModel;
  chatDeleted: ChatModel;
  chatMessageAdded: ChatMessageModel;
  chatMessageRemoved: Array<ChatMessageIdModel>;
  chatUpdated: ChatModel;
  groupAdded: GroupModel;
  groupDeleted: GroupModel;
};


export type SubscriptionChatAddedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatDeletedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageAddedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageRemovedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatUpdatedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupAddedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupDeletedArgs = {
  userId: Scalars['String']['input'];
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
  password: Scalars['String']['output'];
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


export type CreateUserWEmailMutation = { __typename?: 'Mutation', createUserWEmail: { __typename?: 'UserModel', id: string } };

export type LoginUserMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'AuthModel', message?: string | null, user?: { __typename?: 'UserModel', id: string } | null } };

export type LogoutUserMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutUserMutation = { __typename?: 'Mutation', logoutUser: boolean };

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


export type CreateChatMutation = { __typename?: 'Mutation', createChat: { __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, id: string } };

export type DeleteChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type DeleteChatMutation = { __typename?: 'Mutation', deleteChat: boolean };

export type DownloadFileMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
  chatId: Scalars['String']['input'];
}>;


export type DownloadFileMutation = { __typename?: 'Mutation', downloadFile: { __typename?: 'FileDownloadData', filename: string, fileUrl: string } };

export type ForwardChatMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
}>;


export type ForwardChatMessageMutation = { __typename?: 'Mutation', forwardChatMessage: boolean };

export type PinChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
}>;


export type PinChatMutation = { __typename?: 'Mutation', pinMessage: boolean };

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

export type RemoveMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
}>;


export type RemoveMessagesMutation = { __typename?: 'Mutation', removeMessages: boolean };

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

export type UnPinMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type UnPinMessageMutation = { __typename?: 'Mutation', unPinMessage: boolean };

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

export type RemoveGroupAvatarMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type RemoveGroupAvatarMutation = { __typename?: 'Mutation', removeGroupAvatar: boolean };

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


export type FindAllChatsByGroupQuery = { __typename?: 'Query', findAllChatsByGroup: Array<{ __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, id: string, lastMessageAt?: any | null, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null }> };

export type FindAllChatsByUserQueryVariables = Exact<{
  filters: FiltersInput;
}>;


export type FindAllChatsByUserQuery = { __typename?: 'Query', findAllChatsByUser: Array<{ __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, id: string, lastMessageAt?: any | null, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null }> };

export type FindAllMessagesByChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
}>;


export type FindAllMessagesByChatQuery = { __typename?: 'Query', findAllMessagesByChat: Array<{ __typename?: 'ChatMessageModel', id: string, isEdited: boolean, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } | null } | null> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', avatarUrl?: string | null, id: string, username: string } }> };

export type FindChatByChatIdQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type FindChatByChatIdQuery = { __typename?: 'Query', findChatByChatId: { __typename?: 'ChatModel', chatName?: string | null, avatarUrl?: string | null, description?: string | null, pinnedMessage?: { __typename?: 'ChatMessageModel', isEdited: boolean, id: string, chat: { __typename?: 'ChatModel', id: string }, user: { __typename?: 'UserModel', id: string, username: string }, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', username: string, id: string } } | null } | null> | null } | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', editId?: string | null, id: string, text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }>, repliedToLinks: Array<{ __typename?: 'chatDraftMessageReplyModel', id: string, repliedTo: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', username: string, id: string } } }> }> | null } };

export type FindAllGroupsByUserQueryVariables = Exact<{
  filters: FiltersInput;
}>;


export type FindAllGroupsByUserQuery = { __typename?: 'Query', findAllGroupsByUser: Array<{ __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null }> };

export type FindGroupByGroupIdQueryVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type FindGroupByGroupIdQuery = { __typename?: 'Query', findGroupByGroupId: { __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null, description?: string | null, members: Array<{ __typename?: 'GroupMemberModel', user: { __typename?: 'UserModel', id: string, username: string, avatarUrl?: string | null } }> } };

export type FindAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllUsersQuery = { __typename?: 'Query', findAllUsers: Array<{ __typename?: 'UserModel', username: string, avatarUrl?: string | null, bio?: string | null, id: string }> };

export type FindProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type FindProfileQuery = { __typename?: 'Query', findProfile: { __typename?: 'UserModel', id: string, avatarUrl?: string | null, username: string, bio?: string | null, password: string } };

export type ChatAddedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
}>;


export type ChatAddedSubscription = { __typename?: 'Subscription', chatAdded: { __typename?: 'ChatModel', id: string, chatName?: string | null, avatarUrl?: string | null, lastMessageAt?: any | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null } };

export type ChatDeletedSubscriptionVariables = Exact<{
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatDeletedSubscription = { __typename?: 'Subscription', chatDeleted: { __typename?: 'ChatModel', id: string } };

export type ChatMessageAddedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatMessageAddedSubscription = { __typename?: 'Subscription', chatMessageAdded: { __typename?: 'ChatMessageModel', id: string, text?: string | null, isEdited: boolean, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, repliedToLinks?: Array<{ __typename?: 'ChatMessageReplyModel', id: string, repliedTo?: { __typename?: 'ChatMessageModel', id: string, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } | null } | null> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', avatarUrl?: string | null, username: string, id: string } } };

export type ChatMessageRemovedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatMessageRemovedSubscription = { __typename?: 'Subscription', chatMessageRemoved: Array<{ __typename?: 'ChatMessageIdModel', id: string }> };

export type ChatUpdatedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type ChatUpdatedSubscription = { __typename?: 'Subscription', chatUpdated: { __typename?: 'ChatModel', id: string, chatName?: string | null, avatarUrl?: string | null, lastMessageAt?: any | null, draftMessages?: Array<{ __typename?: 'ChatDraftMessageModel', text: string, files: Array<{ __typename?: 'FileMessageModel', fileName: string }> }> | null, lastMessage?: { __typename?: 'ChatMessageModel', text?: string | null, user: { __typename?: 'UserModel', username: string }, files?: Array<{ __typename?: 'FileMessageModel', fileName: string }> | null } | null } };

export type GroupAddedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GroupAddedSubscription = { __typename?: 'Subscription', groupAdded: { __typename?: 'GroupModel', id: string, groupName: string, avatarUrl?: string | null } };

export type GroupDeletedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GroupDeletedSubscription = { __typename?: 'Subscription', groupDeleted: { __typename?: 'GroupModel', id: string } };


export const CreateUserWEmailDocument = gql`
    mutation CreateUserWEmail($data: CreateUserWEmailInput!) {
  createUserWEmail(data: $data) {
    id
  }
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
export const LoginUserDocument = gql`
    mutation LoginUser($data: LoginInput!) {
  loginUser(data: $data) {
    message
    user {
      id
    }
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
export const PinChatDocument = gql`
    mutation PinChat($chatId: String!, $messageId: String!) {
  pinMessage(chatId: $chatId, messageId: $messageId)
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
 *      messageId: // value for 'messageId'
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
    id
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
    id
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
    chatName
    avatarUrl
    description
    pinnedMessage {
      isEdited
      chat {
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
      user {
        id
        username
        avatarUrl
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
export const FindAllUsersDocument = gql`
    query FindAllUsers {
  findAllUsers {
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
    password
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
export const ChatAddedDocument = gql`
    subscription ChatAdded($userId: String!, $groupId: String!) {
  chatAdded(userId: $userId, groupId: $groupId) {
    id
    chatName
    avatarUrl
    draftMessages {
      files {
        fileName
      }
      text
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
export const ChatDeletedDocument = gql`
    subscription ChatDeleted($groupId: String!, $userId: String!) {
  chatDeleted(groupId: $groupId, userId: $userId) {
    id
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
export const ChatMessageAddedDocument = gql`
    subscription ChatMessageAdded($chatId: String!, $userId: String!) {
  chatMessageAdded(chatId: $chatId, userId: $userId) {
    id
    text
    isEdited
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
export const ChatUpdatedDocument = gql`
    subscription ChatUpdated($userId: String!) {
  chatUpdated(userId: $userId) {
    id
    chatName
    avatarUrl
    draftMessages {
      files {
        fileName
      }
      text
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