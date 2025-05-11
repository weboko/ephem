import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../../../constants/theme';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useContacts } from '../../../../context/ContactsContext';

export default function ConnectionScreen() {
  const { id, token, userId } = useLocalSearchParams<{ id: string; token: string; userId: string }>();
  const { currentUser } = useAuth();
  const { addContact } = useContacts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    console.log('Connection params:', { connectionId: id, token, contactUserId: userId });
    
    const verifyConnection = async () => {
      try {
        setIsProcessing(true);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll always succeed if we have valid params
        if (id && userId) {
          setConnectionStatus('success');
          
          const contactName = `User ${userId.substring(0, 4)}`;
          
          addContact({
            id: userId,
            name: contactName,
            isOnline: true,
            lastSeen: 'Now'
          });
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('Connection error:', error);
        setConnectionStatus('error');
      } finally {
        setIsProcessing(false);
      }
    };

    verifyConnection();
  }, [id, token, userId, addContact]);

  const handleGoBack = () => {
    router.push('/');
  };

  const handleViewContact = () => {
    router.push({
      pathname: '/contact/[id]',
      params: { id: userId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONNECTION REQUEST</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.content}>
        {connectionStatus === 'pending' && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="hourglass-outline" 
                size={80} 
                color={Colors.primary} 
              />
            </View>
            <Text style={styles.title}>Processing Connection</Text>
            <Text style={styles.description}>
              Verifying secure ephemeral connection...{'\n'}
              Please wait while we establish the connection.
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Connection ID:</Text>
              <Text style={styles.statusValue}>{id}</Text>
            </View>
          </>
        )}
        
        {connectionStatus === 'success' && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="checkmark-circle-outline" 
                size={80} 
                color={Colors.primary} 
              />
            </View>
            <Text style={styles.title}>Connection Established</Text>
            <Text style={styles.description}>
              Secure ephemeral connection has been successfully established.{'\n'}
              You can now communicate securely.
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Connection ID:</Text>
              <Text style={styles.statusValue}>{id}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewContact}>
              <Text style={styles.actionButtonText}>VIEW CONTACT</Text>
            </TouchableOpacity>
          </>
        )}
        
        {connectionStatus === 'error' && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="alert-circle-outline" 
                size={80} 
                color={Colors.error} 
              />
            </View>
            <Text style={styles.title}>Connection Failed</Text>
            <Text style={styles.description}>
              Unable to establish a secure connection.{'\n'}
              Please try again with a new connection code.
            </Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleGoBack}>
              <Text style={styles.actionButtonText}>GO BACK</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    backgroundColor: '#0a0a0a',
  },
  headerTitle: {
    ...Typography.title,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.large,
  },
  iconContainer: {
    marginBottom: Spacing.large,
  },
  title: {
    ...Typography.title,
    fontSize: 22,
    marginBottom: Spacing.medium,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.large,
    lineHeight: 22,
  },
  statusContainer: {
    backgroundColor: Colors.card,
    padding: Spacing.medium,
    borderRadius: 4,
    width: '100%',
    marginBottom: Spacing.large,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.primary,
    marginBottom: 4,
  },
  statusValue: {
    ...Typography.body,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: 4,
    marginTop: Spacing.medium,
  },
  actionButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
});