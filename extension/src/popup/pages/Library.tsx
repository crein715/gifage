import { useState, useEffect, useCallback } from 'react';
import { signOut } from '../../lib/auth';
import {
  getUserMedia,
  deleteMedia,
  getSignedMediaUrl,
} from '../../lib/media-service';
import MediaCard from '../components/MediaCard';
import type { SavedMediaRow } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface LibraryProps {
  session: Session;
  onLogout: () => void;
}

const PAGE_SIZE = 20;

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function Library({ session, onLogout }: LibraryProps) {
  const [media, setMedia] = useState<SavedMediaRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>(
    {}
  );

  const user = session.user;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'User';
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

  const fetchMedia = useCallback(async (offset = 0, append = false) => {
    const { data, count } = await getUserMedia(PAGE_SIZE, offset);
    if (data) {
      setMedia((prev) => (append ? [...prev, ...data] : data));
      if (count !== null) setTotalCount(count);
      await loadThumbnails(data);
    }
  }, []);

  const loadThumbnails = async (items: SavedMediaRow[]) => {
    const urls: Record<string, string> = {};
    await Promise.all(
      items.map(async (item) => {
        const path = item.thumbnail_path || item.storage_path;
        const { data } = await getSignedMediaUrl(path);
        if (data?.signedUrl) {
          urls[item.id] = data.signedUrl;
        }
      })
    );
    setThumbnailUrls((prev) => ({ ...prev, ...urls }));
  };

  useEffect(() => {
    fetchMedia().then(() => setLoading(false));
  }, [fetchMedia]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchMedia(media.length, true);
    setLoadingMore(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteMedia(id);
    if (!error) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
      setTotalCount((prev) => prev - 1);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onLogout();
  };

  const hasMore = media.length < totalCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[480px] bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[480px] bg-white dark:bg-black">
      <header className="flex items-center justify-between px-4 py-3 border-b border-x-border-light dark:border-x-border-dark">
        <div className="flex items-center gap-2.5 min-w-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-x-text-light dark:text-x-text-dark truncate">
              {displayName}
            </h1>
            <p className="text-[11px] text-x-secondary-light dark:text-x-secondary-dark">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-x-secondary-light dark:text-x-secondary-dark hover:text-brand transition-colors flex-shrink-0"
        >
          Sign out
        </button>
      </header>

      {media.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 mb-4 text-x-secondary-light dark:text-x-secondary-dark"
            fill="currentColor"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z" />
          </svg>
          <p className="text-sm text-x-secondary-light dark:text-x-secondary-dark leading-relaxed">
            No saved media yet.
            <br />
            Click the save button on any tweet!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1 p-2">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                thumbnailUrl={thumbnailUrls[item.id] || ''}
                type={item.media_type}
                createdAt={relativeTime(item.created_at)}
                sourceTweetUrl={item.source_tweet_url}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {hasMore && (
            <div className="px-4 pb-4 pt-1">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-2 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
