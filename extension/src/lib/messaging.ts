import type { Message, SaveMediaResponse } from '@/types';

export function sendMessage(message: Message): Promise<SaveMediaResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: SaveMediaResponse) => {
      resolve(response);
    });
  });
}

export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: SaveMediaResponse) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(handler);
}
