/**
 * AudioPromptButton Component
 * Low-literacy speech narration button with pulsing feedback ring,
 * powered by lucide-react-native Volume2 icon.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

interface AudioPromptButtonProps {
  textToSpeak?: string;
  size?: number;
  label?: string;
  variant?: 'minimal' | 'card' | 'badge';
  disabled?: boolean;
}

export const AudioPromptButton: React.FC<AudioPromptButtonProps> = ({
  textToSpeak,
  size = 44,
  label,
  variant = 'minimal',
  disabled = false,
}) => {
  const { speakText, stopSpeaking, isSpeaking } = useLanguageStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isSpeaking) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isSpeaking, pulseAnim]);

  const handlePress = async () => {
    if (disabled || !textToSpeak) return;
    if (isSpeaking) {
      await stopSpeaking();
    } else {
      await speakText(textToSpeak);
    }
  };

  const iconSize = Math.max(18, Math.round(size * 0.45));

  if (variant === 'card') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.cardContainer,
          isSpeaking && styles.cardContainerSpeaking,
          disabled && styles.disabled,
        ]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label || 'Listen to instructions'}
      >
        <View style={styles.iconCircleWrapper}>
          <Animated.View
            style={[
              styles.pulsingRing,
              isSpeaking && {
                transform: [{ scale: pulseAnim }],
                opacity: 0.4,
              },
            ]}
          />
          <View
            style={[
              styles.iconCircle,
              { width: size, height: size, borderRadius: size / 2 },
              isSpeaking && styles.iconCircleSpeaking,
            ]}
          >
            <Volume2
              size={iconSize}
              color={isSpeaking ? '#FFFFFF' : Colors.primary}
              strokeWidth={2.2}
            />
          </View>
        </View>
        {label ? (
          <Text
            style={[
              styles.cardLabel,
              isSpeaking && styles.cardLabelSpeaking,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.minimalContainer,
        { minWidth: Math.max(size, 48), minHeight: Math.max(size, 48) },
        disabled && styles.disabled,
      ]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label || 'Audio Help'}
    >
      <View style={styles.iconCircleWrapper}>
        {isSpeaking ? (
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                width: size + 8,
                height: size + 8,
                borderRadius: (size + 8) / 2,
                transform: [{ scale: pulseAnim }],
                opacity: 0.35,
              },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.minimalCircle,
            { width: size, height: size, borderRadius: size / 2 },
            isSpeaking && styles.minimalCircleSpeaking,
          ]}
        >
          <Volume2
            size={iconSize}
            color={isSpeaking ? '#FFFFFF' : Colors.primary}
            strokeWidth={2.2}
          />
        </View>
      </View>
      {label ? (
        <Text
          style={[
            styles.minimalLabel,
            isSpeaking && styles.cardLabelSpeaking,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 2,
  },
  iconCircleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalCircle: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalCircleSpeaking: {
    backgroundColor: Colors.primary,
    borderColor: '#FFD54F',
  },
  pulsingRing: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  minimalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 48,
  },
  cardContainerSpeaking: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  iconCircle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSpeaking: {
    backgroundColor: Colors.primary,
    borderColor: '#FFD54F',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardLabelSpeaking: {
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AudioPromptButton;
