import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PIN_KEY = '@tradex_pin_hash';
const PIN_LOCK_KEY = '@tradex_pin_lock_enabled';

/**
 * Hash PIN using SHA-256
 */
async function hashPIN(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

/**
 * Set a new PIN
 */
export async function setPIN(pin: string): Promise<void> {
  const hash = await hashPIN(pin);
  await AsyncStorage.setItem(PIN_KEY, hash);
}

/**
 * Verify if entered PIN matches stored PIN
 */
export async function verifyPIN(pin: string): Promise<boolean> {
  const storedHash = await AsyncStorage.getItem(PIN_KEY);
  if (!storedHash) return false;
  
  const enteredHash = await hashPIN(pin);
  return storedHash === enteredHash;
}

/**
 * Check if a PIN has been set
 */
export async function hasPIN(): Promise<boolean> {
  const hash = await AsyncStorage.getItem(PIN_KEY);
  return hash !== null;
}

/**
 * Remove stored PIN
 */
export async function removePIN(): Promise<void> {
  await AsyncStorage.removeItem(PIN_KEY);
  await AsyncStorage.setItem(PIN_LOCK_KEY, 'false');
}

/**
 * Check if PIN lock is enabled
 */
export async function isPinLockEnabled(): Promise<boolean> {
  const enabled = await AsyncStorage.getItem(PIN_LOCK_KEY);
  return enabled === 'true';
}

/**
 * Enable or disable PIN lock
 */
export async function setPinLockEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PIN_LOCK_KEY, enabled ? 'true' : 'false');
}
