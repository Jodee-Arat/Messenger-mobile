export type MessageFileType = {
  fileName: string;
  fileFormat: string;
  fileSize: string;
  id: string;
  isSecretAttachment?: boolean;
  fileKeyHex?: string;
  ivHex?: string;
  ciphertextSize?: string;
};
