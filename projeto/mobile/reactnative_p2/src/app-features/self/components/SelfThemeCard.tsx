import { SymbolView } from 'expo-symbols';
import { Switch, Text, View } from 'react-native';
import { UseSelfStates } from '../useSelf';

interface SelfThemeCardProps {
  states: UseSelfStates;
}

export default function SelfThemeCard({ states }: SelfThemeCardProps) {
  const { styles, theme } = states;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Aparência</Text>
      <View style={styles.settingRow}>
        <View style={styles.iconContainer}>
          <SymbolView
            name={
              theme.isDark
                ? { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }
                : { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' }
            }
            size={22}
            tintColor={theme.colors.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.label}>Tema escuro</Text>
          <Text style={styles.helperText}>{theme.isDark ? 'Ativado' : 'Desativado'}</Text>
        </View>
        <Switch
          value={theme.isDark}
          onValueChange={theme.toggleTheme}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor='#ffffff'
          accessibilityLabel='Alternar tema escuro'
        />
      </View>
    </View>
  );
}
