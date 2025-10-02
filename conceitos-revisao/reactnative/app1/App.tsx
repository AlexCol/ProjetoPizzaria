
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar barStyle={'dark-content'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f06',
    //alignItems: 'center',
    //justifyContent: 'center',
    marginTop: StatusBar.currentHeight ? StatusBar.currentHeight : 20,
    marginBottom: StatusBar.currentHeight ? StatusBar.currentHeight : 20,
  },
});
