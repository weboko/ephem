import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PersistentStorage module
 * Used to store data that persists across app restarts
 */
class PersistentStorage {
  /**
   * Store a value with the given key
   * @param key The key to store the value under
   * @param value The value to store
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data in PersistentStorage:', error);
    }
  }

  /**
   * Retrieve a value by key
   * @param key The key to retrieve
   * @param defaultValue Value to return if key doesn't exist
   * @returns The stored value or defaultValue if not found
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return defaultValue;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('Error retrieving data from PersistentStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove a stored key-value pair
   * @param key The key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from PersistentStorage:', error);
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing PersistentStorage:', error);
    }
  }

  /**
   * Get all keys stored in the storage
   * @returns Array of all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys from PersistentStorage:', error);
      return [];
    }
  }
}

// Export a singleton instance
export default new PersistentStorage();