# Ephem

Ephem is a ephemeral messaging application built with React Native that uses Waku protocol for secure, private communication.

Specification of the application - [EPHEM-001.md](./EPHEM-001.md).

WARN: for now only works on Browser build.

## Description

Ephem uses only ephemeral messaging from Waku:
- [js-waku](https://github.com/waku-org/js-waku) family of libraries;
- [LightPush](https://github.com/vacp2p/rfc-index/blob/main/waku/standards/core/19/lightpush.md);
- [Filter](https://github.com/vacp2p/rfc-index/blob/main/waku/standards/core/12/filter.md);

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- For mobile development:
  - iOS: XCode and CocoaPods (for iOS simulator)
  - Android: Android Studio with SDK and emulator

## Running the Application

### Mobile Development

Start the Expo development server:

```bash
npm start
```

This will display a QR code and options to run the app:

- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go app on your physical device

Alternatively, you can use these direct commands:

```bash
# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

## Building for Production

### Web Build

Create a production build for web deployment:

```bash
npm run build:web
```

This will generate the build in the `dist` directory.

### Deploy to GitHub Pages

The project is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This runs the build process and deploys to GitHub Pages.

## Application Structure

- `app/` - Main application code using file-based routing
- `components/` - Reusable UI components
- `context/` - React context providers for state management
- `services/` - Core functionality services
- `utils/` - Utility functions

## Features

- Secure messaging via Waku protocol
- QR code connectivity
- Contact management
- End-to-end encryption
