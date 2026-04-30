import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from '../types';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  theme: ThemeColors;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  theme,
  placeholder = 'Search keys…',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalValue(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChangeText(text), 200);
    },
    [onChangeText],
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
  }, [onChangeText]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.clearButton, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 8,
  },
});
