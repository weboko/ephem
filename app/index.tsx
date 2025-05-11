import { useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
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
    <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
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
        <Text style={styles.lastSeen}>
          {contact.isOnline ? "Online" : `Last seen: ${contact.lastSeen}`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
};

// Login Screen
const LoginScreen = () => {
  const { users, login, createAccount } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Select an Account</Text>
        
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
          <Text style={styles.createAccountText}>Create New Account</Text>
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
        
        <Text style={styles.headerTitle}>Contacts</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={[
          { title: 'Online', data: onlineContacts },
          { title: 'Offline', data: offlineContacts }
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
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.title,
    textAlign: 'center',
  },
  headerButton: {
    padding: Spacing.small,
  },
  section: {
    marginBottom: Spacing.medium,
  },
  sectionHeader: {
    ...Typography.caption,
    marginHorizontal: Spacing.medium,
    marginVertical: Spacing.small,
    textTransform: 'uppercase',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.medium,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
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
  lastSeen: {
    ...Typography.caption,
  },
  loginContainer: {
    flex: 1,
    padding: Spacing.medium,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
    marginVertical: Spacing.large,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.medium,
    backgroundColor: Colors.card,
    borderRadius: 10,
    marginBottom: Spacing.small,
  },
  accountName: {
    ...Typography.body,
    marginLeft: Spacing.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.small,
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
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  createAccountText: {
    ...Typography.button,
    marginLeft: Spacing.small,
  },
});
