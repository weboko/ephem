import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import Avatar from "./Avatar";
import { Contact } from "../context/ContactsContext";

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
}

const ContactItem = ({ contact, onPress }: ContactItemProps) => {
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

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 65, 0.1)',
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
});

export default ContactItem;