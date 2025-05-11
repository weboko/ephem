import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Platform, 
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import { useContacts } from "../context/ContactsContext";
import { useChat } from "../context/ChatContext";
import { router, useLocalSearchParams } from "expo-router";
import { ChatState, ChatMessage } from "../services/chat";

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts } = useContacts();
  const { 
    createChat, 
    acceptChatInvite, 
    sendMessage, 
    closeChat, 
    getSessionByContactId, 
    activeSessions, 
    refreshSessions 
  } = useChat();
  
  const contact = contacts.find(c => c.id === id);
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Get current chat session if it exists
  const chatSession = getSessionByContactId(id || "");
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && chatSession?.messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chatSession?.messages.length]);
  
  // Auto-refresh sessions to ensure we have the latest data
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshSessions();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [refreshSessions]);
  
  // Handle creating a new chat
  const handleCreateChat = async () => {
    if (!contact) return;
    
    setIsCreatingChat(true);
    try {
      await createChat(contact);
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };
  
  // Handle accepting a chat invite
  const handleAcceptChat = async () => {
    if (!chatSession) return;
    
    try {
      await acceptChatInvite(chatSession.id);
    } catch (error) {
      console.error("Error accepting chat:", error);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!chatSession || !message.trim()) return;
    
    try {
      await sendMessage(chatSession.id, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Handle closing chat
  const handleCloseChat = async () => {
    if (!chatSession) return;
    
    try {
      await closeChat(chatSession.id);
      router.back();
    } catch (error) {
      console.error("Error closing chat:", error);
    }
  };
  
  // Render message item
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    return (
      <View style={[
        styles.messageBubble, 
        item.isSelf ? styles.outgoingMessage : styles.incomingMessage
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };
  
  // If contact not found
  if (!contact) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Contact not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{contact.name}</Text>
          <Text style={[styles.headerStatus, contact.isOnline ? styles.onlineText : styles.offlineText]}>
            {contact.isOnline ? "ONLINE" : `LAST SEEN: ${contact.lastSeen}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.push({
            pathname: '/contact/[id]',
            params: { id: contact.id }
          })}
        >
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* No active chat state */}
        {(!chatSession || chatSession.state === ChatState.TIMED_OUT) && (
          <View style={styles.noChatContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={Colors.primary} />
            <Text style={styles.noChatTitle}>Start Secure Chat</Text>
            <Text style={styles.noChatDescription}>
              Chat can only be established when contact is online. If the contact doesn't accept within one minute, the invitation will time out.
            </Text>
            <Text style={styles.securityNote}>
              All messages are ephemeral and encrypted.{"\n"}
              Chat history will be lost when you close the app.
            </Text>
            {contact.isOnline ? (
              <TouchableOpacity 
                style={[styles.createChatButton, isCreatingChat && styles.disabledButton]} 
                onPress={handleCreateChat}
                disabled={isCreatingChat}
              >
                {isCreatingChat ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <>
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.background} />
                    <Text style={styles.createChatButtonText}>START SECURE CHAT</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.offlineWarning}>
                <Ionicons name="alert-circle-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.offlineWarningText}>
                  Contact is offline. Chat can only be established when both users are online.
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Pending chat state */}
        {chatSession && chatSession.state === ChatState.PENDING && (
          <View style={styles.pendingChatContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.pendingChatTitle}>
              {chatSession.contactId === id ? "Waiting for response..." : "Chat invite received"}
            </Text>
            <Text style={styles.pendingChatDescription}>
              {chatSession.contactId === id 
                ? "The invitation will expire in one minute if not accepted."
                : "Accept this chat invitation to start secure communication."}
            </Text>
            
            {chatSession.contactId !== id && (
              <View style={styles.pendingActions}>
                <TouchableOpacity 
                  style={styles.acceptButton} 
                  onPress={handleAcceptChat}
                >
                  <Ionicons name="checkmark-outline" size={20} color={Colors.background} />
                  <Text style={styles.acceptButtonText}>ACCEPT CHAT</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.rejectButton} 
                  onPress={handleCloseChat}
                >
                  <Ionicons name="close-outline" size={20} color={Colors.error} />
                  <Text style={styles.rejectButtonText}>DECLINE</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {chatSession.contactId === id && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCloseChat}
              >
                <Text style={styles.cancelButtonText}>CANCEL INVITATION</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Active chat state */}
        {chatSession && chatSession.state === ChatState.ACTIVE && (
          <>
            <FlatList
              ref={flatListRef}
              data={chatSession.messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              ListHeaderComponent={() => (
                <View style={styles.chatStartedInfo}>
                  <View style={styles.chatStartedLine} />
                  <Text style={styles.chatStartedText}>SECURE CHAT ESTABLISHED</Text>
                  <View style={styles.chatStartedLine} />
                </View>
              )}
              onContentSizeChange={() => 
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !message.trim() && styles.disabledSendButton]} 
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Ionicons name="send" size={20} color={message.trim() ? Colors.background : Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    backgroundColor: '#0a0a0a',
  },
  headerButton: {
    padding: Spacing.small,
    width: 40,
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 18,
  },
  headerStatus: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  onlineText: {
    color: Colors.online,
  },
  offlineText: {
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.large,
  },
  noChatTitle: {
    ...Typography.title,
    marginTop: Spacing.medium,
    marginBottom: Spacing.small,
  },
  noChatDescription: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.large,
  },
  securityNote: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.large,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  createChatButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    alignItems: 'center',
  },
  createChatButtonText: {
    color: Colors.background,
    marginLeft: Spacing.small,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: Spacing.medium,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: Spacing.medium,
  },
  offlineWarningText: {
    ...Typography.caption,
    marginLeft: Spacing.small,
    flex: 1,
  },
  pendingChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.large,
  },
  pendingChatTitle: {
    ...Typography.title,
    marginTop: Spacing.medium,
    marginBottom: Spacing.small,
  },
  pendingChatDescription: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.large,
  },
  pendingActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: Spacing.medium,
  },
  acceptButtonText: {
    color: Colors.background,
    marginLeft: Spacing.small,
    fontWeight: '600',
  },
  rejectButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    color: Colors.error,
    marginLeft: Spacing.small,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    marginTop: Spacing.medium,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  messageList: {
    padding: Spacing.medium,
    paddingBottom: Spacing.large,
  },
  chatStartedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.medium,
  },
  chatStartedLine: {
    height: 1,
    backgroundColor: Colors.primary,
    flex: 1,
    opacity: 0.3,
  },
  chatStartedText: {
    fontSize: 10,
    color: Colors.primary,
    marginHorizontal: Spacing.small,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  messageBubble: {
    marginVertical: Spacing.small / 2,
    padding: Spacing.small,
    borderRadius: 8,
    maxWidth: '80%',
  },
  incomingMessage: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  outgoingMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  messageText: {
    ...Typography.body,
    fontSize: 15,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.small,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0a0a0a',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 4,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    height: 40,
    width: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginLeft: Spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendButton: {
    backgroundColor: Colors.card,
  },
});

export default ChatScreen;