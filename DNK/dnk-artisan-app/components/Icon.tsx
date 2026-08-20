// components/Icon.tsx
import React from 'react';
import { Text, StyleSheet, View, TextStyle } from 'react-native';

export type IconName =
  | 'mail'
  | 'mail-outline'
  | 'globe'
  | 'globe-outline'
  | 'chevron-down'
  | 'chevron-forward'
  | 'close-circle'
  | 'checkmark-circle'
  | 'checkmark-done'
  | 'checkmark'
  | 'grid'
  | 'grid-outline'
  | 'cube'
  | 'cube-outline'
  | 'receipt'
  | 'receipt-outline'
  | 'person'
  | 'person-outline'
  | 'location'
  | 'time'
  | 'card'
  | 'card-outline'
  | 'sparkles'
  | 'mic'
  | 'add-circle'
  | 'add'
  | 'barcode'
  | 'barcode-outline'
  | 'search-outline'
  | 'trash-outline'
  | 'print-outline'
  | 'alarm-outline'
  | 'business'
  | 'save-outline'
  | 'log-out-outline'
  | 'lock-closed-outline'
  | 'call-outline'
  | 'eye-outline'
  | 'eye-off-outline'
  | 'flash'
  | 'cloud-upload'
  | 'stop'
  | 'shield-checkmark'
  | 'create-outline'
  | 'alert-circle';

const GLYPH_MAP: Record<string, string> = {
  'mail': '✉',
  'mail-outline': '✉',
  'globe': '🌐',
  'globe-outline': '🌐',
  'chevron-down': '▼',
  'chevron-forward': '›',
  'close-circle': '✕',
  'checkmark-circle': '✓',
  'checkmark-done': '✓✓',
  'checkmark': '✓',
  'grid': '▦',
  'grid-outline': '▤',
  'cube': '📦',
  'cube-outline': '📦',
  'receipt': '🧾',
  'receipt-outline': '📄',
  'person': '👤',
  'person-outline': '👤',
  'location': '📍',
  'time': '⏱',
  'card': '💳',
  'card-outline': '💳',
  'sparkles': '✨',
  'mic': '🎙',
  'add-circle': '⊕',
  'add': '+',
  'barcode': '▌│█║',
  'barcode-outline': '▌│█',
  'search-outline': '🔍',
  'trash-outline': '🗑',
  'print-outline': '🖨',
  'alarm-outline': '⏰',
  'business': '🏛',
  'save-outline': '💾',
  'log-out-outline': '🚪',
  'lock-closed-outline': '🔒',
  'call-outline': '📞',
  'eye-outline': '👁',
  'eye-off-outline': '🙈',
  'flash': '⚡',
  'cloud-upload': '☁',
  'stop': '⏹',
  'shield-checkmark': '🛡',
  'create-outline': '✎',
  'alert-circle': '⚠',
};

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function Ionicons({ name, size = 18, color = '#000', style }: IconProps) {
  const glyph = GLYPH_MAP[name] || '•';

  return (
    <Text
      style={[
        {
          fontSize: size,
          color,
          lineHeight: size + 4,
          textAlign: 'center',
          fontFamily: 'System',
        },
        style,
      ]}
      accessibilityRole="image"
    >
      {glyph}
    </Text>
  );
}

export default Ionicons;
