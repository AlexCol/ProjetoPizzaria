import { StatusBar } from "expo-status-bar";
import RootNavigator from "../components/navigation/RootNavigator";
import { AuthProvider } from "../contexts/auth/AuthContext";
import { ThemeProvider } from "../contexts/theme/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}