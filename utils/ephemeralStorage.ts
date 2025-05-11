/**
 * EphemeralStorage module
 * Used to store data that only persists during the current app session
 * When the app is closed, all data is automatically cleared
 */
class EphemeralStorage {
  private storage: Map<string, any> = new Map();
  private cleanupCallbacks: Map<string, () => void> = new Map();

  /**
   * Store a value with the given key
   * @param key The key to store the value under
   * @param value The value to store
   */
  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  /**
   * Retrieve a value by key
   * @param key The key to retrieve
   * @param defaultValue Value to return if key doesn't exist
   * @returns The stored value or defaultValue if not found
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (this.storage.has(key)) {
      return this.storage.get(key) as T;
    }
    return defaultValue;
  }

  /**
   * Remove a stored key-value pair
   * @param key The key to remove
   */
  remove(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    // Run any registered cleanup callbacks before clearing
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error running cleanup callback:', error);
      }
    });
    
    this.storage.clear();
    console.log('Ephemeral storage cleared');
  }

  /**
   * Register a callback to be executed when storage is cleared
   * Useful for performing additional cleanup when app is closing
   * @param id Unique identifier for the callback
   * @param callback Function to execute on storage clear
   */
  registerCleanupCallback(id: string, callback: () => void): void {
    this.cleanupCallbacks.set(id, callback);
  }

  /**
   * Remove a previously registered cleanup callback
   * @param id Identifier of the callback to remove
   */
  unregisterCleanupCallback(id: string): void {
    this.cleanupCallbacks.delete(id);
  }

  /**
   * Get all keys stored in the storage
   * @returns Array of all keys
   */
  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Get the number of items in storage
   * @returns The number of stored items
   */
  size(): number {
    return this.storage.size;
  }
}

// Export a singleton instance
export default new EphemeralStorage();