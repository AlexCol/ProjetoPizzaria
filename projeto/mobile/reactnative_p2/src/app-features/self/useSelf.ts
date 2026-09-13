import { useState } from 'react';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import getSelfStyles from './self.styles';

export default function useSelf() {
  const { session, signOut } = useAuthValue();
  const theme = useThemeValue();
  const styles = getSelfStyles(theme);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    user,
    initials: getInitials(user?.name),
    formattedStatus: formatStatus(user?.status),
    isSigningOut,
    handleSignOut,
    theme,
    styles,
  };
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return '?';
  }

  const nameParts = name.trim().split(/\s+/);
  const initials = nameParts.length === 1 ? nameParts[0][0] : `${nameParts[0][0]}${nameParts.at(-1)?.[0] ?? ''}`;

  return initials.toUpperCase();
}

function formatStatus(status?: string) {
  if (!status) {
    return '';
  }

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === 'active' || normalizedStatus === 'ativo' || normalizedStatus === 'true') {
    return 'Ativo';
  }

  if (normalizedStatus === 'inactive' || normalizedStatus === 'inativo' || normalizedStatus === 'false') {
    return 'Inativo';
  }

  return status;
}

export type UseSelfStates = ReturnType<typeof useSelf>;
