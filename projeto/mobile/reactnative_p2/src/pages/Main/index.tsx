import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '../../routes/RoutesStackParamList';

export default function Main() {
  const navigation = useNavigation<StackNavigationProp>();
  const navigate = () => {
    navigation.navigate("SignIn");
  }

  return (
    <View>
      <Text>Tela Principal</Text>
      <TouchableOpacity onPress={navigate}>
        <Text>Go to Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}