import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crowdcounter.app',
  appName: 'CrowdCounterApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
