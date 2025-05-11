import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Platform, Clipboard, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeScreen() {
  const { currentUser } = useAuth();
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [specialLink, setSpecialLink] = useState<string | null>(null);
  
  // Generate a new UUID when the component mounts
  useEffect(() => {
    generateConnectionId();
  }, []);
  
  // Generate a cryptographic UUID and create a special link
  const generateConnectionId = useCallback(() => {
    // Generate a UUID using crypto.randomUUID() API
    const newId = crypto.randomUUID();
    setConnectionId(newId);

    const link = `https://weboko.github.io/ephem/connect/${newId}/placeholder/${currentUser?.id || ''}`;
    setSpecialLink(link);
  }, [currentUser?.id]);
  
  // Function to copy the link to clipboard
  const copyLinkToClipboard = async () => {
    if (!specialLink) return;
    
    try {
      // Using the Clipboard API to copy the text
      await Clipboard.setString(specialLink);
      Alert.alert('Success', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ONE-TIME IDENTITY CODE</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>SCAN TO ESTABLISH EPHEMERAL CONNECTION</Text>
        
        <View style={styles.qrCodeContainer}>
          {specialLink ? (
            <View style={styles.qrPlaceholder}>
              <QRCode 
                value={specialLink}
                size={180}
                color={Colors.primary}
                backgroundColor={Colors.background}
              />
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={150} color={Colors.primary} />
              <Text style={styles.ephemeralNotice}>GENERATING...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkLabel}>SECURE CONNECTION LINK:</Text>
          <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
            {specialLink || 'Generating...'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.shareButton} onPress={copyLinkToClipboard}>
          <Ionicons name="copy-outline" size={20} color={Colors.background} />
          <Text style={styles.shareButtonText}>COPY ONE-TIME LINK</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.refreshButton} onPress={generateConnectionId}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
          <Text style={styles.refreshButtonText}>GENERATE NEW CODE</Text>
        </TouchableOpacity>
        
        <Text style={styles.securityNote}>
          This QR code contains a one-time cryptographic key.{"\n"}
          All connections are ephemeral and expire when you close the app.
        </Text>
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.large,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.large,
    letterSpacing: 1,
    fontSize: 11,
  },
  qrCodeContainer: {
    padding: Spacing.medium,
    backgroundColor: Colors.card,
    borderRadius: 6,
    marginBottom: Spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.medium,
    borderRadius: 4,
    position: 'relative',
  },
  ephemeralNotice: {
    position: 'absolute',
    bottom: 10,
    color: Colors.primary,
    fontSize: 8,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  linkContainer: {
    width: '100%',
    marginBottom: Spacing.medium,
    padding: Spacing.small,
    backgroundColor: Colors.card,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  linkLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  linkText: {
    ...Typography.caption,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  userName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    ...Typography.caption,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: 4,
    marginBottom: Spacing.medium,
  },
  shareButtonText: {
    color: Colors.background,
    fontWeight: '600',
    marginLeft: Spacing.small,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  refreshButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.small,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  securityNote: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.large,
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
});