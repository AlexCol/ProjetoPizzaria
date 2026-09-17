import { StyleSheet } from 'react-native';
import { ThemeContextType } from '@/src/contexts/theme/ThemeContext';

export default function getSelfStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    content: {
      // justifyContent: 'flex-start',
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatar: {
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}20`,
      borderColor: `${theme.colors.primary}50`,
      borderRadius: 44,
      borderWidth: 1,
      height: 88,
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      width: 88,
    },
    avatarText: {
      color: theme.colors.primary,
      fontSize: 32,
      fontWeight: '700',
    },
    title: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.foreground,
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.background2,
      borderColor: `${theme.colors.border}55`,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    infoRow: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 58,
    },
    iconContainer: {
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}18`,
      borderRadius: theme.borderRadius.md,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    infoText: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    helperText: {
      color: theme.colors.foreground,
      fontSize: theme.fontSize.xs,
    },
    label: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    value: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      fontWeight: '500',
      marginTop: 2,
    },
    divider: {
      backgroundColor: `${theme.colors.border}35`,
      height: StyleSheet.hairlineWidth,
      marginLeft: 56,
    },
    settingRow: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 58,
    },
    settingText: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    logoutButton: {
      marginTop: theme.spacing.sm,
    },
    logoutContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    logoutText: {
      color: '#ffffff',
      fontSize: theme.fontSize.md,
      fontWeight: '700',
    },
  });
}
