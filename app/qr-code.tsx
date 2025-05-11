import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CommonStyles, Typography, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function QRCodeScreen() {
  const { currentUser } = useAuth();
  
  // Placeholder function to copy or share the contact link
  const shareContactInfo = async () => {
    try {
      await Share.share({
        message: `Connect with me on CypherNet! User ID: ${currentUser?.id}`,
        // In a real app, this would be a deep link to your app
        url: `cyphernet://user/${currentUser?.id}`,
      });
    } catch (error) {
      console.error('Error sharing contact info:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IDENTITY CODE</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>SCAN TO ESTABLISH EPHEMERAL CONNECTION</Text>
        
        <View style={styles.qrCodeContainer}>
          {/* Placeholder for actual QR code - would use a library like react-native-qrcode-svg */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={150} color={Colors.primary} />
            <Text style={styles.ephemeralNotice}>EXPIRES ON APP CLOSE</Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <Text style={styles.userId}>ID: {currentUser?.id}</Text>
        </View>
        
        <TouchableOpacity style={styles.shareButton} onPress={shareContactInfo}>
          <Ionicons name="share-outline" size={20} color={Colors.background} />
          <Text style={styles.shareButtonText}>SHARE ONE-TIME KEY</Text>
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
    marginBottom: Spacing.large,
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
  },
  shareButtonText: {
    color: Colors.background,
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