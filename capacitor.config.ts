import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.insite.app',
  appName: 'InSiteApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
