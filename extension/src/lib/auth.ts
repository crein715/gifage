import { supabase } from './supabase';

const REDIRECT_URL = `https://${chrome.runtime.id}.chromiumapp.org/`;

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return {
        success: false,
        error: error?.message || 'Failed to get auth URL',
      };
    }

    const responseUrl = await new Promise<string>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: data.url, interactive: true },
        (callbackUrl) => {
          if (chrome.runtime.lastError || !callbackUrl) {
            reject(
              new Error(
                chrome.runtime.lastError?.message || 'Auth flow cancelled'
              )
            );
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
        const { error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
          return { success: false, error: sessionError.message };
        }
        return { success: true };
      }
      return { success: false, error: 'No tokens in callback' };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
