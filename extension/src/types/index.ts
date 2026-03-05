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

export interface SaveMediaMessage {
  type: 'SAVE_MEDIA';
  payload: {
    media: DetectedMedia[];
    tweetUrl: string;
  };
}

export interface SaveMediaResponse {
  success: boolean;
  error?: string;
}

export type Message = SaveMediaMessage;

export interface UserState {
  isLoggedIn: boolean;
  email?: string;
  displayName?: string;
}
