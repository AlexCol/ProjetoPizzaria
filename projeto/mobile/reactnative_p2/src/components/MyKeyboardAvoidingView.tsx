import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useThemeValue } from '../contexts/theme/ThemeContext';

type MyKeyboardAvoidingViewProps = {
  children: React.ReactNode,
  style?: object,
}

function MyKeyboardAvoidingView({ children, style }: MyKeyboardAvoidingViewProps) {
  const theme = useThemeValue();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, style]}
    >
      {children}
    </KeyboardAvoidingView>
  )
}

export default MyKeyboardAvoidingView