import { StatusBar } from "expo-status-bar";
import RootNavigator from "../components/navigation/RootNavigator";
import { AuthProvider } from "../contexts/auth/AuthContext";

export default function RootLayout() {
  return (

    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}