import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import NewOrderForm from './components/NewOrderForm';
import NewOrderHeader from './components/NewOrderHeader';
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
        <NewOrderHeader states={states} />
        <NewOrderForm states={states} />
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
