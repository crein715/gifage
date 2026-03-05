import { detectMedia } from './media-detector';
import type { DetectedMedia } from './media-detector';

const SAVE_ICON_PATH =
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z';

const SAVED_ICON_PATH =
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 10h-3v3h-2v-3H8v-2h3V8h2v3h3v2z';

function getTweetUrl(tweetEl: Element): string {
  const timeLink = tweetEl.querySelector('a[href*="/status/"] time');
  if (timeLink) {
    const anchor = timeLink.closest('a');
    if (anchor) {
      return anchor.href;
    }
  }
  const statusLink = tweetEl.querySelector('a[href*="/status/"]');
  if (statusLink) {
    return (statusLink as HTMLAnchorElement).href;
  }
  return window.location.href;
}

function getTweetAuthor(tweetEl: Element): string {
  const userNameEl = tweetEl.querySelector('[data-testid="User-Name"]');
  if (userNameEl) {
    const links = userNameEl.querySelectorAll('a[href^="/"]');
    for (const link of links) {
      const href = (link as HTMLAnchorElement).pathname;
      if (href && !href.includes('/status/') && href !== '/') {
        return href.replace(/^\//, '@');
      }
    }
  }
  const authorLink = tweetEl.querySelector(
    'a[role="link"][href^="/"][tabindex="-1"]'
  );
  if (authorLink) {
    const href = (authorLink as HTMLAnchorElement).pathname;
    return href.replace(/^\//, '@');
  }
  return '';
}

type ToastType = 'success' | 'error' | 'info';

function showToast(
  button: HTMLElement,
  message: string,
  type: ToastType
): void {
  const existing = button.querySelector('.gifage-toast');
  if (existing) existing.remove();

  const toast = document.createElement('span');
  toast.className = `gifage-toast gifage-toast-${type}`;
  toast.textContent = message;
  button.style.position = 'relative';
  button.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('gifage-toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('gifage-toast-visible');
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

function createButton(media: DetectedMedia[], tweetUrl: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'gifage-btn';
  container.setAttribute('role', 'button');
  container.setAttribute('tabindex', '0');
  container.setAttribute('data-gifage-saved', 'false');

  const inner = document.createElement('div');
  inner.className = 'gifage-btn-inner';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'gifage-icon-wrap';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', SAVE_ICON_PATH);
  g.appendChild(path);
  svg.appendChild(g);
  iconWrap.appendChild(svg);
  inner.appendChild(iconWrap);

  const tooltip = document.createElement('span');
  tooltip.className = 'gifage-tooltip';
  tooltip.textContent = 'Save to Gifage';

  container.appendChild(inner);
  container.appendChild(tooltip);

  const handleSave = async () => {
    const isSaved = container.getAttribute('data-gifage-saved') === 'true';
    if (isSaved) return;

    const tweetEl = container.closest('article[data-testid="tweet"]');
    const tweetAuthor = tweetEl ? getTweetAuthor(tweetEl) : '';

    try {
      const authResponse = await chrome.runtime.sendMessage({
        type: 'CHECK_AUTH',
      });

      if (!authResponse?.authenticated) {
        showToast(container, 'Sign in first \u2014 click the Gifage icon', 'info');
        return;
      }

      container.setAttribute('data-gifage-saved', 'true');
      path.setAttribute('d', SAVED_ICON_PATH);

      const primaryMedia = media[0];
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_MEDIA',
        payload: { media: primaryMedia, tweetUrl, tweetAuthor },
      });

      if (chrome.runtime.lastError) {
        container.setAttribute('data-gifage-saved', 'false');
        path.setAttribute('d', SAVE_ICON_PATH);
        showToast(container, 'Failed to save \u2014 try again', 'error');
        return;
      }

      if (response?.success) {
        showToast(container, '\u2713 Saved to Gifage', 'success');
      } else if (response?.error === 'Already saved') {
        showToast(container, 'Already in your collection', 'info');
      } else {
        container.setAttribute('data-gifage-saved', 'false');
        path.setAttribute('d', SAVE_ICON_PATH);
        showToast(
          container,
          response?.error || 'Failed to save \u2014 try again',
          'error'
        );
      }
    } catch {
      container.setAttribute('data-gifage-saved', 'false');
      path.setAttribute('d', SAVE_ICON_PATH);
      showToast(container, 'Failed to save \u2014 try again', 'error');
    }
  };

  container.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSave();
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  });

  return container;
}

function matchSiblingStyle(button: HTMLElement, actionGroup: Element): void {
  const sibling = actionGroup.querySelector(
    '[data-testid="bookmark"], [data-testid="like"], [data-testid="reply"]'
  );
  if (!sibling) return;

  const siblingEl = sibling as HTMLElement;
  const computed = window.getComputedStyle(siblingEl);

  button.style.display = computed.display || 'flex';
  button.style.alignItems = 'center';
  button.style.alignSelf = computed.alignSelf || 'stretch';
  button.style.flexDirection = computed.flexDirection || 'row';

  const padding = computed.paddingTop;
  if (padding) {
    button.style.paddingTop = padding;
    button.style.paddingBottom = padding;
  }
}

export function injectButton(tweetEl: Element): void {
  const actionGroup = tweetEl.querySelector('div[role="group"]');
  if (!actionGroup) return;

  if (actionGroup.querySelector('.gifage-btn')) return;

  const media = detectMedia(tweetEl);
  if (media.length === 0) return;

  const tweetUrl = getTweetUrl(tweetEl);
  const button = createButton(media, tweetUrl);

  matchSiblingStyle(button, actionGroup);

  const children = Array.from(actionGroup.children);
  const lastChild = children[children.length - 1];
  if (lastChild) {
    actionGroup.insertBefore(button, lastChild);
  } else {
    actionGroup.appendChild(button);
  }
}
