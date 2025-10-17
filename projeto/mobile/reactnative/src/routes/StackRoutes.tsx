import React from 'react';

import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import MainConfigStack from '../pages/Main/main.config.stack';
import SignInConfigStack from '../pages/SignIn/signIn.config.stack';
import { RoutesStackParamList } from './RoutesStackParamList';

type stackType = ReturnType<typeof createNativeStackNavigator<RoutesStackParamList>>;

function StackRoutes() {
  const stackPagesList = [
    MainConfigStack,
    SignInConfigStack
  ];
  const Stack: stackType = createNativeStackNavigator<RoutesStackParamList>();
  const stackOptions: NativeStackNavigationOptions = {
    animation: 'fade',
  }

  return (// NavigationContainer está em APP, pois é o container principal da navegação e a Drawer tbm pode o usar
    <Stack.Navigator screenOptions={stackOptions} >
      {
        stackPagesList.map((ScreenConfig) => (
          <Stack.Screen
            key={ScreenConfig.name}
            name={ScreenConfig.name as keyof RoutesStackParamList}
            component={ScreenConfig.component}
            options={ScreenConfig.options}
          />
        ))
      }
    </Stack.Navigator>
  )
}

export default StackRoutes