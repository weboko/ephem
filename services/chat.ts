import { NativeEventEmitter } from 'react-native';
import { Contact } from '../context/ContactsContext';
import { IWaku } from './waku';
import EphemeralStorage from '../utils/ephemeralStorage';
import { utf8ToBytes, bytesToUtf8 } from "@waku/sdk";

// Chat message interface
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  isSelf: boolean;
}

// Chat states
export enum ChatState {
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ACTIVE = 'active',
  TIMED_OUT = 'timed_out',
}

// Chat session interface
export interface ChatSession {
  id: string;
  contactId: string;
  state: ChatState;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  publicKey?: string; // For encryption in a real app
}

// Events emitted by the chat service
export enum ChatEvents {
  STATE_CHANGED = 'state_changed',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_SENT = 'message_sent',
  CHAT_CLOSED = 'chat_closed',
  CHAT_INVITE_ACCEPTED = 'chat_invite_accepted',
  CHAT_INVITE_TIMEOUT = 'chat_invite_timeout',
}

// Storage key for ephemeral chat sessions
const CHAT_SESSIONS_STORAGE_KEY = 'ephemeral_chat_sessions';

// Chat timeout in milliseconds (1 minute)
const CHAT_INVITE_TIMEOUT = 60 * 1000;

// Chat service class
class ChatService {
  private events = new NativeEventEmitter();
  private wakuClient?: IWaku;
  private activeSessions: Map<string, ChatSession> = new Map();
  private timeoutTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Initialize chat service
  public initialize(wakuClient: IWaku): void {
    this.wakuClient = wakuClient;
    
    // Listen for message events from Waku
    this.wakuClient.events.addListener('message', this.handleIncomingMessage);
    
    // Load any existing sessions from ephemeral storage
    this.loadSessions();
  }
  
  // Create a new chat session with a contact
  public async createChatSession(contact: Contact): Promise<ChatSession | null> {
    if (!contact.isOnline || !this.wakuClient) {
      console.log('Cannot create chat: contact offline or waku not initialized');
      return null;
    }
    
    // Check if a session already exists
    const existingSession = this.getSessionByContactId(contact.id);
    if (existingSession) {
      return existingSession;
    }
    
    // Create a new session
    const session: ChatSession = {
      id: crypto.randomUUID(),
      contactId: contact.id,
      state: ChatState.PENDING,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Store the session
    this.activeSessions.set(session.id, session);
    this.saveSessions();
    
    // Set a timeout for the invitation
    this.startInviteTimeout(session.id);
    
    // Send the invite
    await this.sendChatInvite(session);
    
    // Emit state change event
    this.events.emit(ChatEvents.STATE_CHANGED, session);
    
    return session;
  }
  
  // Accept an incoming chat invitation
  public async acceptChatInvite(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !this.wakuClient) {
      return false;
    }
    
    // Update session state
    session.state = ChatState.ACTIVE;
    session.updatedAt = Date.now();
    this.saveSessions();
    
    // Cancel the timeout
    this.clearInviteTimeout(sessionId);
    
    // Send acceptance message
    await this.sendChatInviteAcceptance(session);
    
    // Emit accepted event
    this.events.emit(ChatEvents.CHAT_INVITE_ACCEPTED, session);
    this.events.emit(ChatEvents.STATE_CHANGED, session);
    
    return true;
  }
  
