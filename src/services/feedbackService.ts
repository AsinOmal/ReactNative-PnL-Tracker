import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

// Configure your feedback email here
const FEEDBACK_EMAIL = 'wwasinomal@gmail.com';

/**
 * Send feedback email with device and app info
 */
export async function sendFeedbackEmail(userEmail?: string): Promise<void> {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'N/A';
  const osInfo = `${Platform.OS} ${Platform.Version}`;
  
  const subject = encodeURIComponent('TradeX App Feedback');
  const body = encodeURIComponent(`
Hi TradeX Team,

[Write your feedback here]

---
App Info:
- Version: ${appVersion} (${buildNumber})
- Platform: ${osInfo}
${userEmail ? `- User: ${userEmail}` : ''}
`);

  const mailtoUrl = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  
  const canOpen = await Linking.canOpenURL(mailtoUrl);
  if (canOpen) {
    await Linking.openURL(mailtoUrl);
  } else {
    throw new Error('Unable to open email client. Please send feedback to ' + FEEDBACK_EMAIL);
  }
}

/**
 * Send support request email
 */
export async function sendSupportEmail(userEmail?: string): Promise<void> {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'N/A';
  const osInfo = `${Platform.OS} ${Platform.Version}`;
  
  const subject = encodeURIComponent('TradeX Support Request');
  const body = encodeURIComponent(`
Hi Support Team,

[Describe your issue here]

---
Debug Info:
- Version: ${appVersion} (${buildNumber})
- Platform: ${osInfo}
${userEmail ? `- User: ${userEmail}` : ''}
`);

  const mailtoUrl = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  
  const canOpen = await Linking.canOpenURL(mailtoUrl);
  if (canOpen) {
    await Linking.openURL(mailtoUrl);
  } else {
    throw new Error('Unable to open email client. Please email us at ' + FEEDBACK_EMAIL);
  }
}

/**
 * Get the feedback email address
 */
export function getFeedbackEmail(): string {
  return FEEDBACK_EMAIL;
}
