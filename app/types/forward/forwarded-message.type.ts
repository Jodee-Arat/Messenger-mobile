import { MessageFileType } from "../message-file.type";

export type ForwardedMessageType = {
  id: string;
  text?: string | null;
  files?: MessageFileType[] | null;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
};
