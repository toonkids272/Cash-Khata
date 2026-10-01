/**
 * Google AdMob Production Configuration
 *
 * AdMob App ID: ca-app-pub-2290313694944386~9326363627
 * AdMob Publisher ID: ca-app-pub-2290313694944386
 * Native Ad Unit ID: ca-app-pub-2290313694944386/4138535992
 * Interstitial Ad Unit ID: ca-app-pub-2290313694944386/3619661243
 */

export const ADMOB_CONFIG = {
  // Google AdMob Application ID (Used in AndroidManifest.xml & HTML meta)
  appId: 'ca-app-pub-2290313694944386~9326363627',

  // Google AdMob / AdSense Publisher ID
  publisherId: 'ca-app-pub-2290313694944386',

  // 1. Native Ad Unit
  native: {
    unitId: 'ca-app-pub-2290313694944386/4138535992',
    slotId: '4138535992',
  },

  // 2. Interstitial Ad Unit
  interstitial: {
    unitId: 'ca-app-pub-2290313694944386/3619661243',
    slotId: '3619661243',
    // Minimum seconds between interstitial displays to prevent spam and comply with AdMob policy
    cooldownSeconds: 90,
  },

  // 3. App Open Ad Unit
  appOpen: {
    unitId: 'ca-app-pub-2290313694944386/4138535992',
    slotId: '4138535992',
    frequencyCapMinutes: 30,
    skipCountdownSeconds: 5,
  },
};
