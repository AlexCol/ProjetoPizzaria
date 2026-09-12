import RootNavigator from '../components/navigation/RootNavigator';
import { AuthProvider } from '../contexts/auth/AuthContext';
import { SseProvider } from '../contexts/sse/SSEContext';
import { ThemeProvider } from '../contexts/theme/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SseProvider>
        <AuthProvider>
          {/* RootNavigator = pode ser a 'Main' */}
          {/* não usado aqui, pois ela usa tanto ta Theme com oa Auth providers */}
          <RootNavigator />
        </AuthProvider>
      </SseProvider>
    </ThemeProvider>
  );
}
