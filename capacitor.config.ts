import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Soulspce.harmoniq.app',
  appName: 'Harmoniq',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
