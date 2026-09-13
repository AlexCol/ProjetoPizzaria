import { SymbolView } from 'expo-symbols';
import { type ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { UseSelfStates } from '../useSelf';

interface SelfAccountCardProps {
  states: UseSelfStates;
}

type InfoRowProps = {
  icon: ComponentProps<typeof SymbolView>['name'];
  label: string;
  value: string;
  states: UseSelfStates;
};

export default function SelfAccountCard({ states }: SelfAccountCardProps) {
  const { formattedStatus, styles, user } = states;

  if (!user) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Minha conta</Text>
      <InfoRow
        icon={{ ios: 'person', android: 'person', web: 'person' }}
        label='Nome'
        value={user.name}
        states={states}
      />
      <View style={styles.divider} />
      <InfoRow
        icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
        label='E-mail'
        value={user.email}
        states={states}
      />
      <View style={styles.divider} />
      <InfoRow
        icon={{ ios: 'person.text.rectangle', android: 'badge', web: 'badge' }}
        label='Perfil'
        value={user.role.name}
        states={states}
      />
      <View style={styles.divider} />
      <InfoRow
        icon={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
        label='Status'
        value={formattedStatus}
        states={states}
      />
    </View>
  );
}

function InfoRow({ icon, label, value, states }: InfoRowProps) {
  const { styles, theme } = states;

  return (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <SymbolView name={icon} size={22} tintColor={theme.colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.helperText}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}
