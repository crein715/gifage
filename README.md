# Gifage

Chrome Extension (Manifest V3) that injects a native-looking **Save to Gifage** button into X.com's tweet action bar. The button appears only on tweets containing media (images, GIFs, or videos).

## Project Structure

```
gifage/
├── extension/          # Chrome Extension source
│   ├── src/
│   │   ├── content/    # Content script (injected into X.com)
│   │   ├── popup/      # Extension popup (React + Tailwind)
│   │   ├── background/ # Service worker
│   │   ├── lib/        # Shared utilities
│   │   └── types/      # TypeScript types
│   ├── public/         # Static assets & manifest
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## Development

```bash
cd extension
npm install
npm run build
```

## Load in Chrome

1. Run `npm run build` inside `extension/`
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `extension/dist/` folder
5. Navigate to [x.com](https://x.com) — tweets with media will show a purple **Save to Gifage** button in the action bar

## Tech Stack

- **TypeScript** — full type safety
- **Vite** — fast bundling with multi-entry build
- **React 18** — popup UI
- **Tailwind CSS** — popup styling (content script uses inline styles)
- **Manifest V3** — modern Chrome Extension APIs

## How It Works

1. A `MutationObserver` watches for new tweets as the user scrolls
2. Each tweet is checked for media (`tweetPhoto`, `videoPlayer`, `videoComponent`)
3. Tweets with media get a **Save to Gifage** button injected into their action bar
4. The button matches X.com's native styling — same size, colors, hover effects
5. Clicking the button shows a "Saved!" toast (actual persistence coming in Task 2)
