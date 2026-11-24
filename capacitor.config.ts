import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.agrovus.domicompai",
  appName: "DomiComp AI",
  webDir: "www", // Vite builds mobile/src → www/
  // Dev only: uncomment below to point at local Vite dev server for hot reload
  // server: { url: "http://192.168.x.x:5173", cleartext: true },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: "#ffffff",
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0d1f17",
      iosSpinnerStyle: "small",
      spinnerColor: "#6ee7b7",
      showSpinner: false,
      androidSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0d1f17",
    },
    Camera: {
      presentationStyle: "fullscreen",
    },
  },
};

export default config;
