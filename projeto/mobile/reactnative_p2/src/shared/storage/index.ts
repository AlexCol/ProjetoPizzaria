import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorageKey = 'sessionToken' | 'theme';

export async function getValueFromStorage(key: StorageKey) {
  return AsyncStorage.getItem(key);
}

export async function saveValueOnStorage(key: StorageKey, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function removeValueFromStorage(key: StorageKey) {
  await AsyncStorage.removeItem(key);
}
