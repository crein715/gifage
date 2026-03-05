import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../lib/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleEmailAuth = async () => {
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const result = await signUpWithEmail(email, password);
      if (result.success) {
        if (result.needsConfirmation) {
          setNeedsConfirmation(true);
        } else {
          onLogin();
        }
      } else {
        setError(result.error || 'Sign up failed');
      }
    } else {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Sign in failed');
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Sign in failed');
    }

    setLoading(false);
  };

  if (needsConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white dark:bg-black px-8">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-x-text-light dark:text-x-text-dark mb-2">
          Check your email
        </h1>

        <p className="text-sm text-x-secondary-light dark:text-x-secondary-dark text-center mb-8 leading-relaxed">
          We sent a confirmation link to <strong className="text-x-text-light dark:text-x-text-dark">{email}</strong>. Click the link to activate your account.
        </p>

        <button
          onClick={() => {
            setNeedsConfirmation(false);
            setIsSignUp(false);
            setPassword('');
          }}
          className="text-sm text-brand font-semibold hover:opacity-80 transition-opacity"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] bg-white dark:bg-black px-8">
      <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 10h-3v3h-2v-3H8v-2h3V8h2v3h3v2z" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-x-text-light dark:text-x-text-dark mb-2">
        Gifage
      </h1>

      <p className="text-sm text-x-secondary-light dark:text-x-secondary-dark text-center mb-6 leading-relaxed">
        {isSignUp ? 'Create an account to get started' : 'Sign in to save and collect media from X'}
      </p>

      {error && (
        <div className="w-full mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEmailAuth();
        }}
        className="w-full flex flex-col gap-3"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white dark:bg-[#1d1d1d] border border-x-border-light dark:border-x-border-dark rounded-xl text-sm text-x-text-light dark:text-x-text-dark placeholder:text-x-secondary-light dark:placeholder:text-x-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 bg-white dark:bg-[#1d1d1d] border border-x-border-light dark:border-x-border-dark rounded-xl text-sm text-x-text-light dark:text-x-text-dark placeholder:text-x-secondary-light dark:placeholder:text-x-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isSignUp ? 'Creating account...' : 'Signing in...'}
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
        className="mt-3 text-sm text-brand font-medium hover:opacity-80 transition-opacity"
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
      </button>

      <div className="w-full flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-x-border-light dark:bg-x-border-dark" />
        <span className="text-xs text-x-secondary-light dark:text-x-secondary-dark">or</span>
        <div className="flex-1 h-px bg-x-border-light dark:bg-x-border-dark" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#1d1d1d] border border-x-border-light dark:border-x-border-dark rounded-full text-sm font-semibold text-x-text-light dark:text-x-text-dark hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </button>

      <p className="text-[11px] text-x-secondary-light dark:text-x-secondary-dark text-center mt-6 leading-relaxed">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
