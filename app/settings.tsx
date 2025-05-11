import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CommonStyles, Typography, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { 
          text: 'Logout', 
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
        <Text style={styles.headerTitle}>Settings</Text>
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
        <Text style={styles.userId}>ID: {currentUser?.id}</Text>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person-circle-outline" size={22} color={Colors.text} />
          <Text style={styles.settingsText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <Text style={styles.settingsText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="lock-closed-outline" size={22} color={Colors.text} />
          <Text style={styles.settingsText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="color-palette-outline" size={22} color={Colors.text} />
          <Text style={styles.settingsText}>Appearance</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="language-outline" size={22} color={Colors.text} />
          <Text style={styles.settingsText}>Language</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} style={{marginRight: 8}} />
          <Text style={styles.logoutText}>Logout</Text>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.medium,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '600',
  },
  userName: {
    ...Typography.title,
    marginBottom: 4,
  },
  userId: {
    ...Typography.caption,
  },
  settingsSection: {
    marginTop: Spacing.medium,
    paddingHorizontal: Spacing.medium,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.small,
    marginLeft: Spacing.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsText: {
    ...Typography.body,
    marginLeft: Spacing.medium,
    flex: 1,
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
    backgroundColor: Colors.card,
    borderRadius: 10,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
  },
});