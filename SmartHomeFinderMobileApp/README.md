# SmartHomeFinder Mobile App

## Local development and device testing

The mobile app uses an API base URL that can be configured for physical device testing.

### `app.json` configuration

Open `SmartHomeFinderMobileApp/app.json` and set the `expo.extra.apiBaseUrl` value to your machine's local IP address, for example:

```json
"extra": {
  "apiBaseUrl": "http://192.168.1.100:5000"
}
```

### How it works

The app resolves the API base URL in this order:

1. `EXPO_PUBLIC_API_BASE_URL` environment variable
2. `expo.extra.apiBaseUrl` from `app.json`
3. fallback based on device/emulator platform

### Recommended setup

- Start the backend on port `5000`
- Use your computer's LAN IP address in `app.json`
- Make sure your phone and computer are on the same network

### Example

```json
"extra": {
  "apiBaseUrl": "http://10.0.1.25:5000"
}
```

Then restart Expo and open the app on your physical device.
