import { View } from 'react-native';
import Loader from '@/src/components/Loader';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import NewOrderItemButton from './components/NewOrderItemButton';
import NewOrderItemHeader from './components/NewOrderItemHeader';
import NewOrderItemSelectedItems from './components/NewOrderItemSelectedItems';
import NewOrderItemSelectors from './components/NewOrderItemSelectors';
import { useNewOrderItems } from './useNewOrderItems';

export default function NewOrderItem() {
  const states = useNewOrderItems();

  if (states.isLoading) {
    return <Loader />;
  }

  return (
    <MyKeyboardAvoidingView>
      <View style={states.styles.container}>
        <NewOrderItemHeader states={states} />
        <NewOrderItemSelectors states={states} />
        <NewOrderItemSelectedItems states={states} />
        <NewOrderItemButton states={states} />
      </View>
    </MyKeyboardAvoidingView>
  );
}
