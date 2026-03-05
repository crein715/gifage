import type {
  Message,
  SaveMediaResponse,
  CheckAuthResponse,
  GetUserResponse,
} from '@/types';

type ResponseMap = {
  SAVE_MEDIA: SaveMediaResponse;
  CHECK_AUTH: CheckAuthResponse;
  GET_USER: GetUserResponse;
};

export function sendMessage<T extends Message>(
  message: T
): Promise<ResponseMap[T['type']]> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: ResponseMap[T['type']]) => {
      resolve(response);
    });
  });
}

export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(handler);
}
