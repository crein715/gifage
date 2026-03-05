import { supabase } from './supabase';

interface DetectedMediaPayload {
  type: string;
  url: string;
  thumbnailUrl?: string;
}

interface SaveMediaResult {
  success: boolean;
  error?: string;
  mediaId?: string;
}

function getExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  };
  return map[mime] || '';
}

export async function saveMedia(
  media: DetectedMediaPayload,
  tweetUrl: string,
  tweetAuthor: string
): Promise<SaveMediaResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(media.url);
    if (!response.ok) {
      return { success: false, error: 'Failed to download media' };
    }
    const blob = await response.blob();
    const mimeType =
      response.headers.get('content-type') || 'application/octet-stream';

    const ext = getExtensionFromMime(mimeType);
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const storagePath = `${user.id}/${media.type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, blob, {
        contentType: mimeType,
        cacheControl: '31536000',
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    let thumbnailPath: string | null = null;
    if (media.thumbnailUrl) {
      try {
        const thumbResponse = await fetch(media.thumbnailUrl);
        const thumbBlob = await thumbResponse.blob();
        const thumbName = `thumb_${fileName}`;
        const thumbPath = `${user.id}/thumbnails/${thumbName}`;

        await supabase.storage.from('media').upload(thumbPath, thumbBlob, {
          contentType:
            thumbResponse.headers.get('content-type') || 'image/jpeg',
        });
        thumbnailPath = thumbPath;
      } catch {
        // Thumbnail upload failed, continue without it
      }
    }

    const { data: savedMedia, error: dbError } = await supabase
      .from('saved_media')
      .insert({
        user_id: user.id,
        media_type: media.type,
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        original_url: media.url,
        source_tweet_url: tweetUrl,
        source_tweet_author: tweetAuthor,
        file_size: blob.size,
        mime_type: mimeType,
      })
      .select('id')
      .single();

    if (dbError) {
      if (dbError.code === '23505') {
        return { success: false, error: 'Already saved' };
      }
      return { success: false, error: dbError.message };
    }

    return { success: true, mediaId: savedMedia.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getUserMedia(limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('saved_media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error, count };
}

export async function deleteMedia(mediaId: string) {
  const { data: media } = await supabase
    .from('saved_media')
    .select('storage_path, thumbnail_path')
    .eq('id', mediaId)
    .single();

  if (media) {
    const pathsToDelete = [media.storage_path];
    if (media.thumbnail_path) pathsToDelete.push(media.thumbnail_path);
    await supabase.storage.from('media').remove(pathsToDelete);
  }

  const { error } = await supabase
    .from('saved_media')
    .delete()
    .eq('id', mediaId);
  return { error };
}

export function getMediaUrl(storagePath: string): string {
  const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
  return data.publicUrl;
}

export function getSignedMediaUrl(storagePath: string) {
  return supabase.storage.from('media').createSignedUrl(storagePath, 3600);
}
