import { useStorage } from 'vue3-storage'
import CryptoJS from 'crypto-js'
const storage = useStorage()
const ENCRYPTION_KEY = process.env.VUE_APP_STORAGE_ENCRYPTION_KEY;

// instance on controlling the safe storage and retrieval of the data
export const secureStorage = {
  setItem(key, value) {
    const encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(value), ENCRYPTION_KEY).toString()
    storage.setStorageSync(key, encryptedValue)
  },

  getItem(key) {
    const encryptedValue = storage.getStorageSync(key)
    if (!encryptedValue) return null
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    try {
      return JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error('Failed to decrypt value:', e)
      return null;
    }
  },

  removeItem(key) {
    storage.removeStorageSync(key)
  },

  clear() {
    storage.clearStorageSync()
  }
}