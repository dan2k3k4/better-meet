const DEFAULTS = { muteMic: true, muteCam: true, notifyWaiting: true, timer: true, hotMic: true };
chrome.storage.sync.get(DEFAULTS, (opts) => {
  for (const key of Object.keys(DEFAULTS)) {
    const box = document.getElementById(key);
    box.checked = opts[key];
    box.onchange = () => chrome.storage.sync.set({ [key]: box.checked });
  }
});
