import { Pressable, Text, View } from 'react-native';
import { UseNewOrderItemsStates } from '../../../useNewOrderItems';

type NewOrderItemAddItemControlProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemAddItemControl({ states }: NewOrderItemAddItemControlProps) {
  const { quantity, setQuantity } = states;

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  return (
    <View style={states.styles.controlContainer}>
      <Text style={states.styles.itemControlText}>Quantidade</Text>

      <View style={states.styles.buttonControlsContainer}>
        <Pressable
          style={[states.styles.buttonControl, quantity === 1 && { opacity: 0.5 }]}
          disabled={quantity === 1}
          onPress={decreaseQuantity}
        >
          <Text style={states.styles.buttonControlText}>-</Text>
        </Pressable>

        <Text style={states.styles.quantityText}>{quantity}</Text>

        <Pressable style={states.styles.buttonControl} onPress={increaseQuantity}>
          <Text style={states.styles.buttonControlText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
