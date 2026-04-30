import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from '../types';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmTypeText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: ThemeColors;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmTypeText,
  onConfirm,
  onCancel,
  theme,
  destructive = false,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState('');

  const canConfirm = confirmTypeText ? typedText === confirmTypeText : true;

  const handleConfirm = () => {
    if (canConfirm) {
      setTypedText('');
      onConfirm();
    }
  };

  const handleCancel = () => {
    setTypedText('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          {confirmTypeText && (
            <View style={styles.typeConfirmContainer}>
              <Text style={[styles.typePrompt, { color: theme.textMuted }]}>
                Type "{confirmTypeText}" to confirm:
              </Text>
              <TextInput
                style={[
                  styles.typeInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                value={typedText}
                onChangeText={setTypedText}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { borderColor: theme.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: canConfirm
                    ? destructive
                      ? theme.danger
                      : theme.primary
                    : theme.textMuted,
                },
              ]}
              onPress={handleConfirm}
              disabled={!canConfirm}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  typeConfirmContainer: {
    marginBottom: 16,
  },
  typePrompt: {
    fontSize: 12,
    marginBottom: 6,
  },
  typeInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
