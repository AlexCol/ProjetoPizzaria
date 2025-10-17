
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import cores from './src/cores';
import StackRoutes from './src/routes/StackRoutes';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4FF" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />
        <StackRoutes />
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.darkGray3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
