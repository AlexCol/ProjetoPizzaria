import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Button } from '@/src/components/base';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import { NewOrderItemPageDto } from '@/src/models/dtos/NewOrderItemPageDto';

export default function NewOrderItem() {
  const router = useRouter();
  const { mesaId, orderId } = useLocalSearchParams<NewOrderItemPageDto>();

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView
        // contentContainerStyle={states.styles.container}
        scrollViewProps={{
          contentInsetAdjustmentBehavior: 'automatic',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        <View>
          <Text>NewOrderItem</Text>
          <Text>Mesa ID: {mesaId}</Text>
          <Text>Order ID: {orderId}</Text>
          <Button
            title='Back'
            variant='default'
            buttonPros={{
              onPress: () => router.back(),
            }}
          />
        </View>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
