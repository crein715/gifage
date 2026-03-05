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

export async function signInWithEmail(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
}> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };

  if (data.user && !data.session) {
    return { success: true, needsConfirmation: true };
  }
  return { success: true };
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
