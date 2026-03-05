import { saveMedia } from '../lib/media-service';
import { getSession } from '../lib/auth';
import type { DetectedMedia } from '../types';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Gifage extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_MEDIA') {
    handleSaveMedia(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'CHECK_AUTH') {
    getSession().then((session) => {
      sendResponse({ authenticated: !!session });
    });
    return true;
  }

  if (message.type === 'GET_USER') {
    getSession().then((session) => {
      sendResponse({ user: session?.user || null });
    });
    return true;
  }

  return true;
});

async function handleSaveMedia(payload: {
  media: DetectedMedia;
  tweetUrl: string;
  tweetAuthor: string;
}) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: 'Not logged in. Open the Gifage popup to sign in.',
    };
  }

  return saveMedia(payload.media, payload.tweetUrl, payload.tweetAuthor);
}
