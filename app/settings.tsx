import { Platform, View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CommonStyles, Typography, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'DISCONNECT',
      'Disconnecting will erase all ephemeral conversations and keys. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { 
          text: 'Disconnect', 
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: 'destructive',
        },
      ],
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SYSTEM</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.profileSection}>
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
        <Text style={styles.userId}><Text style={styles.userIdLabel}>ID:</Text> {currentUser?.id}</Text>
        <Text style={styles.ephemeralTag}>EPHEMERAL IDENTITY</Text>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>SECURITY</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
          <Text style={styles.settingsText}>Identity Management</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          <Text style={styles.settingsText}>Message Lifespan</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="lock-closed-outline" size={22} color={Colors.primary} />
          <Text style={styles.settingsText}>Encryption Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>INTERFACE</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="color-palette-outline" size={22} color={Colors.primary} />
          <Text style={styles.settingsText}>Terminal Appearance</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="language-outline" size={22} color={Colors.primary} />
          <Text style={styles.settingsText}>System Language</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="power-outline" size={22} color={Colors.error} style={{marginRight: 8}} />
          <Text style={styles.logoutText}>DISCONNECT</Text>
        </TouchableOpacity>
        <Text style={styles.logoutDescription}>
          Disconnecting will erase all ephemeral keys and conversations
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 65, 0.2)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.medium,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 36,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  userName: {
    ...Typography.title,
    marginBottom: 4,
  },
  userId: {
    ...Typography.caption,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  userIdLabel: {
    color: Colors.primary,
  },
  ephemeralTag: {
    ...CommonStyles.ephemeralTag,
    color: Colors.faded,
    fontSize: 10,
  },
  settingsSection: {
    marginTop: Spacing.medium,
    paddingHorizontal: Spacing.medium,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.small,
    marginLeft: Spacing.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 65, 0.2)',
  },
  settingsText: {
    ...Typography.body,
    marginLeft: Spacing.medium,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.large,
    padding: Spacing.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.medium,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logoutDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});