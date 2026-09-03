import { colorsDefault } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const colors = colorsDefault;
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {false ?
          <Stack.Screen name="(authenticated)" />
          :
          <Stack.Screen name="(not-authenticated)" />
        }
      </Stack>
    </>
  );
}