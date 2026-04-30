import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getJsonBadgeColor, JSON_TYPE_LABELS, type JsonDisplayType } from '../constants';
import type { ThemeColors } from '../types';

type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'null';

interface JsonPropertyEditorProps {
  visible: boolean;
  propertyKey: string;
  initialValue: unknown;
  theme: ThemeColors;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

const PRIMITIVE_TYPES: JsonPrimitiveType[] = ['string', 'number', 'boolean', 'null'];

function getInitialType(value: unknown): JsonPrimitiveType {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  return 'string';
}

export function JsonPropertyEditor({
  visible,
  propertyKey,
  initialValue,
  theme,
  onSave,
  onCancel,
}: JsonPropertyEditorProps) {
  const [type, setType] = useState<JsonPrimitiveType>(getInitialType(initialValue));
  const [stringValue, setStringValue] = useState('');
  const [numberValue, setNumberValue] = useState('0');
  const [booleanValue, setBooleanValue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const t = getInitialType(initialValue);
      setType(t);
      setStringValue(typeof initialValue === 'string' ? initialValue : '');
      setNumberValue(typeof initialValue === 'number' ? String(initialValue) : '0');
      setBooleanValue(typeof initialValue === 'boolean' ? initialValue : false);
      setError(null);
    }
  }, [visible, initialValue]);

  const handleSave = useCallback(() => {
    switch (type) {
      case 'null':
        onSave(null);
        break;
      case 'boolean':
        onSave(booleanValue);
        break;
      case 'number': {
        const num = Number(numberValue);
        if (Number.isNaN(num)) {
          setError(`"${numberValue}" is not a valid number`);
          return;
        }
        onSave(num);
        break;
      }
      case 'string':
        onSave(stringValue);
        break;
    }
  }, [type, stringValue, numberValue, booleanValue, onSave]);

  const badgeColor = (t: JsonPrimitiveType) => getJsonBadgeColor(t as JsonDisplayType, theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}
        onPress={onCancel}
      >
        <View
          style={[styles.editor, { backgroundColor: theme.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Edit Property</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Property</Text>
            <Text
              style={[
                styles.propertyName,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              {propertyKey}
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
            <View style={styles.typeRow}>
              {PRIMITIVE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === t ? badgeColor(t) : theme.background,
                      borderColor: type === t ? badgeColor(t) : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setType(t);
                    setError(null);
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === t ? theme.badgeText : theme.text },
                    ]}
                  >
                    {JSON_TYPE_LABELS[t as JsonDisplayType]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Value</Text>
            {type === 'null' ? (
              <Text style={[styles.nullText, { color: theme.textMuted }]}>null</Text>
            ) : type === 'boolean' ? (
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>
                  {booleanValue ? 'true' : 'false'}
                </Text>
                <Switch
                  value={booleanValue}
                  onValueChange={setBooleanValue}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
            ) : type === 'number' ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                value={numberValue}
                onChangeText={(v) => {
                  setNumberValue(v);
                  setError(null);
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholderTextColor={theme.textMuted}
                placeholder="0"
              />
            ) : (
              <TextInput
                style={[
                  styles.valueInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                value={stringValue}
                onChangeText={(v) => {
                  setStringValue(v);
                  setError(null);
                }}
                multiline
                numberOfLines={3}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholderTextColor={theme.textMuted}
                placeholder="value"
              />
            )}

            {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, { borderColor: theme.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.footerButtonText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.footerButtonText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  editor: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nullText: {
    fontSize: 14,
    fontFamily: 'monospace',
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  valueInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
