import { View, Text, StyleSheet } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

type SelectProps = {
  label: string;
  options: SelectOptions[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

type SelectOptions = {
  label: string;
  value: string;
};

export default function Select({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
}: SelectProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <View>
      <Text>{label}</Text>
    </View>
  );
}

const getStyles = (theme: ThemeContextType) => {
  return StyleSheet.create({});
};
