// Notification id carries tab/window ids so the (stateless) service worker can focus Meet on click.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== 'waiting' || !sender.tab) return;
  chrome.notifications.create(`waiting:${sender.tab.id}:${sender.tab.windowId}`, {
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Someone is waiting to join',
    message: msg.text || 'Open Meet to admit them.',
    priority: 2,
  });
});

chrome.notifications.onClicked.addListener((id) => {
  const [kind, tabId, windowId] = id.split(':');
  if (kind !== 'waiting') return;
  chrome.windows.update(Number(windowId), { focused: true });
  chrome.tabs.update(Number(tabId), { active: true });
  chrome.notifications.clear(id);
});
