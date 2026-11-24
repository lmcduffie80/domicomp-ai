import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.agrovus.domicompai",
  appName: "DomiComp AI",
  // Load the live production URL — API routes, auth, and DB all stay on Vercel
  server: {
    url: "https://domicomp-ai.com",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    scrollEnabled: false,
    limitsNavigationsToAppBoundDomains: true,
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
