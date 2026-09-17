import { Tabs } from 'expo-router';
import { BottomTabNavigationOptions } from 'expo-router/build/react-navigation/bottom-tabs';
import { SymbolView } from 'expo-symbols';
import { ThemeColors } from '@/src/contexts/theme/constants/colors';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';

export default function Layout() {
  const { colors } = useThemeValue();
  const { tabOptions } = getTabOptions(colors);

  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen
        name='(dashboard)'
        options={{
          title: 'Pedidos',
          headerShown: false,
          // sobre cada prop, comentário abaixo
          tabBarIcon: ({ focused, color, size }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'house.fill', android: 'in_home_mode', web: 'in_home_mode' }
                  : { ios: 'house', android: 'home', web: 'home' }
              }
              size={size}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name='(new-orders)'
        options={{
          title: 'Novo Pedido',
          headerShown: false,
          // sobre cada prop, comentário abaixo
          tabBarIcon: ({ focused, color, size }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'list.bullet.rectangle.fill', android: 'receipt_long', web: 'receipt_long' }
                  : { ios: 'list.bullet.rectangle', android: 'receipt', web: 'receipt' }
              }
              size={size}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name='(self)'
        options={{
          title: 'Pessoal',
          headerShown: false,
          // sobre cada prop, comentário abaixo
          tabBarIcon: ({ focused, color, size }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'person.fill', android: 'person', web: 'person' }
                  : { ios: 'person', android: 'person_outline', web: 'person_outline' }
              }
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function getTabOptions(colors: ThemeColors) {
  const tabOptions: BottomTabNavigationOptions = {
    sceneStyle: {
      backgroundColor: colors.background,
    },
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTitleStyle: {
      color: colors.primaryText,
      fontWeight: '700',
    },
    headerTintColor: colors.primaryText,
    headerShadowVisible: false,
    tabBarStyle: {
      backgroundColor: colors.background2,
      borderTopColor: colors.border,
      borderTopWidth: 0.5,
      paddingBottom: 6,
      height: 64,
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.disabled,
    tabBarActiveBackgroundColor: `${colors.primary}18`,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
    tabBarItemStyle: {
      borderRadius: 14,
      marginHorizontal: 6,
    },
    tabBarHideOnKeyboard: true,
  };

  return { tabOptions };
}

/*
 * focused: true quando a aba está selecionada.
 * color: recebe tabBarActiveTintColor ou tabBarInactiveTintColor.
 * size: tamanho calculado pelo navegador. Para usar outro tamanho, ignore essa prop e passe um valor próprio ao componente do ícone.
 */
