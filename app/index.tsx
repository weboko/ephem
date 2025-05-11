import { useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList, Image, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useContacts, Contact } from "../context/ContactsContext";
import { Colors, CommonStyles, Typography, Spacing } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Helper component to generate avatar from name initials
const Avatar = ({ name, isOnline }: { name: string; isOnline: boolean }) => {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <View style={[styles.avatar, isOnline ? styles.avatarOnline : {}]}>
      <Text style={styles.avatarText}>{initials}</Text>
      {isOnline && <View style={styles.onlineIndicator} />}
    </View>
  );
};

// Contact Item component
const ContactItem = ({ contact, onPress }: { contact: Contact; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <Avatar name={contact.name} isOnline={contact.isOnline} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <View style={styles.lastSeenContainer}>
          <Text style={[styles.lastSeen, contact.isOnline ? styles.onlineText : {}]}>
            {contact.isOnline ? "ONLINE" : `LAST SEEN: ${contact.lastSeen}`}
          </Text>
          {!contact.isOnline && (
            <Text style={styles.ephemeralTag}>EPHEMERAL</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
    </TouchableOpacity>
  );
};

// Login Screen
const LoginScreen = () => {
  const { users, login, createAccount } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>CYPHERNET</Text>
        <Text style={styles.subtitle}>EPHEMERAL CONNECTIONS</Text>
        
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.accountButton} 
              onPress={() => login(item.id)}
            >
              <Avatar name={item.name} isOnline={false} />
              <Text style={styles.accountName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
        
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => createAccount(`User ${Math.floor(Math.random() * 1000)}`)}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.createAccountText}>CREATE NEW IDENTITY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Contacts List Screen
const ContactsScreen = () => {
  const { contacts } = useContacts();
  const { currentUser } = useAuth();
  
  // Separate online and offline contacts
  const onlineContacts = contacts.filter(contact => contact.isOnline);
  const offlineContacts = contacts.filter(contact => !contact.isOnline);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/qr-code')}>
          <Ionicons name="qr-code-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.headerTitle}>CYPHERNET</Text>
          <Text style={styles.headerSubtitle}>SECURE • EPHEMERAL • PRIVATE</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={[
          { title: 'ONLINE', data: onlineContacts },
          { title: 'OFFLINE', data: offlineContacts }
        ]}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{item.title}</Text>
            {item.data.map(contact => (
              <ContactItem 
                key={contact.id} 
                contact={contact} 
                onPress={() => router.push({
                  pathname: '/contact/[id]',
                  params: { id: contact.id }
                })}
              />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <ContactsScreen /> : <LoginScreen />;
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
    paddingVertical: Spacing.small,
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
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  headerButton: {
    padding: Spacing.small,
  },
  section: {
    marginBottom: Spacing.medium,
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.primary,
    marginHorizontal: Spacing.medium,
    marginVertical: Spacing.small,
    letterSpacing: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 65, 0.1)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarOnline: {
    borderColor: Colors.primary,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  onlineIndicator: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
    bottom: 0,
    right: 0,
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.medium,
  },
  contactName: {
    ...Typography.body,
    marginBottom: 2,
  },
  lastSeenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSeen: {
    ...Typography.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  onlineText: {
    color: Colors.online,
  },
  ephemeralTag: {
    fontSize: 8,
    color: Colors.faded,
    marginLeft: 8,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  loginContainer: {
    flex: 1,
    padding: Spacing.medium,
  },
  title: {
    ...Typography.title,
    color: Colors.primary,
    fontSize: 28,
    textAlign: 'center',
    marginTop: Spacing.large * 2,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.large * 2,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.medium,
    backgroundColor: Colors.card,
    borderRadius: 4,
    marginBottom: Spacing.small,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  accountName: {
    ...Typography.body,
    marginLeft: Spacing.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.small,
    opacity: 0.3,
  },
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.large,
    padding: Spacing.medium,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  createAccountText: {
    ...Typography.button,
    marginLeft: Spacing.small,
    letterSpacing: 1,
    fontSize: 14,
  },
});
