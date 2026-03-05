import { useState } from 'react';
import type { MediaType } from '@/types';

interface MediaCardProps {
  id: string;
  thumbnailUrl: string;
  type: MediaType;
  createdAt: string;
  sourceTweetUrl: string | null;
  onDelete: (id: string) => void;
}

const BADGE_MAP: Record<MediaType, string> = {
  image: 'IMG',
  gif: 'GIF',
  video: 'VID',
};

export default function MediaCard({
  id,
  thumbnailUrl,
  type,
  createdAt,
  sourceTweetUrl,
  onDelete,
}: MediaCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleClick = () => {
    if (sourceTweetUrl) {
      chrome.tabs.create({ url: sourceTweetUrl });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(id);
  };

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-x-border-light dark:bg-x-border-dark aspect-square cursor-pointer"
      onClick={handleClick}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">
        {BADGE_MAP[type]}
      </span>

      <span className="absolute bottom-1.5 left-1.5 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
        {createdAt}
      </span>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-50"
        title="Delete"
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 005.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
        </svg>
      </button>
    </div>
  );
}
