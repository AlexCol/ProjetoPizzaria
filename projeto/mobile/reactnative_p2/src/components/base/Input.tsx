import { ForwardedRef } from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ThemeContextType, useThemeValue } from '../../contexts/theme/ThemeContext';

// interface InputProps extends TextInputProps {
//   label?: string,
// }

interface InputProps {
  ref?: ForwardedRef<TextInput>
  labelStyle?: TextInputProps['style'],
  label?: string,
  textInputProps?: TextInputProps,
}

export default function Input({ label, labelStyle, textInputProps, ref }: InputProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}

      <TextInput
        ref={ref}
        editable={textInputProps?.editable ?? true}
        style={[styles.textInput, textInputProps?.style]}
        {...textInputProps}
      />
    </View>
  )
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    inputLabel: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      marginBottom: theme.spacing.sm,
    },
    textInput: {
      height: 50,

      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,

      paddingHorizontal: theme.spacing.sm,

      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
  });
}
