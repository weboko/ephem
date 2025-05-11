import PersistentStorage from '../utils/persistentStorage';

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
    const name = this.generatePassKeyName();
    
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (available) {
          const userId = this.generateId();
          
          const publicKeyCredentialCreationOptions = {
            challenge: this.generateChallenge(),
            rp: {
              name: 'EPHEM',
              id: window.location.hostname
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
          
          const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
          }) as PublicKeyCredential;

          const credentialId = this.base64FromBuffer(credential.rawId);
          
          const response = credential.response as AuthenticatorAttestationResponse;
          const publicKey = this.base64FromBuffer(response.getPublicKey || new ArrayBuffer(0));
          const authenticatorData = this.base64FromBuffer(response.getAuthenticatorData || new ArrayBuffer(0));
          
          const newPassKey: PassKey = {
            id: userId,
            name,
            createdAt: new Date().toISOString(),
            credentialId,
            publicKey,
            authenticatorData
          };
          
          const existingPasskeys = await this.getPassKeys();
          await PersistentStorage.set(STORAGE_KEY, [...existingPasskeys, newPassKey]);
          
          return newPassKey;
        }
      }

      throw Error("WebAuthn not available");
    } catch (error) {
      console.error('Error creating passkey:', error);
      throw error;
    }
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
      const passkeys = await this.getPassKeys();
      const passkey = passkeys.find(pk => pk.id === id);
      
      if (passkey?.credentialId && typeof window !== 'undefined' && window.PublicKeyCredential &&
          'credentials' in navigator && 'preventSilentAccess' in navigator.credentials) {
        try {
          await navigator.credentials.preventSilentAccess();
        } catch (e) {
          console.warn('Failed to revoke credential from browser store:', e);
        }
      }
      
      const filteredPasskeys = passkeys.filter(pk => pk.id !== id);
      await PersistentStorage.set(STORAGE_KEY, filteredPasskeys);
      
      console.log(`Successfully deleted passkey: ${id}`);
    } catch (error) {
      console.error('Error deleting passkey:', error);
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

      if (passkey.credentialId && typeof window !== 'undefined' && window.PublicKeyCredential) {
        const challenge = this.generateChallenge();

        const publicKeyCredentialRequestOptions = {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: this.bufferFromBase64(passkey.credentialId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000
        };

        try {
          const credential = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
          }) as PublicKeyCredential;

          if (credential) {
            await this.updatePassKeyUsage(id);
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('WebAuthn authentication error:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying passkey:', error);
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
    let binaryString = window.atob(base64String);

    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  private base64FromBuffer(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);

    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }
}

// Export a singleton instance
export default new IdentityService();