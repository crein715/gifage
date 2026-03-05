export type MediaType = 'image' | 'gif' | 'video';

export interface DetectedMedia {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
}

export function detectMedia(tweetEl: Element): DetectedMedia[] {
  const media: DetectedMedia[] = [];

  const photos = tweetEl.querySelectorAll('[data-testid="tweetPhoto"] img');
  photos.forEach((img) => {
    const src = (img as HTMLImageElement).src;
    if (src && src.includes('pbs.twimg.com/media')) {
      media.push({
        type: 'image',
        url: src.replace(/&name=\w+$/, '&name=large'),
        thumbnailUrl: src.replace(/&name=\w+$/, '&name=small'),
      });
    }
  });

  const gifVideos = tweetEl.querySelectorAll('[data-testid="tweetPhoto"] video');
  gifVideos.forEach((video) => {
    const src = (video as HTMLVideoElement).src;
    if (src) {
      media.push({
        type: 'gif',
        url: src,
        thumbnailUrl: (video as HTMLVideoElement).poster || undefined,
      });
    }
  });

  const videoPlayers = tweetEl.querySelectorAll(
    '[data-testid="videoPlayer"] video, [data-testid="videoComponent"] video'
  );
  videoPlayers.forEach((video) => {
    const src = (video as HTMLVideoElement).src;
    if (src && !media.some((m) => m.url === src)) {
      media.push({
        type: 'video',
        url: src,
        thumbnailUrl: (video as HTMLVideoElement).poster || undefined,
      });
    }
  });

  return media;
}
