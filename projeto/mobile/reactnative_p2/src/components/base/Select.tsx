import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

type SelectProps = {
  label?: string;
  options: SelectOptions[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

type SelectOptions = {
  label: string;
  value: string;
};

export default function Select({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
  disabled = false,
}: SelectProps) {
  /****************************************************/
  /* Variaveis vindas de Hooks ou Metodos externos    */
  /****************************************************/
  //#region Variaveis vindas de Hooks ou Metodos externos
  const theme = useThemeValue();
  const styles = getStyles(theme, disabled);
  //#endregion

  /****************************************************/
  /* Variaveis derivadas dos props e estado interno   */
  /****************************************************/
  //#region Variaveis derivadas dos props e estado interno
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  //#endregion

  /****************************************************/
  /* Metodos internos do componente                   */
  /****************************************************/
  //#region Metodos internos do componente
  const openModal = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const onOptionPress = (value: string) => {
    onValueChange(value);
    closeModal();
  };

  const getOptionItemStyle = (item: SelectOptions) => {
    return [styles.optionItemText, item.value === selectedOption?.value && styles.optionItemTextSelected];
  };

  //#endregion

  /****************************************************/
  /* Renderizacao do componente                       */
  /****************************************************/
  //#region Renderizacao do componente
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.select} onPress={openModal} disabled={disabled}>
        <Text style={styles.selectText}>{displayText}</Text>
        <Feather name='chevron-down' size={24} color={theme.colors.primaryText} />
      </Pressable>

      <Modal visible={modalVisible} transparent={true} animationType='fade' onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>

              <Pressable onPress={closeModal}>
                <Feather name='x' size={24} color={theme.colors.danger} />
              </Pressable>
            </View>

            <FlatList
              showsVerticalScrollIndicator={false}
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.optionItem} onPress={() => onOptionPress(item.value)}>
                  <Text style={getOptionItemStyle(item)}>
                    {item.value === selectedOption?.value && '✓ '}
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
  //#endregion
}

/****************************************************/
/* Estilos do componente                            */
/****************************************************/
//#region Estilos do componente
const getStyles = (theme: ThemeContextType, disabled: boolean) => {
  return StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.md,
    },
    label: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },

    select: {
      backgroundColor: disabled ? theme.colors.border : theme.colors.secondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
    },
    selectText: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      flex: 1,
    },
    placeholderText: {
      color: theme.colors.border,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      width: '100%',
      maxHeight: '80%',
      minHeight: '50%',
      borderRadius: theme.borderRadius.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      color: theme.colors.tertiary,
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },

    optionItem: {
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
    optionItemText: {
      color: theme.colors.primaryText,
    },
    optionItemTextSelected: {
      color: theme.colors.secondary,
      fontWeight: '600',
    },
  });
};
//#endregion
