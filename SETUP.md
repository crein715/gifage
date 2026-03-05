# Gifage — Deployment Guide

Step-by-step guide to go from zero to a working Gifage extension connected to Supabase.

---

## 1. Prerequisites

- **Node.js 18+** and **npm** — [nodejs.org](https://nodejs.org/)
- **Google account** — for OAuth provider setup
- **Supabase account** — free tier works ([supabase.com](https://supabase.com/))
- **Chrome browser**

---

## 2. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**
2. Choose an organization, enter a project name, set a database password, and select a region
3. Wait for the project to finish provisioning
4. Go to **Settings → API**
5. Note the following (you'll need them later):
   - **Project URL** → maps to `VITE_SUPABASE_URL`
   - **anon public key** → maps to `VITE_SUPABASE_ANON_KEY`

---

## 3. Run Database Migrations

1. In the Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy-paste the entire contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) into the editor
4. Click **Run**

This migration creates:

```sql
-- Creates: profiles, saved_media tables
-- Enables: RLS with per-user isolation
-- Trigger: auto-creates profile on signup
```

Specifically:

| Object | Purpose |
|---|---|
| `profiles` table | Stores display name and avatar, auto-populated on signup |
| `saved_media` table | Stores metadata for each saved image/GIF/video |
| `handle_new_user()` trigger | Automatically creates a profile row when a user signs up |
| RLS policies | Users can only read/update their own profile and CRUD their own saved media |

---

## 4. Configure Storage Bucket

1. In the Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy-paste the entire contents of [`supabase/storage-policies.sql`](./supabase/storage-policies.sql) into the editor
4. Click **Run**

This creates a **private** `media` bucket with per-user folder isolation — each user can only upload to, read from, and delete within their own `<user_id>/` folder.

**Alternative (manual approach):**

1. Go to **Storage** in the Supabase Dashboard
2. Click **New bucket**, name it `media`, and leave it as **private**
3. Then go back to **SQL Editor** and run just the three `CREATE POLICY` statements from `storage-policies.sql` (skip the `INSERT INTO storage.buckets` line since you created it manually)

---

## 5. Set Up Google OAuth

### In Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. If prompted, configure the OAuth consent screen first (External is fine for testing)
6. Application type: **Web application**
7. Under **Authorized redirect URIs**, add:
   ```
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   (Replace `<YOUR_SUPABASE_PROJECT_REF>` with your project ref from the Supabase project URL)
8. Click **Create** and copy the **Client ID** and **Client Secret**

### In Supabase Dashboard

1. Go to **Authentication → Providers → Google**
2. Toggle it **on**
3. Paste the **Client ID** and **Client Secret** from Google
4. Confirm the redirect URL shown by Supabase matches what you added in Google Cloud Console
5. Click **Save**

### Important: Chrome Extension OAuth

The extension uses `chrome.identity.launchWebAuthFlow()` which opens a browser popup for OAuth. The redirect URL in the auth flow is handled by the extension, not a web page. The Supabase Google provider config is needed so Supabase knows how to talk to Google's OAuth servers. You will add the extension-specific redirect URI in [Step 9](#9-configure-chrome-extension-oauth-redirect) after loading the extension.

---

## 6. Configure Environment Variables

```bash
cd extension
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
```

Both values come from **Settings → API** in your Supabase Dashboard (see [Step 2](#2-create-supabase-project)).

---

## 7. Build the Extension

```bash
cd extension
npm install
npm run build
```

This outputs the built extension to `extension/dist/`.

---

## 8. Load in Chrome

1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder
5. Note the **Extension ID** shown under the extension name — you'll need this for the next step

---

## 9. Configure Chrome Extension OAuth Redirect

After loading the extension in Step 8, Chrome assigns it an Extension ID (e.g., `abcdefghijklmnopqrstuvwxyz`).

1. The OAuth redirect URL for the extension follows this pattern:
   ```
   https://<EXTENSION_ID>.chromiumapp.org/
   ```
2. Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
3. Edit your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://<EXTENSION_ID>.chromiumapp.org/
   ```
   (Replace `<EXTENSION_ID>` with the actual ID from `chrome://extensions/`)
5. Click **Save**

The auth code in `extension/src/lib/auth.ts` uses `chrome.identity.getRedirectURL()` which generates this URL automatically, so it will match as long as the URI is registered in Google Cloud Console.

---

## 10. Test It

1. Navigate to [x.com](https://x.com)
2. Click the Gifage extension icon in the Chrome toolbar → you should see the login screen
3. Click **Sign in with Google** → an OAuth popup opens
4. Complete the Google sign-in flow
5. Scroll through tweets that contain media (images, GIFs, videos)
6. Look for the **Save to Gifage** button in tweet action bars
7. Click save → the media should upload to your Supabase storage bucket
8. Check the **Storage** tab in Supabase Dashboard to confirm the file appears under `media/<your-user-id>/`

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| **"Invalid redirect URI"** | Extension ID in Google Console doesn't match the loaded extension | Check `chrome://extensions/` for the correct Extension ID and update the redirect URI in Google Cloud Console |
| **OAuth popup closes immediately** | Supabase Google provider not enabled or credentials mismatch | Verify the Google provider is enabled in Supabase Authentication → Providers and that the Client ID/Secret match Google Console |
| **Save button doesn't appear** | Content script not injected or stale cache | Hard refresh X.com (`Ctrl+Shift+R`), check the browser console (`F12`) for errors |
| **Upload fails with 403** | Storage policies not applied | Re-run `supabase/storage-policies.sql` in the SQL Editor |
| **"RLS policy violation"** | Database migration not applied | Re-run `supabase/migrations/001_initial_schema.sql` in the SQL Editor |
| **Extension not loading** | Build output missing or stale | Run `npm run build` again in `extension/` and reload the extension in `chrome://extensions/` |