  // Send a message in an active chat
  public async sendMessage(sessionId: string, content: string): Promise<ChatMessage | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.state !== ChatState.ACTIVE || !this.wakuClient) {
      console.log('Cannot send message: session inactive or waku not initialized');
      return null;
    }
    
    // Create a new message
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: 'self', // This would be the user's ID in a real app
      content,
      timestamp: Date.now(),
      isSelf: true,
    };
    
    // Add message to session
    session.messages.push(message);
    session.updatedAt = Date.now();
    this.saveSessions();
    
    // Send the message via Waku
    await this.sendChatMessage(session, message);
    
    // Emit message sent event
    this.events.emit(ChatEvents.MESSAGE_SENT, message, session);
    
    return message;
  }
  
  // Close a chat session
  public async closeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !this.wakuClient) {
      return;
    }
    
    // Send a chat closed message
    if (session.state === ChatState.ACTIVE) {
      await this.sendChatClosedMessage(session);
    }
    
    // Clear the timeout
    this.clearInviteTimeout(sessionId);
    
    // Remove the session
    this.activeSessions.delete(sessionId);
    this.saveSessions();
    
    // Emit chat closed event
    this.events.emit(ChatEvents.CHAT_CLOSED, session);
  }
  
  // Get a chat session by ID
  public getSession(sessionId: string): ChatSession | undefined {
    return this.activeSessions.get(sessionId);
  }
  
  // Get a chat session by contact ID
  public getSessionByContactId(contactId: string): ChatSession | undefined {
    for (const session of this.activeSessions.values()) {
      if (session.contactId === contactId) {
        return session;
      }
    }
    return undefined;
  }
  
  // Get all active chat sessions
  public getAllSessions(): ChatSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  // Add a listener for chat events
  public addListener(event: ChatEvents, listener: (...args: any[]) => void): { remove: () => void } {
    return this.events.addListener(event, listener);
  }
  
  // Private methods
  
  // Handle incoming messages from Waku
  private handleIncomingMessage = (event: { data: Uint8Array }): void => {
    try {
      // In a real app, this would involve decryption
      const messageText = bytesToUtf8(event.data);
      const messageData = JSON.parse(messageText);
      
      // Process different message types
      switch (messageData.type) {
        case 'chat_invite':
          this.handleChatInvite(messageData);
          break;
        case 'chat_accept':
          this.handleChatAccept(messageData);
          break;
        case 'chat_message':
          this.handleChatMessage(messageData);
          break;
        case 'chat_closed':
          this.handleChatClosed(messageData);
          break;
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  };
  
  // Handle an incoming chat invite
  private handleChatInvite(data: any): void {
    // In a real app, this would check if the invite is valid
    // For demo purposes, we'll create a new session
    
    const sessionId = data.sessionId;
    const contactId = data.senderId;
    
    // Create a new session
    const session: ChatSession = {
      id: sessionId,
      contactId,
      state: ChatState.PENDING,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Store the session
    this.activeSessions.set(session.id, session);
    this.saveSessions();
    
    // Emit state change event
    this.events.emit(ChatEvents.STATE_CHANGED, session);
  }
  
  // Handle an accepted chat invite
  private handleChatAccept(data: any): void {
    const sessionId = data.sessionId;
    const session = this.activeSessions.get(sessionId);
    
    if (session && session.state === ChatState.PENDING) {
      // Update session state
      session.state = ChatState.ACTIVE;
      session.updatedAt = Date.now();
      this.saveSessions();
      
      // Clear the timeout
      this.clearInviteTimeout(sessionId);
      
      // Emit accepted event
      this.events.emit(ChatEvents.CHAT_INVITE_ACCEPTED, session);
      this.events.emit(ChatEvents.STATE_CHANGED, session);
    }
  }
  
  // Handle an incoming chat message
  private handleChatMessage(data: any): void {
    const sessionId = data.sessionId;
    const session = this.activeSessions.get(sessionId);
    
    if (session && session.state === ChatState.ACTIVE) {
      // Create a message object
      const message: ChatMessage = {
        id: data.messageId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp,
        isSelf: false,
      };
      
      // Add message to session
      session.messages.push(message);
      session.updatedAt = Date.now();
      this.saveSessions();
      
      // Emit message received event
      this.events.emit(ChatEvents.MESSAGE_RECEIVED, message, session);
    }
  }
  
  // Handle a chat closed message
  private handleChatClosed(data: any): void {
    const sessionId = data.sessionId;
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      // Remove the session
      this.activeSessions.delete(sessionId);
      this.saveSessions();
      
      // Emit chat closed event
      this.events.emit(ChatEvents.CHAT_CLOSED, session);
    }
  }
  
  // Send a chat invite
  private async sendChatInvite(session: ChatSession): Promise<void> {
    if (!this.wakuClient) return;
    
    const message = {
      type: 'chat_invite',
      sessionId: session.id,
      senderId: 'self', // This would be the user's ID in a real app
      timestamp: Date.now(),
    };
    
    const payload = utf8ToBytes(JSON.stringify(message));
    await this.wakuClient.send(payload);
  }
  
  // Send a chat invite acceptance
  private async sendChatInviteAcceptance(session: ChatSession): Promise<void> {
    if (!this.wakuClient) return;
    
    const message = {
      type: 'chat_accept',
      sessionId: session.id,
      senderId: 'self', // This would be the user's ID in a real app
      timestamp: Date.now(),
    };
    
    const payload = utf8ToBytes(JSON.stringify(message));
    await this.wakuClient.send(payload);
  }
  
  // Send a chat message
  private async sendChatMessage(session: ChatSession, message: ChatMessage): Promise<void> {
    if (!this.wakuClient) return;
    
    const messageData = {
      type: 'chat_message',
      sessionId: session.id,
      messageId: message.id,
      senderId: 'self', // This would be the user's ID in a real app
      content: message.content,
      timestamp: message.timestamp,
    };
    
    const payload = utf8ToBytes(JSON.stringify(messageData));
    await this.wakuClient.send(payload);
  }
  
  // Send a chat closed message
  private async sendChatClosedMessage(session: ChatSession): Promise<void> {
    if (!this.wakuClient) return;
    
    const message = {
      type: 'chat_closed',
      sessionId: session.id,
      senderId: 'self', // This would be the user's ID in a real app
      timestamp: Date.now(),
    };
    
    const payload = utf8ToBytes(JSON.stringify(message));
    await this.wakuClient.send(payload);
  }
  
  // Start timeout for chat invite
  private startInviteTimeout(sessionId: string): void {
    // Clear any existing timeout
    this.clearInviteTimeout(sessionId);
    
    // Set a new timeout
    const timeoutId = setTimeout(() => {
      const session = this.activeSessions.get(sessionId);
      if (session && session.state === ChatState.PENDING) {
        // Update session state
        session.state = ChatState.TIMED_OUT;
        session.updatedAt = Date.now();
        this.saveSessions();
        
        // Emit timeout event
        this.events.emit(ChatEvents.CHAT_INVITE_TIMEOUT, session);
        this.events.emit(ChatEvents.STATE_CHANGED, session);
      }
    }, CHAT_INVITE_TIMEOUT);
    
    // Store the timeout ID
    this.timeoutTimers.set(sessionId, timeoutId);
  }
  
  // Clear timeout for chat invite
  private clearInviteTimeout(sessionId: string): void {
    const timeoutId = this.timeoutTimers.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutTimers.delete(sessionId);
    }
  }
  
  // Save sessions to ephemeral storage
  private saveSessions(): void {
    const sessions = Array.from(this.activeSessions.values());
    EphemeralStorage.set(CHAT_SESSIONS_STORAGE_KEY, sessions);
  }
  
  // Load sessions from ephemeral storage
  private loadSessions(): void {
    const sessions = EphemeralStorage.get<ChatSession[]>(CHAT_SESSIONS_STORAGE_KEY, []);
    if (sessions) {
      this.activeSessions.clear();
      sessions.forEach(session => {
        this.activeSessions.set(session.id, session);
        
        // Restart timeouts for pending invites
        if (session.state === ChatState.PENDING) {
          this.startInviteTimeout(session.id);
        }
      });
    }
  }
  
  // Clear all sessions
  public clearAllSessions(): void {
    // Clear all timeouts
    this.timeoutTimers.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutTimers.clear();
    
    // Clear all sessions
    this.activeSessions.clear();
    this.saveSessions();
  }
}

// Export singleton instance
export default new ChatService();