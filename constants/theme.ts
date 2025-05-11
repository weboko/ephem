import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

export const Colors = {
  background: '#000000',
  card: '#121212',
  primary: '#00FF41', // Matrix green
  secondary: '#4deeea', // Cyan accent
  text: '#FFFFFF',
  textSecondary: '#00cc33', // Muted Matrix green
  border: '#0a140a',
  error: '#FF453A',
  online: '#00FF41',
  offline: '#4A4A4A',
  terminal: '#00cc33', // For code-like or terminal-like elements
  highlight: '#00FF41', // For highlights and selections
  faded: 'rgba(0, 255, 65, 0.3)', // Transparent green for subtle effects
};

export const Typography = {
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  digital: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.terminal,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
};

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const CommonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    borderColor: Colors.border,
    borderWidth: 1,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.small,
    opacity: 0.3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: Colors.card,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  terminalText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.terminal,
  },
  matrixBackground: {
    backgroundColor: Colors.background,
  },
  ephemeralTag: {
    fontSize: 10,
    color: Colors.terminal,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});