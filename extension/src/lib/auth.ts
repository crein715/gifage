import { supabase } from './supabase';

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'SIGN_IN_WITH_GOOGLE' },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: false, error: 'No response from background' });
        }
      }
    );
  });
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
