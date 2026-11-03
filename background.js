// Notification ids carry tab/window ids so the (stateless) service worker can focus Meet on click.
const NOTIFY = {
  waiting: (text) => ({ title: 'Someone is waiting to join', message: text || 'Open Meet to admit them.' }),
  hotmic: () => ({
    title: 'Your mic is on in Meet',
    message: 'You left the Meet tab with your microphone on.',
    buttons: [{ title: 'Mute' }],
  }),
};
const BADGE = { live: ['ON', '#1e8e3e'], muted: ['OFF', '#d93025'] };

// ponytail: tracks one call; if two Meet tabs are in calls, the last one to report wins.
async function setMic(tabId, state) {
  const { meetTab } = await chrome.storage.session.get('meetTab');
  if (!state && meetTab !== tabId) return;
  await chrome.storage.session.set({ meetTab: state ? tabId : null });
  const [text, color] = BADGE[state] || [''];
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
}

async function sendMic(type, tabId) {
  tabId ??= (await chrome.storage.session.get('meetTab')).meetTab;
  if (tabId) chrome.tabs.sendMessage(tabId, { type }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!sender.tab) return;
  if (msg.type === 'mic') return void setMic(sender.tab.id, msg.state);
  if (!NOTIFY[msg.type]) return;
  chrome.notifications.create(`${msg.type}:${sender.tab.id}:${sender.tab.windowId}`, {
    type: 'basic',
    iconUrl: 'icon.png',
    priority: 2,
    ...NOTIFY[msg.type](msg.text),
  });
});

chrome.commands.onCommand.addListener((cmd) => cmd === 'toggle-mic' && sendMic('mic-toggle'));
chrome.action.onClicked.addListener(() => sendMic('mic-toggle'));

// Clear the badge when the call's tab closes or navigates (it re-reports if still in a call).
chrome.tabs.onRemoved.addListener((tabId) => setMic(tabId, null));
chrome.tabs.onUpdated.addListener((tabId, info) => info.status === 'loading' && setMic(tabId, null));

chrome.notifications.onClicked.addListener((id) => {
  const [kind, tabId, windowId] = id.split(':');
  if (!NOTIFY[kind]) return;
  chrome.windows.update(Number(windowId), { focused: true });
  chrome.tabs.update(Number(tabId), { active: true });
  chrome.notifications.clear(id);
});

chrome.notifications.onButtonClicked.addListener((id) => {
  const [kind, tabId] = id.split(':');
  if (kind === 'hotmic') sendMic('mic-mute', Number(tabId));
  chrome.notifications.clear(id);
});
