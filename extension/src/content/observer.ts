import { injectButton } from './injector';

const TWEET_SELECTOR = 'article[data-testid="tweet"]';
const GIFAGE_ATTR = 'data-gifage-processed';

function processTweet(tweet: Element): void {
  tweet.setAttribute(GIFAGE_ATTR, 'true');
  injectButton(tweet);
}

export function startObserver(): void {
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      const tweets = document.querySelectorAll(
        `${TWEET_SELECTOR}:not([${GIFAGE_ATTR}])`
      );
      tweets.forEach(processTweet);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document
    .querySelectorAll(`${TWEET_SELECTOR}:not([${GIFAGE_ATTR}])`)
    .forEach(processTweet);
}
