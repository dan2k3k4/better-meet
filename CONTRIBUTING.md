# Contributing

Thanks for helping! Bug reports, selector fixes, and translations are especially welcome.

## Run it locally

1. Clone the repo.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select the repo folder.
3. After editing, click the reload icon on the extension card, then reload your Meet tab.

There's no build step and there are no dependencies (`make zip` just packages the files for the store). Please keep it that way unless there's a strong reason not to.

## Where things live

| File | What it does |
|---|---|
| `content.js` | Runs on meet.google.com: join muted, the timer, and "someone is waiting" detection |
| `background.js` | Shows notifications; clicking one focuses Meet |
| `options.html` / `options.js` | The settings page |

Google Meet has no API for this, so `content.js` relies on Meet's page structure and its English text. **When Google changes Meet, that file is what breaks.** If a feature stops working, a PR updating the selectors is the most useful fix.

## Pull requests

- Keep changes small and focused, one fix or feature per PR.
- Describe how you tested it in a real Meet call.
- CI checks syntax and builds the zip. It must pass.

## Releasing (maintainers)

1. Bump `version` in `manifest.json` and commit.
2. `git tag -s vX.Y.Z -m "Better Meet vX.Y.Z" && git push --tags`
3. CI creates a GitHub Release with `better-meet.zip`. Upload that zip to the Chrome Web Store.

To build the same zip locally, run `make zip` (git ignores it).
