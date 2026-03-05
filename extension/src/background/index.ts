chrome.runtime.onInstalled.addListener(() => {
  console.log('Gifage extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_MEDIA') {
    console.log('Save media request:', message.payload);
    sendResponse({ success: false, error: 'Not implemented yet' });
  }
  return true;
});
