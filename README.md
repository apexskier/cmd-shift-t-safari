# ⌘⇧T

Tiny Safari extension that implements tab close history, inspired by Chrome's.

[Download](http://camlittle.com/files/cmd-shift-t_1.0.0.safariextz)

## Features

- ✅ Tab position support
- ✅ Multi window support
- ✅ Persistent storage (after quit)
- ✅ 1000 tab history
- ✅ Private browsing ignored
- ✅ Toolbar button

## Caveats

Due to Safari limitations, keyboard shortcut only works when a website's page
content is loaded. This means it won't work from the new tab page, or if your
internet connection is down. For a similar reason, this extension requires
global page access 😒.

This is a quick project to play with Apple's Safari Extensions framework, so
don't expect anything brilliant.

## Building

Install dev tools [jq](https://stedolan.github.io/jq/) and [xar](https://stedolan.github.io/jq/).

```sh
brew install jq xar
npm install
```

Set up your certificates directory (`certs`) as described in [Rob Wu's instructions](https://github.com/Rob--W/extension-dev-tools/tree/master/safari#building-automated-linuxmac).

`npm run build`
