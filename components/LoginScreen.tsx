import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const LoginScreen = () => {
  const { users, login, createAccount, deleteAccount, isPassKeySupported } = useAuth();
  const [isCreatingPassKey, setIsCreatingPassKey] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const sortedUsers = [...users].sort((a, b) => {
    if (!a.lastUsed) return 1;
    if (!b.lastUsed) return -1;
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  });

  const handleCreatePassKey = async () => {
    setIsCreatingPassKey(true);
    try {
      await createAccount();
    } catch (error) {
      console.error('Failed to create passkey:', error);
      Alert.alert('Error', 'Failed to create a new identity. Please try again.');
    } finally {
      setIsCreatingPassKey(false);
    }
  };

  const handleLogin = async (userId: string) => {
    setLoginInProgress(userId);
    try {
      const success = await login(userId);

      if (!success) {
        console.log('Login failed or was canceled');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginInProgress(null);
    }
  };

  const handleDeleteAccount = async (userId: string, name: string) => {
    try {
      setDeletingAccountId(userId);
      await deleteAccount(userId);

      console.log(`Identity ${name} successfully deleted`);
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert('Error', 'Failed to delete the identity. Please try again.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>CYPHERNET</Text>
        <Text style={styles.subtitle}>EPHEMERAL CONNECTIONS</Text>
        
        {!isPassKeySupported && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={20} color={Colors.warning} />
            <Text style={styles.warningText}>
              PassKeys not fully supported on this device. Using simulated implementation.
            </Text>
          </View>
        )}
        
        {sortedUsers.length > 0 ? (
          <View style={styles.passkeysContainer}>
            <Text style={styles.sectionTitle}>YOUR IDENTITIES</Text>
            <FlatList
              data={sortedUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.accountItemContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.accountButton,
                      loginInProgress === item.id && styles.accountButtonActive
                    ]} 
                    onPress={() => handleLogin(item.id)}
                    disabled={loginInProgress !== null}
                  >
                    <Avatar name={item.name} isOnline={false} />
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountName}>{item.name}</Text>
                      <Text style={styles.accountCreated}>
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                      {item.lastUsed && (
                        <Text style={styles.accountLastUsed}>
                          Last used: {new Date(item.lastUsed).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    {loginInProgress === item.id ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Ionicons name="log-in-outline" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAccount(item.id, item.name)}
                    disabled={loginInProgress !== null || deletingAccountId !== null}
                  >
                    {deletingAccountId === item.id ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              contentContainerStyle={styles.listContentContainer}
            />
          </View>
        ) : (
          <View style={styles.noPasskeysContainer}>
            <Ionicons name="key-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.noPasskeysText}>No identities found</Text>
            <Text style={styles.noPasskeysSubtext}>Create your first secure identity to get started</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.createAccountButton, (isCreatingPassKey || loginInProgress !== null) && styles.buttonDisabled]}
          onPress={handleCreatePassKey}
          disabled={isCreatingPassKey || loginInProgress !== null}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={24} 
            color={(isCreatingPassKey || loginInProgress !== null) ? Colors.textSecondary : Colors.primary} 
          />
          <Text style={[styles.createAccountText, (isCreatingPassKey || loginInProgress !== null) && styles.textDisabled]}>
            {isCreatingPassKey ? 'CREATING IDENTITY...' : 'CREATE NEW IDENTITY'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  passkeysContainer: {
    flex: 1,
    marginTop: Spacing.large,
  },
  listContentContainer: {
    width: '100%',
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.primary,
    marginBottom: Spacing.small,
    letterSpacing: 1,
  },
  accountItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.small,
    width: '100%',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.medium,
    backgroundColor: Colors.card,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
    flex: 1,
  },
  accountButtonActive: {
    borderLeftColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`, // 10% opacity of primary color
  },
  accountDetails: {
    flex: 1,
    marginLeft: Spacing.medium,
  },
  accountName: {
    ...Typography.body,
  },
  accountCreated: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accountLastUsed: {
    fontSize: 10,
    color: Colors.faded,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.medium,
    marginLeft: Spacing.small,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.small,
    opacity: 0.3,
    width: '100%',
  },
  noPasskeysContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.large * 2,
  },
  noPasskeysText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.medium,
  },
  noPasskeysSubtext: {
    fontSize: 12,
    color: Colors.faded,
    textAlign: 'center',
    marginTop: Spacing.small,
    maxWidth: '80%',
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
    width: '100%',
  },
  createAccountText: {
    ...Typography.button,
    marginLeft: Spacing.small,
    letterSpacing: 1,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    color: Colors.textSecondary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 196, 0, 0.1)',
    padding: Spacing.small,
    borderRadius: 4,
    marginTop: Spacing.medium,
    width: '100%',
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: Spacing.small,
    flex: 1,
  },
});

export default LoginScreen;