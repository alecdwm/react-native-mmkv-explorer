import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { InstanceDescriptor, ThemeColors } from '../types';

interface InstancePickerProps {
  instances: InstanceDescriptor[];
  activeIndex: number;
  onSelect: (index: number) => void;
  theme: ThemeColors;
}

export function InstancePicker({ instances, activeIndex, onSelect, theme }: InstancePickerProps) {
  if (instances.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { borderBottomColor: theme.border }]}
      contentContainerStyle={styles.content}
    >
      {instances.map((instance, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={instance.name}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? theme.primary : 'transparent',
                borderColor: isActive ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onSelect(index)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? '#fff' : theme.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {instance.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
  },
});
