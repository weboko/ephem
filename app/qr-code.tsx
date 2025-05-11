import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Share } from 'react-native';
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
        message: `Connect with me on our messaging app! User ID: ${currentUser?.id}`,
        // In a real app, this would be a deep link to your app
        url: `messaging-app://user/${currentUser?.id}`,
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
        <Text style={styles.headerTitle}>My QR Code</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Scan this code to connect with me</Text>
        
        <View style={styles.qrCodeContainer}>
          {/* Placeholder for actual QR code - would use a library like react-native-qrcode-svg */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={150} color={Colors.text} />
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
          <Ionicons name="share-outline" size={20} color={Colors.text} />
          <Text style={styles.shareButtonText}>Share My Contact</Text>
        </TouchableOpacity>
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
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.title,
    textAlign: 'center',
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
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.large,
  },
  qrCodeContainer: {
    padding: Spacing.medium,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: Spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.medium,
    borderRadius: 8,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  userName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    ...Typography.caption,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: 20,
  },
  shareButtonText: {
    ...Typography.button,
    color: Colors.text,
    marginLeft: Spacing.small,
  },
});