import { Text } from 'react-native';
import { useNewOrder } from '@/src/app-features/new-order';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';

export default function NewOrder() {
  const states = useNewOrder();

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView
        contentContainerStyle={states.styles.container}
        scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
      >
        <Text>New Order</Text>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
