# Expo 54 Android Dev Build Checklist

## Local prerequisites

- JDK 17 in `PATH`
- Android Studio with SDK, platform-tools and emulator installed
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` configured
- `platform-tools` and `emulator` added to `PATH`
- Running Android emulator or connected device visible in `adb devices`

## Recommended commands

```powershell
cd apps/mobile
yarn.cmd install
npx expo-doctor
npx tsc --noEmit
yarn.cmd test --runInBand
```

If native folders are not present yet:

```powershell
npx expo prebuild --platform android --clean
```

Build and run the development client:

```powershell
npx expo run:android
```

If Metro is not started automatically:

```powershell
npx expo start --dev-client --clear
```

## Mandatory smoke test order

1. Launch app, verify splash and app boot.
2. Login, kill app, relaunch, verify token restore and auto-login.
3. Logout and verify local auth cleanup.
4. Open profile settings and check avatar upload through image picker.
5. Open a regular chat, send text, attach file, reopen chat, verify message and attachment rendering.
6. Download a received file and verify it appears in Android media storage.
7. Reorder pinned chats in chats list and direct messages list.
8. Open fingerprint/TOTP related flows and verify clipboard copy actions.
9. Open an existing secret DM, send message, relaunch app, verify persisted history and key reuse.
10. Open an existing secret group, send message, relaunch app, verify persisted history.
11. Trigger secret group membership change or key rotation path and verify chat remains readable after rotation.

## High-risk areas after migration

- NativeWind v4 + Metro integration
- Reanimated v3 with Expo 54
- Secret chat local file storage under `document` directory
- File downloads to media library
- Custom GOST/E2EE runtime aliasing through Metro

## Known blocker on current machine

Current shell environment is not ready for Android builds:

- `adb` is missing from `PATH`
- `emulator` is missing from `PATH`
- `ANDROID_*` environment variables are not set
- installed Java is 1.8, while this app now needs a modern Android toolchain
