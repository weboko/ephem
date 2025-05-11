import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Platform, Clipboard, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-native-qrcode-svg';
import contacts from '@/services/contacts';

export default function QRCodeScreen() {
  const { currentUser } = useAuth();
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [specialLink, setSpecialLink] = useState<string | null>(null);
  
  useEffect(() => {
    generateConnectionId();
  }, []);
  
  const generateConnectionId = useCallback(() => {
    const invite = contacts.createInvite();
    setConnectionId(invite.id);

    const baseUrl = 'ephem://connect';
    const link = `${baseUrl}/${invite.id}/pubkey/${currentUser?.id || ''}`;
    setSpecialLink(link);
  }, [currentUser?.id]);
  
  const copyLinkToClipboard = async () => {
    if (!specialLink) return;
    
    try {
      await Clipboard.setString(specialLink);
      Alert.alert('Success', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };
  
  const handleTestConnection = () => {
    if (!connectionId || !currentUser?.id) return;

    router.push({
      pathname: '/connect/[id]/[token]/[userId]',
      params: { 
        id: connectionId,
        token: 'placeholder',
        userId: currentUser.id
      }
    });
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
              <Text style={styles.ephemeralNotice}>EXPIRES ON APP CLOSE</Text>
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
        
        {__DEV__ && (
          <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
            <Ionicons name="code-working-outline" size={20} color={Colors.primary} />
            <Text style={styles.testButtonText}>TEST CONNECTION (DEV ONLY)</Text>
          </TouchableOpacity>
        )}
        
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
    marginBottom: Spacing.medium,
  },
  refreshButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.small,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    marginBottom: Spacing.medium,
  },
  testButtonText: {
    color: Colors.primary,
    fontSize: 12,
    marginLeft: Spacing.small,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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