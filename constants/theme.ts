import { StyleSheet } from 'react-native';

export const Colors = {
  background: '#000000',
  card: '#121212',
  primary: '#0A84FF', // iOS blue
  secondary: '#30D158', // iOS green
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF453A',
  online: '#30D158',
  offline: '#8E8E93',
};

export const Typography = {
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
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
    borderRadius: 12,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    borderColor: Colors.border,
    borderWidth: 1,
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
    backgroundColor: Colors.border,
    marginVertical: Spacing.small,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.card,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});