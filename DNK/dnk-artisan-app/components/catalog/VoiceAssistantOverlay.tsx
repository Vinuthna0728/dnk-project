/**
 * VoiceAssistantOverlay Component
 * Zero-Touch Tap/Hold-to-Talk Voice Recorder using expo-av,
 * animated sound waveforms, timer, and direct upload to AI Bhashini/Whisper pipeline
 * with Lucide vector icons.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  AlertCircle,
  Clock,
  Mic,
  RotateCcw,
  Square,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import {
  VoiceCatalogExtractionResponse,
  uploadVoiceCatalog,
} from '../../services/catalogService';
import { useLanguageStore } from '../../store/useLanguageStore';

interface VoiceAssistantOverlayProps {
  onExtractionSuccess: (data: VoiceCatalogExtractionResponse, audioUri: string) => void;
}

export const VoiceAssistantOverlay: React.FC<VoiceAssistantOverlayProps> = ({
  onExtractionSuccess,
}) => {
  const { t, currentLang } = useLanguageStore();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const webMediaRecorderRef = useRef<any>(null);
  const webAudioChunksRef = useRef<Blob[]>([]);
  const webStreamRef = useRef<any>(null);

  // Animations for waveform
  const wave1 = useRef(new Animated.Value(8)).current;
  const wave2 = useRef(new Animated.Value(14)).current;
  const wave3 = useRef(new Animated.Value(10)).current;
  const wave4 = useRef(new Animated.Value(16)).current;

  // Recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecordingActive) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecordingActive]);

  // Waveform loop
  useEffect(() => {
    if (isRecordingActive) {
      const createWave = (val: Animated.Value, maxH: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: maxH,
              duration: 250 + Math.random() * 150,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(val, {
              toValue: 6,
              duration: 250 + Math.random() * 150,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ])
        );

      const a1 = createWave(wave1, 32);
      const a2 = createWave(wave2, 44);
      const a3 = createWave(wave3, 28);
      const a4 = createWave(wave4, 38);

      Animated.parallel([a1, a2, a3, a4]).start();
    } else {
      wave1.setValue(8);
      wave2.setValue(14);
      wave3.setValue(10);
      wave4.setValue(16);
    }
  }, [isRecordingActive]);

  const startRecording = async () => {
    if (isRecordingActive || isProcessing) return;
    setErrorMessage(null);

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorMessage(t('error_mic_permission'));
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        webStreamRef.current = stream;
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        webAudioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            webAudioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (webAudioChunksRef.current.length > 0) {
            const audioBlob = new Blob(webAudioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setRecordedUri(audioUrl);
            await processAudioBlobWithBackend(audioBlob, audioUrl);
          } else {
            setErrorMessage(t('error_no_audio'));
          }
          if (webStreamRef.current) {
            webStreamRef.current.getTracks().forEach((track: any) => track.stop());
            webStreamRef.current = null;
          }
        };

        mediaRecorder.start();
        webMediaRecorderRef.current = mediaRecorder;
        setIsRecordingActive(true);
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          setErrorMessage(t('error_mic_permission'));
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRecording);
        setIsRecordingActive(true);
      }
    } catch (err: any) {
      console.warn('[VoiceAssistant] Start recording error:', err);
      setErrorMessage(t('error_mic_permission'));
      setIsRecordingActive(false);
    }
  };

  const stopRecordingAndProcess = async () => {
    if (!isRecordingActive) return;
    setIsRecordingActive(false);

    if (Platform.OS === 'web') {
      if (webMediaRecorderRef.current && webMediaRecorderRef.current.state !== 'inactive') {
        try {
          webMediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('[VoiceAssistant] Web stop error:', e);
        }
      }
      return;
    }

    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        setErrorMessage(t('error_no_audio'));
        return;
      }

      setRecordedUri(uri);
      await processAudioUriWithBackend(uri);
    } catch (err: any) {
      console.warn('[VoiceAssistant] Stop recording error:', err);
      setErrorMessage(t('error_voice_pipeline'));
    }
  };

  const processAudioBlobWithBackend = async (blob: Blob, audioUrl: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', blob, 'voice_catalog.webm');
      formData.append('language', currentLang);

      const extraction = await uploadVoiceCatalog(formData);

      if (!extraction || Object.keys(extraction).length === 0) {
        throw new Error(t('error_voice_pipeline'));
      }

      onExtractionSuccess(extraction, audioUrl);
    } catch (err: any) {
      setErrorMessage(t('error_voice_pipeline'));
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudioUriWithBackend = async (uri: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'voice_catalog.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('language', currentLang);

      const extraction = await uploadVoiceCatalog(formData);

      if (!extraction || Object.keys(extraction).length === 0) {
        throw new Error(t('error_voice_pipeline'));
      }

      onExtractionSuccess(extraction, uri);
    } catch (err: any) {
      setErrorMessage(t('error_voice_pipeline'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePress = () => {
    if (isRecordingActive) {
      void stopRecordingAndProcess();
    } else {
      void startRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Visual Instruction Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Mic size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.title}>{t('voice_title')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('voice_sub')}</Text>
      </View>

      {/* Waveform Visualizer Display */}
      {isRecordingActive ? (
        <View style={styles.waveRow}>
          <Animated.View style={[styles.waveBar, { height: wave1 }]} />
          <Animated.View style={[styles.waveBar, { height: wave2 }]} />
          <Animated.View style={[styles.waveBar, { height: wave3 }]} />
          <Animated.View style={[styles.waveBar, { height: wave4 }]} />
          <Animated.View style={[styles.waveBar, { height: wave2 }]} />
          <Animated.View style={[styles.waveBar, { height: wave1 }]} />
          <View style={styles.timerBadge}>
            <Clock size={12} color="#DC2626" strokeWidth={2.4} />
            <Text style={styles.timerBadgeText}>
              00:{String(recordSeconds).padStart(2, '0')}
            </Text>
          </View>
        </View>
      ) : isProcessing ? (
        <View style={styles.processingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>{t('voice_processing')}</Text>
        </View>
      ) : (
        <View style={styles.idleWaveGuide}>
          <Text style={styles.idleWaveText}>
            {t('voice_example_prompt')}
          </Text>
        </View>
      )}

      {/* Large Microphone Push-to-Talk Button (96px) */}
      <View style={styles.micButtonWrapper}>
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecordingAndProcess}
          onPress={handleTogglePress}
          style={[
            styles.largeMicButton,
            isRecordingActive && styles.recordingMicButton,
            isProcessing && styles.disabledMicButton,
          ]}
          disabled={isProcessing}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('hold_to_talk')}
        >
          {isRecordingActive ? (
            <Square size={38} color="#FFFFFF" strokeWidth={2.6} />
          ) : isProcessing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Mic size={42} color="#FFFFFF" strokeWidth={2.4} />
          )}
        </TouchableOpacity>

        <Text style={[styles.micLabel, isRecordingActive && styles.recordingMicLabel]}>
          {isRecordingActive
            ? t('recording_active')
            : isProcessing
            ? t('voice_processing')
            : t('hold_to_talk')}
        </Text>
      </View>

      {/* Error / Retry Display */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#991B1B" strokeWidth={2.2} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setErrorMessage(null)}
            style={styles.retryBtn}
          >
            <RotateCcw size={13} color="#DC2626" strokeWidth={2.4} />
            <Text style={styles.retryBtnText}>{t('voice_retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginVertical: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 420,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 60,
    marginBottom: 12,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#DC2626',
    borderRadius: 3,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timerBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  processingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 8,
    marginBottom: 12,
  },
  processingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  idleWaveGuide: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  idleWaveText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
    textAlign: 'center',
  },
  micButtonWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  largeMicButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  recordingMicButton: {
    backgroundColor: '#DC2626',
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.08 }],
  },
  disabledMicButton: {
    opacity: 0.6,
  },
  micLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  recordingMicLabel: {
    color: '#DC2626',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  retryBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default VoiceAssistantOverlay;
