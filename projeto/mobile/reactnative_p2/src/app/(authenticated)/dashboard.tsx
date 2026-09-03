import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const { signOut } = useAuthValue();
  return (
    <View>
      <Text>dashboard</Text>
      <TouchableOpacity onPress={signOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}