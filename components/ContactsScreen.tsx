import React from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import { useContacts } from "../context/ContactsContext";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import ContactItem from "./ContactItem";

const ContactsScreen = () => {
  const { contacts } = useContacts();
  
  const onlineContacts = contacts.filter(contact => contact.isOnline);
  const offlineContacts = contacts.filter(contact => !contact.isOnline);

  // Function to handle navigating to contact info
  const handleContactInfo = (contactId: string) => {
    router.push({
      pathname: '/contact/[id]',
      params: { id: contactId }
    });
  };

  // Function to handle navigating to chat
  const handleOpenChat = (contactId: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: contactId }
    });
  };

  // Render a contact with action buttons
  const renderContact = (contact: any) => (
    <View key={contact.id} style={styles.contactWrapper}>
      <View style={styles.contactMainContainer}>
        <ContactItem 
          contact={contact} 
          onPress={() => handleOpenChat(contact.id)}
        />
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => handleContactInfo(contact.id)}
        >
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/qr-code')}>
          <Ionicons name="qr-code-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.headerTitle}>EPHEM</Text>
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
            {item.data.map((contact: any) => renderContact(contact))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

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
  contactWrapper: {
    width: '100%',
  },
  contactMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoButton: {
    padding: Spacing.small,
    marginRight: Spacing.small,
  },
});

export default ContactsScreen;