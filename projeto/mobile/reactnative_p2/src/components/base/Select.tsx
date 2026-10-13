import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);

  const theme = useThemeValue();
  const styles = getStyles(theme);

  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.select} onPress={() => setModalVisible(true)} disabled={disabled}>
        <Text style={styles.selectText}>{displayText}</Text>
        <Feather name='chevron-down' size={24} color={theme.colors.primaryText} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name='x' size={24} color={theme.colors.danger} />
              </Pressable>
            </View>

            {/* LISTA */}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (theme: ThemeContextType) => {
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
      backgroundColor: theme.colors.primary,
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
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
  });
};
