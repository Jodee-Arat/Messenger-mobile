export interface SendFileType {
  name: string;
  size: string;
  id: string;
  uri?: string;
  status?: 'pending' | 'encrypting' | 'uploading' | 'uploaded' | 'failed';
  errorMessage?: string;
}
