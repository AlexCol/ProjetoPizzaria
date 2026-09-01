import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '../../routes/RoutesStackParamList';

export default function SignIn() {
  const navigation = useNavigation<StackNavigationProp>();
  const navigate = () => {
    navigation.navigate("Main");
  }

  return (
    <View>
      <Text>Tela de Login</Text>
      <TouchableOpacity onPress={navigate}>
        <Text>Go to Main</Text>
      </TouchableOpacity>
    </View>
  )
}