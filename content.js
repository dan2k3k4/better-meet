// ponytail: Meet has no API, so this scrapes its DOM. Text/aria matches are English-only;
// when Meet changes its UI, fix the selectors in this file first.
const DEFAULTS = { muteMic: true, muteCam: true, notifyWaiting: true, timer: true };
const TITLE_PREFIX = /^\d+:\d\d:\d\d · /;

chrome.storage.sync.get(DEFAULTS, (opts) => {
  const muted = { mic: !opts.muteMic, cam: !opts.muteCam }; // true = already handled
  let joinedAt = null;
  let badge = null;
  let lastNotified = 0;

  const inCall = () =>
    !!document.querySelector('[aria-label="Leave call"], [jsname="CQylAd"]');

  // Mute once on the "join this call?" page; never re-mute after the user unmutes.
  function muteBeforeJoin() {
    for (const [key, re] of [['mic', /microphone/i], ['cam', /camera/i]]) {
      if (muted[key]) continue;
      const btn = [...document.querySelectorAll('[data-is-muted]')]
        .find((el) => re.test(el.getAttribute('aria-label') || ''));
      if (!btn) continue;
      if (btn.getAttribute('data-is-muted') === 'false') btn.click();
      muted[key] = true;
    }
  }

  const hms = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  function updateTimer() {
    const base = document.title.replace(TITLE_PREFIX, '');
    if (!joinedAt) {
      if (document.title !== base) document.title = base;
      badge?.remove();
      badge = null;
      return;
    }
    const t = hms(Date.now() - joinedAt);
    document.title = `${t} · ${base}`;
    if (!badge?.isConnected) {
      // ponytail: anchor on the meeting code text in Meet's bottom-left bar (locale-proof).
      // If not found, only the window title shows the timer.
      const code = location.pathname.slice(1);
      const anchor = code && [...document.querySelectorAll('div, span')]
        .find((el) => el.childElementCount === 0 && el.textContent.trim() === code);
      if (anchor) {
        badge = document.createElement('span');
        badge.style.marginLeft = '8px';
        anchor.after(badge);
      }
    }
    if (badge) badge.textContent = `· ${t}`;
  }

  setInterval(() => {
    const now = inCall();
    if (now && !joinedAt) joinedAt = Date.now();
    if (!now) joinedAt = null; // leave/rejoin restarts from 0
    if (!now) muteBeforeJoin();
    if (opts.timer) updateTimer();
  }, 500);

  if (opts.notifyWaiting) {
    new MutationObserver((records) => {
      if (document.hasFocus() || Date.now() - lastNotified < 15000) return;
      for (const r of records) for (const n of r.addedNodes) {
        const text = n.textContent || '';
        if (/wants? to join/i.test(text)) {
          lastNotified = Date.now();
          chrome.runtime.sendMessage({ type: 'waiting', text: text.trim().slice(0, 120) });
          return;
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
});
