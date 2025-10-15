
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import cores from './src/cores';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Pizzaria!</Text>
      <StatusBar backgroundColor={cores.darkGray3} barStyle="light-content" translucent={false} />
    </View>
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
