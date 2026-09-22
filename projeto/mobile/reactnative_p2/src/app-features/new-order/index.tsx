import { Text, View } from 'react-native';
import { Input } from '@/src/components/base';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import useNewOrder from './useNewOrder';

export default function NewOrder() {
  const states = useNewOrder();
  const { styles } = states;

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView
        contentContainerStyle={states.styles.container}
        scrollViewProps={{
          contentInsetAdjustmentBehavior: 'automatic',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        {/* header */}
        <View style={styles.header}>
          <Text style={[styles.title]}>
            Pizzaria
            <Text style={[styles.titleComplement]}>Coletti</Text>
          </Text>
        </View>

        <Text style={styles.label}>Novo Pedido</Text>
        <Input
          textInputProps={{
            placeholder: 'Numero da mesa...',
            placeholderTextColor: styles.placeholder.color,
            style: styles.input,
            keyboardType: 'numeric',
          }}
        />
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
