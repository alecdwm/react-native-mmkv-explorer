import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBadgeColor, TYPE_LABELS } from '../constants';
import type { MMKVValueType, ThemeColors } from '../types';

interface ValueEditorProps {
  visible: boolean;
  initialKey?: string;
  initialType?: MMKVValueType;
  initialValue?: string;
  isNewKey: boolean;
  editorMode?: 'plain' | 'json';
  theme: ThemeColors;
  onSave: (key: string, type: MMKVValueType, value: string) => void;
  onCancel: () => void;
}

const VALUE_TYPES: MMKVValueType[] = ['string', 'number', 'boolean', 'binary'];

export function ValueEditor({
  visible,
  initialKey = '',
  initialType = 'string',
  initialValue = '',
  isNewKey,
  editorMode = 'plain',
  theme,
  onSave,
  onCancel,
}: ValueEditorProps) {
  const [key, setKey] = useState(initialKey);
  const [type, setType] = useState<MMKVValueType>(initialType);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const isJsonMode = editorMode === 'json';

  useEffect(() => {
    if (visible) {
      setKey(initialKey);
      setType(isJsonMode ? 'string' : initialType);
      if (isJsonMode) {
        try {
          setValue(JSON.stringify(JSON.parse(initialValue), null, 2));
        } catch {
          setValue(initialValue);
        }
      } else {
        setValue(initialValue);
      }
      setError(null);
    }
  }, [visible, initialKey, initialType, initialValue, isJsonMode]);

  const validate = useCallback((): boolean => {
    if (!key.trim()) {
      setError('Key cannot be empty');
      return false;
    }
    if (isJsonMode) {
      try {
        JSON.parse(value);
      } catch {
        setError('Invalid JSON');
        return false;
      }
    }
    if (type === 'number' && Number.isNaN(Number(value))) {
      setError(`"${value}" is not a valid number`);
      return false;
    }
    if (type === 'binary') {
      try {
        atob(value);
      } catch {
        setError('Invalid base64 string');
        return false;
      }
    }
    setError(null);
    return true;
  }, [key, type, value, isJsonMode]);

  const handleSave = useCallback(() => {
    if (validate()) {
      let saveValue = value;
      if (isJsonMode) {
        try {
          saveValue = JSON.stringify(JSON.parse(value));
        } catch {
          // validate() should have caught this
        }
      }
      onSave(key, type, saveValue);
    }
  }, [key, type, value, validate, onSave, isJsonMode]);

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
            <Text style={[styles.title, { color: theme.text }]}>
              {isNewKey ? 'Add Key' : 'Edit Key'}
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Key</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              value={key}
              onChangeText={setKey}
              editable={isNewKey}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              placeholder="key.name"
              placeholderTextColor={theme.textMuted}
            />

            {!isJsonMode && (
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
                <View style={styles.typeRow}>
                  {VALUE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: type === t ? getBadgeColor(t, theme) : theme.background,
                          borderColor: type === t ? getBadgeColor(t, theme) : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setType(t);
                        if (t === 'boolean' && value !== 'true' && value !== 'false') {
                          setValue('false');
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color: type === t ? theme.badgeText : theme.text,
                          },
                        ]}
                      >
                        {TYPE_LABELS[t]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Value</Text>
            {type === 'boolean' ? (
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>
                  {value === 'true' ? 'true' : 'false'}
                </Text>
                <Switch
                  value={value === 'true'}
                  onValueChange={(v) => setValue(v ? 'true' : 'false')}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
            ) : (
              <TextInput
                style={[
                  styles.valueInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                  isJsonMode && styles.jsonValueInput,
                ]}
                value={value}
                onChangeText={(v) => {
                  setValue(v);
                  setError(null);
                }}
                multiline={isJsonMode || type === 'string' || type === 'binary'}
                numberOfLines={isJsonMode ? 12 : type === 'string' || type === 'binary' ? 4 : 1}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType={type === 'number' ? 'numeric' : 'default'}
                placeholder={
                  isJsonMode
                    ? '{\n  "key": "value"\n}'
                    : type === 'number'
                      ? '0'
                      : type === 'binary'
                        ? 'base64 encoded…'
                        : 'value'
                }
                placeholderTextColor={theme.textMuted}
              />
            )}

            {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
          </ScrollView>

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
    maxHeight: '80%',
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
  valueInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  jsonValueInput: {
    fontFamily: 'monospace',
    minHeight: 200,
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
