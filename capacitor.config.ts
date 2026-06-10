import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulspce.harmoniqapp',
  appName: 'Harmoniq',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
