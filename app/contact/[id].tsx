import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../../context/ContactsContext';
import { Colors, CommonStyles, Typography, Spacing } from '../../constants/theme';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, toggleOnlineStatus } = useContacts();
  
  const contact = contacts.find(c => c.id === id);
  
  if (!contact) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact</Text>
          <View style={styles.placeholder}></View>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Contact not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contact.name}</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.contactProfile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </Text>
        </View>
        
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={[styles.onlineStatus, contact.isOnline ? styles.online : styles.offline]}>
          {contact.isOnline ? 'Online' : `Last seen: ${contact.lastSeen}`}
        </Text>
        
        {/* For demo purposes - toggle online status */}
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => toggleOnlineStatus(contact.id)}
        >
          <Text style={styles.toggleButtonText}>
            {contact.isOnline ? 'Set as Offline' : 'Set as Online'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Ionicons name="chatbubble" size={24} color={Colors.text} />
          </View>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Ionicons name="call" size={24} color={Colors.text} />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Ionicons name="videocam" size={24} color={Colors.text} />
          </View>
          <Text style={styles.actionText}>Video</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Contact Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>ID: {contact.id}</Text>
        </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
  },
  contactProfile: {
    alignItems: 'center',
    padding: Spacing.large,
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
  contactName: {
    ...Typography.title,
    fontSize: 24,
    marginBottom: Spacing.small,
  },
  onlineStatus: {
    ...Typography.caption,
    marginBottom: Spacing.medium,
  },
  online: {
    color: Colors.online,
  },
  offline: {
    color: Colors.textSecondary,
  },
  toggleButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.large,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  infoSection: {
    padding: Spacing.medium,
  },
  infoTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.small,
  },
  infoText: {
    ...Typography.body,
    marginLeft: Spacing.medium,
  },
});