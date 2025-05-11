import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/theme";

interface AvatarProps {
  name: string;
  isOnline: boolean;
}

const Avatar = ({ name, isOnline }: AvatarProps) => {
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

const styles = StyleSheet.create({
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
});

export default Avatar;