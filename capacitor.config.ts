import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulspce.harmoniqapp',
  appName: 'Harmoniq',
  webDir: 'apps/web/dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
