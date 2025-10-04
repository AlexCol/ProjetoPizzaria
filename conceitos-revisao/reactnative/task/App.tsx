import { StatusBar, StyleSheet, View } from 'react-native';
import Tasks from './src/Tasks';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Tasks />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22272e',
    marginTop: StatusBar.currentHeight,
  }
});
