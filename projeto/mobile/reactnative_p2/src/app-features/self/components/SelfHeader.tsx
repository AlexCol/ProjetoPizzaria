import { Text, View } from 'react-native';
import { UseSelfStates } from '../useSelf';

interface SelfHeaderProps {
  states: UseSelfStates;
}

export default function SelfHeader({ states }: SelfHeaderProps) {
  const { initials, styles, user } = states;

  if (!user) {
    return null;
  }

  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.title}>{user.name}</Text>
      <Text style={styles.subtitle}>{user.role.name}</Text>
    </View>
  );
}
