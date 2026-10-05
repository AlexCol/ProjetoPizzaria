import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import NewOrderItemButton from './components/NewOrderItemButton';
import NewOrderItemHeader from './components/NewOrderItemHeader';
import NewOrderItemSelectedItems from './components/NewOrderItemSelectedItems';
import NewOrderItemSelectors from './components/NewOrderItemSelectors';
import { useNewOrderItems } from './useNewOrderItems';

export default function NewOrderItem() {
  const states = useNewOrderItems();

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView
        // contentContainerStyle={states.styles.container}
        scrollViewProps={{
          contentInsetAdjustmentBehavior: 'automatic',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        <NewOrderItemHeader states={states} />
        <NewOrderItemSelectedItems states={states} />
        <NewOrderItemSelectors states={states} />
        <NewOrderItemButton states={states} />
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
