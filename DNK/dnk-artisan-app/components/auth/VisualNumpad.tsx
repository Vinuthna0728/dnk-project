/**
 * VisualNumpad Component
 * Tactile, low-literacy oversized numpad with Lucide Delete icon
 * and haptic feedback on web and mobile.
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { Delete, RotateCcw } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface VisualNumpadProps {
  onKeyPress: (digit: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', 'DEL'],
];

export const VisualNumpad: React.FC<VisualNumpadProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  disabled = false,
}) => {
  const triggerHaptic = () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } else {
      Vibration.vibrate(15);
    }
  };

  const handlePress = (key: string) => {
    if (disabled) return;
    triggerHaptic();

    if (key === 'DEL') {
      onBackspace();
    } else if (key === 'C') {
      if (onClear) onClear();
      else onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => {
            const isDel = key === 'DEL';
            const isClear = key === 'C';
            const isAction = isDel || isClear;

            return (
              <TouchableOpacity
                key={`key-${key}`}
                onPress={() => handlePress(key)}
                disabled={disabled}
                style={[
                  styles.keyButton,
                  isAction && styles.actionKeyButton,
                  disabled && styles.disabledKey,
                ]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  isDel ? 'Backspace' : isClear ? 'Clear all' : `Number ${key}`
                }
              >
                {isDel ? (
                  <Delete size={22} color={Colors.primary} strokeWidth={2.4} />
                ) : isClear ? (
                  <RotateCcw size={20} color={Colors.primary} strokeWidth={2.4} />
                ) : (
                  <Text style={styles.keyText}>
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    gap: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  keyButton: {
    flex: 1,
    height: 56, // 56px preferred mobile touch target
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionKeyButton: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FECACA',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  actionKeyText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  disabledKey: {
    opacity: 0.5,
  },
});

export default VisualNumpad;
