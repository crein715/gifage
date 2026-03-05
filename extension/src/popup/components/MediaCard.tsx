import type { MediaType } from '@/types';

interface MediaCardProps {
  thumbnailUrl: string;
  type: MediaType;
  savedAt: number;
}

const BADGE_MAP: Record<MediaType, string> = {
  image: 'IMG',
  gif: 'GIF',
  video: 'VID',
};

export default function MediaCard({ thumbnailUrl, type, savedAt }: MediaCardProps) {
  const date = new Date(savedAt);
  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="group relative rounded-lg overflow-hidden bg-x-border-light dark:bg-x-border-dark aspect-square">
      <img
        src={thumbnailUrl}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">
        {BADGE_MAP[type]}
      </span>
      <span className="absolute bottom-1.5 left-1.5 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
        {formatted}
      </span>
    </div>
  );
}
