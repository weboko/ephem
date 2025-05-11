import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWaku } from './WakuContext';
import { LoadingScreen } from '../components/LoadingScreen';
import ChatService, { ChatSession, ChatEvents, ChatState } from '../services/chat';
import { Contact } from './ContactsContext';

type ChatContextType = {
  activeSessions: ChatSession[];
  createChat: (contact: Contact) => Promise<ChatSession | null>;
  acceptChatInvite: (sessionId: string) => Promise<boolean>;
  sendMessage: (sessionId: string, content: string) => Promise<any>;
  closeChat: (sessionId: string) => Promise<void>;
  getSessionByContactId: (contactId: string) => ChatSession | undefined;
  refreshSessions: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { client, isLoading } = useWaku();
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat service
  useEffect(() => {
    if (client && !isInitialized) {
      // Initialize the chat service with the Waku client
      ChatService.initialize(client);
      setIsInitialized(true);
      
      // Load initial sessions
      refreshSessions();
    }
  }, [client, isInitialized]);

  // Listen for chat state changes
  useEffect(() => {
    if (isInitialized) {
      const stateChangeSubscription = ChatService.addListener(
        ChatEvents.STATE_CHANGED,
        () => refreshSessions()
      );
      
      const messageReceivedSubscription = ChatService.addListener(
        ChatEvents.MESSAGE_RECEIVED,
        () => refreshSessions()
      );
      
      const messageSentSubscription = ChatService.addListener(
        ChatEvents.MESSAGE_SENT,
        () => refreshSessions()
      );
      
      const chatClosedSubscription = ChatService.addListener(
        ChatEvents.CHAT_CLOSED,
        () => refreshSessions()
      );
      
      return () => {
        stateChangeSubscription.remove();
        messageReceivedSubscription.remove();
        messageSentSubscription.remove();
        chatClosedSubscription.remove();
      };
    }
    
    return undefined;
  }, [isInitialized]);

  // Refresh sessions from the chat service
  const refreshSessions = () => {
    if (isInitialized) {
      const sessions = ChatService.getAllSessions();
      setActiveSessions(sessions);
    }
  };

  // Create a new chat session
  const createChat = async (contact: Contact) => {
    if (!isInitialized || !client) return null;
    
    const session = await ChatService.createChatSession(contact);
    refreshSessions();
    return session;
  };

  // Accept a chat invite
  const acceptChatInvite = async (sessionId: string) => {
    if (!isInitialized || !client) return false;
    
    const success = await ChatService.acceptChatInvite(sessionId);
    refreshSessions();
    return success;
  };

  // Send a message
  const sendMessage = async (sessionId: string, content: string) => {
    if (!isInitialized || !client) return null;
    
    const message = await ChatService.sendMessage(sessionId, content);
    refreshSessions();
    return message;
  };

  // Close a chat session
  const closeChat = async (sessionId: string) => {
    if (!isInitialized || !client) return;
    
    await ChatService.closeSession(sessionId);
    refreshSessions();
  };

  // Get a session by contact ID
  const getSessionByContactId = (contactId: string) => {
    return ChatService.getSessionByContactId(contactId);
  };

  const value = {
    activeSessions,
    createChat,
    acceptChatInvite,
    sendMessage,
    closeChat,
    getSessionByContactId,
    refreshSessions,
  };

  if (isLoading) {
    return <LoadingScreen message="INITIALIZING SECURE CHAT" />;
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}