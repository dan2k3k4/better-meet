# Better Meet

**Better Meet for Google Meet**: a small Chrome extension that makes Google Meet a bit more like Zoom.

- **Join muted**: turns your microphone and/or camera off on the "join this call?" page.
- **Mute from any tab**: press ⌥M (Alt+M) or click the toolbar icon to mute or unmute, whichever tab you're on. The icon shows **ON** (green) while your mic is live and **OFF** (red) while it's muted. You can change the shortcut at `chrome://extensions/shortcuts`. To make it work even when Chrome isn't focused, set it to Global there; Chrome only allows Ctrl+Shift+0–9 for global shortcuts.
- **Hot-mic alert**: a notification if you leave the Meet tab with your mic on, with a **Mute** button.
- **Someone's waiting**: sends a macOS/system notification when someone asks to join and Meet isn't focused. Click it to jump back to Meet and admit them.
- **Time in call**: shows how long you've been in the call, both in the bottom bar and in the window title. Leaving and rejoining resets it.

You can turn each feature on or off in the extension's options. Changes apply when you next open or reload a Meet.

Not affiliated with or endorsed by Google.

## Install (development)

1. `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick this folder.
2. Allow Chrome notifications: macOS System Settings → Notifications → Google Chrome.

## Tips: always use the right Google account

If one Chrome profile is signed into several Google accounts, Meet often opens in the wrong one. Two fixes, no code needed:

**A. A Meet-only Chrome profile.** Create a Chrome profile signed into just your work account. Open Meet there and install it as an app (⋮ → Cast, save and share → Install page as app). You get a separate Dock icon that's always on the right account.

**B. Route links with [Finicky](https://github.com/johnste/finicky).** This sends Meet links from Notion, Slack and so on to the right profile and/or account (Finicky v4 config):

```js
export default {
  defaultBrowser: "Google Chrome",
  rewrite: [{
    match: "meet.google.com/*",
    url: (url) => { url.searchParams.set("authuser", "you@work.com"); return url; },
  }],
  handlers: [{
    match: "meet.google.com/*",
    browser: { name: "Google Chrome", profile: "Work" }, // optional, for option A
  }],
};
```

## How it works / when it breaks

Google offers no API for building a Meet client, so this extension reads and clicks Meet's own page. When Google changes Meet's UI, selectors in `content.js` may need updating. Text matching is English-only for now. PRs welcome.

## More

- [Contributing](CONTRIBUTING.md)
- [Privacy policy](PRIVACY.md): no data is collected
- [Security policy](SECURITY.md)

## License

MIT
