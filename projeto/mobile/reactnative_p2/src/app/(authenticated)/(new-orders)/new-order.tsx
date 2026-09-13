import { Text } from 'react-native';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';

export default function Orders() {
  return (
    <MyKeyboardAvoidingView>
      <MyScrollView>
        <Text>Orders</Text>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
