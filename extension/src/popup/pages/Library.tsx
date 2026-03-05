import type { SavedMedia, MediaType } from '@/types';
import MediaCard from '../components/MediaCard';

interface LibraryProps {
  onLogout: () => void;
}

const MOCK_MEDIA: SavedMedia[] = [
  {
    id: '1',
    type: 'gif' as MediaType,
    url: 'https://video.twimg.com/tweet_video/example.mp4',
    thumbnailUrl:
      'https://pbs.twimg.com/tweet_video_thumb/GE3Rz2XWQAAtest.jpg',
    tweetUrl: 'https://x.com/user/status/1',
    savedAt: Date.now() - 86400000,
  },
  {
    id: '2',
    type: 'image' as MediaType,
    url: 'https://pbs.twimg.com/media/example.jpg',
    thumbnailUrl: 'https://pbs.twimg.com/media/GE3Rz2XWQAAtest2.jpg',
    tweetUrl: 'https://x.com/user/status/2',
    savedAt: Date.now() - 172800000,
  },
  {
    id: '3',
    type: 'video' as MediaType,
    url: 'https://video.twimg.com/ext_tw_video/example.mp4',
    thumbnailUrl: 'https://pbs.twimg.com/ext_tw_video_thumb/test3.jpg',
    tweetUrl: 'https://x.com/user/status/3',
    savedAt: Date.now() - 259200000,
  },
];

export default function Library({ onLogout }: LibraryProps) {
  const media = MOCK_MEDIA;
  const isEmpty = media.length === 0;

  return (
    <div className="flex flex-col min-h-[480px] bg-white dark:bg-black">
      <header className="flex items-center justify-between px-4 py-3 border-b border-x-border-light dark:border-x-border-dark">
        <div>
          <h1 className="text-base font-bold text-x-text-light dark:text-x-text-dark">
            Your Collection
          </h1>
          <p className="text-xs text-x-secondary-light dark:text-x-secondary-dark">
            {media.length} {media.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-x-secondary-light dark:text-x-secondary-dark hover:text-brand transition-colors"
        >
          Sign out
        </button>
      </header>

      {isEmpty ? (
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
        <div className="grid grid-cols-2 gap-1 p-2">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              thumbnailUrl={item.thumbnailUrl ?? item.url}
              type={item.type}
              savedAt={item.savedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
