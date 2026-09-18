import { Text } from 'react-native';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import useNewOrder from './useNewOrder';

export default function NewOrder() {
  const states = useNewOrder();

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView
        contentContainerStyle={states.styles.container}
        scrollViewProps={{
          contentInsetAdjustmentBehavior: 'automatic',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        <Text style={{ color: 'white' }}>New Order</Text>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
