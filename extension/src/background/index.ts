import { saveMedia } from '../lib/media-service';
import { getSession } from '../lib/auth';
import { supabase } from '../lib/supabase';
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

  if (message.type === 'SIGN_IN_WITH_GOOGLE') {
    handleSignIn().then(sendResponse);
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

async function handleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectUrl = `https://${chrome.runtime.id}.chromiumapp.org/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { success: false, error: error?.message || 'Failed to get auth URL' };
    }

    const responseUrl = await new Promise<string>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: data.url, interactive: true },
        (callbackUrl) => {
          if (chrome.runtime.lastError || !callbackUrl) {
            reject(new Error(chrome.runtime.lastError?.message || 'Auth flow cancelled'));
          } else {
            resolve(callbackUrl);
          }
        }
      );
    });

    const url = new URL(responseUrl);
    const hashParams = new URLSearchParams(url.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      const code = url.searchParams.get('code');
      if (code) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) return { success: false, error: sessionError.message };
        return { success: true };
      }
      return { success: false, error: 'No tokens in callback' };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) return { success: false, error: sessionError.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
