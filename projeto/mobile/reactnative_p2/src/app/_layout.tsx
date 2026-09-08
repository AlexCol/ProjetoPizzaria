import RootNavigator from '../components/navigation/RootNavigator';
import { AuthProvider } from '../contexts/auth/AuthContext';
import { ThemeProvider } from '../contexts/theme/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* RootNavigator = pode ser a 'Main' */}
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
