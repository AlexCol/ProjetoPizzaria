import { Text } from 'react-native';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';

export default function Dashboard() {
  return (
    <MyKeyboardAvoidingView>
      <MyScrollView>
        <Text>Dashboard</Text>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
