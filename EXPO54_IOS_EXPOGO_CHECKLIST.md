# Expo 54 iPhone Expo Go Checklist

## Why this path is worth trying

- This app is on Expo SDK 54
- Most native modules used here are Expo SDK modules
- `react-native-keyboard-controller` is supported in Expo Go on SDK 54
- For quick iPhone testing, Expo Go is simpler than an iOS dev build on Windows
- This project also has `expo-dev-client`, so plain `expo start` is not enough for Expo Go here; use `--go`

## Prerequisites

- Expo Go installed on the iPhone
- iPhone and Windows machine on the same network
- Backend already running
- `.env` contains the Windows machine LAN IP in `BASE_URL`

## Start the app for Expo Go

```powershell
cd D:\ararat\vs\messenger\apps\mobile
yarn.cmd install
yarn.cmd start:go
```

If the iPhone cannot connect to Metro over LAN:

```powershell
cd D:\ararat\vs\messenger\apps\mobile
yarn.cmd start:go:tunnel
```

## On the iPhone

1. Open Expo Go.
2. Scan the QR code from the terminal or browser.
3. Wait for the bundle to load.

## Important limitation

- `--tunnel` helps only with the Expo bundler connection.
- Your GraphQL and websocket endpoints still use the LAN IP from `.env`.
- So the iPhone must still reach `http://<BASE_URL>:4000/graphql` and `ws://<BASE_URL>:4000/graphql`.

## If Expo Go fails

Return to the EAS dev build path if you see runtime errors about missing native modules or unsupported native behavior.
