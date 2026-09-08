import { View, ActivityIndicator } from 'react-native';
import { useThemeValue } from '../contexts/theme/ThemeContext';

export default function Loader() {
  const { colors } = useThemeValue();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size='large' color={colors.primary} />
    </View>
  );
}
