// import { Stack } from "expo-router";

// export default function AuthenticatedLayout() {
//   return (
//     <Stack>
//       <Stack.Screen name="dashboard" />
//     </Stack>
//   );
// }

import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="dashboard" options={{ title: "Início" }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos" }} />
    </Tabs>
  );
}