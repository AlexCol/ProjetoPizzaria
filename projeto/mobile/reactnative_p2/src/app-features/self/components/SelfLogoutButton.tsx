import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/src/components/base';
import { UseSelfStates } from '../useSelf';

interface SelfLogoutButtonProps {
  states: UseSelfStates;
}

export default function SelfLogoutButton({ states }: SelfLogoutButtonProps) {
  const { handleSignOut, isSigningOut, styles } = states;

  return (
    <Button
      title='Sair da conta'
      variant='danger'
      loading={isSigningOut}
      style={styles.logoutButton}
      buttonPros={{
        onPress: handleSignOut,
        accessibilityLabel: 'Sair da conta',
      }}
    >
      {isSigningOut ? (
        <ActivityIndicator color='#ffffff' />
      ) : (
        <View style={styles.logoutContent}>
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            size={20}
            tintColor='#ffffff'
          />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </View>
      )}
    </Button>
  );
}
