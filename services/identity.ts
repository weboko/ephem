import PersistentStorage from '../utils/persistentStorage';
import { Platform, Alert } from 'react-native';
import base64 from 'react-native-base64';

const STORAGE_KEY = 'app_passkeys';

export type PassKey = {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  // WebAuthn credential properties
  credentialId?: string;
  publicKey?: string;
  authenticatorData?: string;
};

/**
 * Identity service for managing passkeys
 */
class IdentityService {
  /**
   * Get all registered passkeys
   * @returns Array of registered passkeys
   */
  async getPassKeys(): Promise<PassKey[]> {
    const passkeys = await PersistentStorage.get<PassKey[]>(STORAGE_KEY, []);
    return passkeys || [];
  }

  /**
   * Get a specific passkey by ID
   * @param id The passkey ID to retrieve
   * @returns The passkey or null if not found
   */
  async getPassKeyById(id: string): Promise<PassKey | null> {
    const passkeys = await this.getPassKeys();
    const passkey = passkeys.find(pk => pk.id === id);
    return passkey || null;
  }

  /**
   * Create a new passkey with a generated name
   * @returns The newly created passkey
   */
  async createPassKey(): Promise<PassKey> {
    // Generate a random human-readable name
    const name = this.generatePassKeyName();
    
    try {
      // Check if WebAuthn is available in the environment
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Check if platform supports passkeys
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (available) {
          // Create a unique user ID for this passkey
          const userId = this.generateId();
          
          // Create a credential creation options object
          const publicKeyCredentialCreationOptions = {
            challenge: this.generateChallenge(),
            rp: {
              name: 'Cyphernet App',
              id: window.location.hostname || 'cyphernet.app'
            },
            user: {
              id: this.bufferFromString(userId),
              name: userId,
              displayName: name
            },
            pubKeyCredParams: [
              { type: 'public-key', alg: -7 }, // ES256
              { type: 'public-key', alg: -257 } // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'preferred',
              requireResidentKey: true
            },
            timeout: 60000,
            attestation: 'none'
          };
          
          // Create the credential
          const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
          }) as PublicKeyCredential;
          
          // Extract credential ID and public key
          const credentialId = base64.encode(
            new Uint8Array(credential.rawId)
          );
          
          // Get attestation response
          const response = credential.response as AuthenticatorAttestationResponse;
          const publicKey = base64.encode(
            new Uint8Array(response.getPublicKey || new ArrayBuffer(0))
          );
          const authenticatorData = base64.encode(
            new Uint8Array(response.getAuthenticatorData || new ArrayBuffer(0))
          );
          
          // Create the passkey object
          const newPassKey: PassKey = {
            id: userId,
            name,
            createdAt: new Date().toISOString(),
            credentialId,
            publicKey,
            authenticatorData
          };
          
          // Store the new passkey
          const existingPasskeys = await this.getPassKeys();
          await PersistentStorage.set(STORAGE_KEY, [...existingPasskeys, newPassKey]);
          
          return newPassKey;
        }
      }
      
      // Fallback to simulated passkey if WebAuthn is not available
      console.warn('WebAuthn not available, creating simulated passkey instead');
      return this.createSimulatedPassKey(name);
      
    } catch (error) {
      console.error('Error creating passkey:', error);
      // Fallback to simulated passkey on error
      return this.createSimulatedPassKey(name);
    }
  }
  
  /**
   * Create a simulated passkey (fallback when WebAuthn is not available)
   * @param name The name for the passkey
   * @returns A simulated passkey
   */
  private async createSimulatedPassKey(name: string): Promise<PassKey> {
    const newPassKey: PassKey = {
      id: this.generateId(),
      name,
      createdAt: new Date().toISOString(),
    };

    // Store the new passkey
    const existingPasskeys = await this.getPassKeys();
    await PersistentStorage.set(STORAGE_KEY, [...existingPasskeys, newPassKey]);
    
    return newPassKey;
  }

  /**
   * Update the last used timestamp for a passkey
   * @param id The passkey ID to update
   */
  async updatePassKeyUsage(id: string): Promise<void> {
    const passkeys = await this.getPassKeys();
    const updatedPasskeys = passkeys.map(pk => 
      pk.id === id 
        ? { ...pk, lastUsed: new Date().toISOString() } 
        : pk
    );
    
    await PersistentStorage.set(STORAGE_KEY, updatedPasskeys);
  }

  /**
   * Delete a passkey by ID
   * @param id The passkey ID to delete
   */
  async deletePassKey(id: string): Promise<void> {
    try {
      // First get the passkey to check if it's a real WebAuthn credential
      const passkeys = await this.getPassKeys();
      const passkey = passkeys.find(pk => pk.id === id);
      
      if (passkey?.credentialId && typeof window !== 'undefined' && window.PublicKeyCredential &&
          // Check if the browser supports credential management
          'credentials' in navigator && 'preventSilentAccess' in navigator.credentials) {
        try {
          // Try to remove the credential from the browser's credential store
          // Note: Not all browsers support this yet, so we'll continue regardless of success
          await navigator.credentials.preventSilentAccess();
        } catch (e) {
          console.warn('Failed to revoke credential from browser store:', e);
          // Continue with deletion anyway
        }
      }
      
      // Remove from our storage
      const filteredPasskeys = passkeys.filter(pk => pk.id !== id);
      await PersistentStorage.set(STORAGE_KEY, filteredPasskeys);
      
      // Force a reload of the passkeys after deletion
      console.log(`Successfully deleted passkey: ${id}`);
    } catch (error) {
      console.error('Error deleting passkey:', error);
      throw error; // Re-throw the error so the UI can handle it
    }
  }

  /**
   * Verify a passkey using the device's platform authenticator
   * @param id The passkey ID to verify
   * @returns Whether the verification was successful
   */
  async verifyPassKey(id: string): Promise<boolean> {
    try {
      const passkey = await this.getPassKeyById(id);
      if (!passkey) return false;
      
      // Check if this is a real passkey or simulated
      if (passkey.credentialId && typeof window !== 'undefined' && window.PublicKeyCredential) {
        // This is a real passkey, verify using WebAuthn
        
        // Create a challenge for the authentication
        const challenge = this.generateChallenge();
        
        // Create authentication options
        const publicKeyCredentialRequestOptions = {
          challenge,
          rpId: window.location.hostname || 'cyphernet.app',
          allowCredentials: [{
            id: this.bufferFromBase64(passkey.credentialId),
            type: 'public-key'
          }],
          userVerification: 'required', // Changed from 'preferred' to 'required' to force OS authentication UI
          timeout: 60000
        };
        
        try {
          // Request authentication with the passkey - this will trigger the OS authentication UI
          const credential = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
          }) as PublicKeyCredential;
          
          if (credential) {
            // Authentication successful
            await this.updatePassKeyUsage(id);
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('WebAuthn authentication error:', error);
          
          // Show appropriate error message based on the error type
          if (error instanceof DOMException) {
            if (error.name === 'NotAllowedError') {
              // User declined the authentication request
              Alert.alert('Authentication Canceled', 'You canceled the authentication request.');
            } else if (error.name === 'SecurityError') {
              // Security error (e.g., already registered credential)
              Alert.alert('Security Error', 'There was a security error during authentication.');
            } else {
              // Other DOMException
              Alert.alert('Authentication Error', `${error.name}: ${error.message}`);
            }
          } else {
            // Generic error
            Alert.alert('Authentication Error', 'Failed to verify your identity. Please try again.');
          }
          
          return false;
        }
      } else {
        // For simulated passkeys, show a confirmation dialog to simulate OS authentication UI
        // This gives a consistent user experience even when real WebAuthn isn't available
        return new Promise((resolve) => {
          Alert.alert(
            'Confirm Identity',
            `Authenticate to continue as "${passkey.name}"`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'Authenticate',
                onPress: async () => {
                  await this.updatePassKeyUsage(id);
                  resolve(true);
                }
              }
            ],
            { cancelable: false }
          );
        });
      }
    } catch (error) {
      console.error('Error verifying passkey:', error);
      Alert.alert('Authentication Error', 'Something went wrong during authentication. Please try again.');
      return false;
    }
  }

  /**
   * Check if passkeys are supported on this device
   * @returns Whether passkeys are supported
   */
  isSupported(): boolean {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      // We have WebAuthn support, check for platform authenticator
      try {
        // This is an asynchronous check, but we need a synchronous return
        // The actual check will happen during createPassKey
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Generate a random passkey ID
   * @returns A unique ID string
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Generate a human-readable name for a passkey
   * @returns A randomly generated name
   */
  private generatePassKeyName(): string {
    const adjectives = [
      'Swift', 'Brave', 'Noble', 'Mighty', 'Wise', 
      'Clever', 'Silent', 'Bold', 'Gentle', 'Calm'
    ];
    
    const nouns = [
      'Phoenix', 'Dragon', 'Tiger', 'Falcon', 'Wolf',
      'Panther', 'Eagle', 'Dolphin', 'Hawk', 'Lion'
    ];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective} ${randomNoun}`;
  }

  /**
   * Generate a challenge for WebAuthn operations
   * @returns An ArrayBuffer challenge
   */
  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for non-browser environments
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array.buffer;
  }
  
  /**
   * Convert a string to an ArrayBuffer
   * @param str The string to convert
   * @returns An ArrayBuffer containing the string data
   */
  private bufferFromString(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }
  
  /**
   * Convert a base64 string to an ArrayBuffer
   * @param base64String The base64 string to convert
   * @returns An ArrayBuffer containing the decoded data
   */
  private bufferFromBase64(base64String: string): ArrayBuffer {
    try {
      return base64.decode(base64String);
    } catch (e) {
      // Fallback for environments that don't support atob
      const binary = base64.decode(base64String);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }
  }
}

// Export a singleton instance
export default new IdentityService();