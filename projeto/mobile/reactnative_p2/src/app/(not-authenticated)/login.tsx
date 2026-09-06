import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/base';
import Input from '@/src/components/base/Input';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

export default function Login() {
  const { signIn } = useAuthValue();
  const theme = useThemeValue();
  const styles = getStyles(theme);

  const handleSignIn = async () => {
    const email = 'some email';
    const password = 'some password';
    await signIn(email, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >

        {/* header */}
        <View style={styles.header}>
          <Text style={[styles.title]}>
            Pizzaria
            <Text style={[styles.titleComplement]}>Coletti</Text>
          </Text>

          <Text style={[styles.subtitle]}>Garçom App</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Input
            label='Email'
            textInputProps={{
              placeholder: "Email",
              placeholderTextColor: theme.colors.disabled,
              keyboardType: "email-address",
              autoCapitalize: "none",
            }}
          />

          <Input
            label='Password'

            textInputProps={{
              placeholder: "Password",
              placeholderTextColor: theme.colors.disabled,
              secureTextEntry: true,
              autoCapitalize: "none",
            }}
          />

          <Button
            title="Login"
            variant="success"
            buttonPros={{
              onPress: handleSignIn
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },
    scrollView: {
      justifyContent: 'center',
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.md,
    },
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },

    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      color: theme.colors.primaryText,
      fontSize: 34,
      fontWeight: 'bold',
    },
    titleComplement: {
      color: theme.colors.secondary,
    },
    subtitle: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.lg,
    },
  });
}
