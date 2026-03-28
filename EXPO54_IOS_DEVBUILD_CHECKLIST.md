# Expo 54 iPhone Dev Build Checklist

## What is already configured

- `ios.bundleIdentifier` is set to `com.vadimteacoder.client`
- `eas.json` contains a `development` profile for iPhone dev builds
- `package.json` contains helper scripts:
  - `yarn.cmd ios:project:init`
  - `yarn.cmd ios:device:register`
  - `yarn.cmd ios:build:dev`
  - `yarn.cmd start:dev-client`

## Hard limitation on Windows

- You cannot use `npx expo run:ios` or the iOS Simulator on Windows.
- For a real iPhone, this project must use an EAS cloud build.

## One-time prerequisites

- Expo account
- Apple Developer account
- iPhone on iOS 16+ with Developer Mode enabled
- iPhone must reach the backend host from `.env`
- `BASE_URL` in `.env` must be your Windows machine LAN IP, not `localhost`

## First install on iPhone

```powershell
cd D:\ararat\vs\messenger\apps\mobile
yarn.cmd install
npx expo-doctor
npx expo config --type public
yarn.cmd ios:project:init
yarn.cmd ios:device:register
```

During `ios:project:init`:

1. Log in to your Expo account when prompted.
2. Choose your own Expo account as the project owner.
3. Confirm creation of a new EAS project for this app.

During `ios:device:register`:

1. Log in to your Apple Developer account when prompted.
2. Choose the web-based device registration flow.
3. Open the generated link on the iPhone.
4. Download and install the provisioning profile on the iPhone.

Then create the first dev build:

```powershell
cd D:\ararat\vs\messenger\apps\mobile
yarn.cmd ios:build:dev
```

During `ios:build:dev`:

1. Log in to Expo if prompted.
2. Log in to Apple if prompted.
3. Select the registered iPhone for the ad hoc development build.
4. Wait until the cloud build finishes.
5. Open the build install link or QR code on the iPhone and install the app.

## First launch on iPhone

- If iOS asks to enable Developer Mode, go to `Settings > Privacy & Security > Developer Mode`.
- Reboot the iPhone when asked by iOS.
- Confirm `Turn On` after reboot.
- Launch the installed dev build again.

## Daily development loop after the app is installed

Make sure backend services are already running and reachable from the iPhone.

```powershell
cd D:\ararat\vs\messenger\apps\mobile
yarn.cmd start:dev-client
```

Then:

1. Open the installed app on the iPhone.
2. Connect it to the running Expo dev server.
3. Reload from the dev menu when needed.

## When you must rebuild

Create a new iPhone dev build if:

- you changed native Expo config or native dependencies
- you registered a new iPhone device
- you removed the app from the iPhone

## Known project-specific notes

- This app uses `expo-dev-client`, so `Expo Go` is not the main path here.
- The `start:dev-client` script runs GraphQL codegen first, so the backend GraphQL endpoint must already be up.
- The current `.env` points to a LAN IP. Keep the iPhone on the same network.
- If this project was linked to another Expo account before, `ios:project:init` creates a new EAS project under your account.
