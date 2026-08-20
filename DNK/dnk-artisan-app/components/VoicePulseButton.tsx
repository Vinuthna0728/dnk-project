import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface VoicePulseButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  size?: number;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
  recordingDuration?: string;
  style?: StyleProp<ViewStyle>;
}

export const VoicePulseButton: React.FC<VoicePulseButtonProps> = ({
  isRecording,
  onToggleRecording,
  size = 80,
  label,
  subLabel,
  disabled = false,
  recordingDuration,
  style,
}) => {
  // Animation values for concentric pulsing rings
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.6)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.4)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      // Start pulsing animations
      const createPulse = (animScale: Animated.Value, animOpacity: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(animScale, {
                toValue: 1.8,
                duration: 1600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animOpacity, {
                toValue: 0,
                duration: 1600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(animScale, {
                toValue: 1,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(animOpacity, {
                toValue: 0.6,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
      };

      const ring1 = createPulse(pulseAnim1, pulseOpacity1, 0);
      const ring2 = createPulse(pulseAnim2, pulseOpacity2, 700);

      const breathingMic = Animated.loop(
        Animated.sequence([
          Animated.timing(micScaleAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(micScaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      animationLoop = Animated.parallel([ring1, ring2, breathingMic]);
      animationLoop.start();
    } else {
      // Reset animation states
      pulseAnim1.setValue(1);
      pulseOpacity1.setValue(0);
      pulseAnim2.setValue(1);
      pulseOpacity2.setValue(0);
      micScaleAnim.setValue(1);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isRecording, pulseAnim1, pulseOpacity1, pulseAnim2, pulseOpacity2, micScaleAnim]);

  const buttonSize = size;
  const outerRingSize = size * 1.6;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          { width: outerRingSize, height: outerRingSize },
        ]}
      >
        {/* Outer Animated Pulse Wave 1 */}
        {isRecording && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                transform: [{ scale: pulseAnim1 }],
                opacity: pulseOpacity1,
              },
            ]}
          />
        )}

        {/* Outer Animated Pulse Wave 2 */}
        {isRecording && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                transform: [{ scale: pulseAnim2 }],
                opacity: pulseOpacity2,
              },
            ]}
          />
        )}

        {/* Center Mic Trigger Button */}
        <Animated.View style={{ transform: [{ scale: micScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: isRecording ? '#D32F2F' : '#8B0000',
              },
              disabled && styles.disabledButton,
            ]}
            onPress={onToggleRecording}
            activeOpacity={0.82}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? 'Stop voice recording' : 'Start voice recording'}
          >
            <View style={styles.iconInner}>
              <Text style={[styles.micIcon, { fontSize: size * 0.38 }]}>
                {isRecording ? '⏹' : '🎙️'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Recording Duration / Status */}
      {isRecording && (
        <View style={styles.recordingBadge}>
          <View style={styles.redDot} />
          <Text style={styles.recordingText}>
            {recordingDuration || 'Recording Voice...'}
          </Text>
        </View>
      )}

      {/* Label and SubLabel */}
      {(label || subLabel) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.labelText}>{label}</Text>}
          {subLabel && <Text style={styles.subLabelText}>{subLabel}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#FF5252',
  },
  mainButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFD54F', // India Post gold border accent
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    textAlign: 'center',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
    marginRight: 6,
  },
  recordingText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '700',
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subLabelText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default VoicePulseButton;
