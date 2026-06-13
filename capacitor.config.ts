import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulspce.harmoniqapp',
  appName: 'Harmoniq',
  webDir: 'apps/web/dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    // Declares to App Store Connect that the app uses only standard OS/HTTPS
    // encryption (exempt), suppressing the "Missing Compliance" warning.
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
};

export default config;
