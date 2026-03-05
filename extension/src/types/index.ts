export type MediaType = 'image' | 'gif' | 'video';

export interface DetectedMedia {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
}

export interface SavedMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  tweetUrl?: string;
  savedAt: number;
}

export interface SaveMediaPayload {
  media: DetectedMedia;
  tweetUrl: string;
  tweetAuthor: string;
}

export interface SaveMediaMessage {
  type: 'SAVE_MEDIA';
  payload: SaveMediaPayload;
}

export interface CheckAuthMessage {
  type: 'CHECK_AUTH';
}

export interface GetUserMessage {
  type: 'GET_USER';
}

export type Message = SaveMediaMessage | CheckAuthMessage | GetUserMessage;

export interface SaveMediaResponse {
  success: boolean;
  error?: string;
  mediaId?: string;
}

export interface CheckAuthResponse {
  authenticated: boolean;
}

export interface GetUserResponse {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  } | null;
}

export interface UserState {
  isLoggedIn: boolean;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface SavedMediaRow {
  id: string;
  user_id: string;
  media_type: MediaType;
  storage_path: string;
  thumbnail_path: string | null;
  original_url: string;
  source_tweet_url: string | null;
  source_tweet_author: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}
