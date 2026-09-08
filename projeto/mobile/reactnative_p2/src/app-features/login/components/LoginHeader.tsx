import { View, Text } from 'react-native';
import { UseLoginStates } from '../useLogin';

interface LoginHeaderProps {
  states: UseLoginStates;
}

export default function LoginHeader({ states }: LoginHeaderProps) {
  const { styles } = states;

  return (
    <View style={styles.header}>
      <Text style={[styles.title]}>
        Pizzaria
        <Text style={[styles.titleComplement]}>Coletti</Text>
      </Text>

      <Text style={[styles.subtitle]}>Garçom App</Text>
    </View>
  );
}
