/**
 * Artisan Passwordless OTP Verification Screen
 * Screen 2 of Auth Flow: Auto-reading 6-digit OTP input with Visual Numpad,
 * 30s countdown timer, resend, and real backend JWT storage with Lucide vector icons.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { VisualNumpad } from '../../components/auth/VisualNumpad';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';

const COUNTDOWN_SECONDS = 30;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const {
    confirmOtp,
    requestOtp,
    pendingIdentifier,
    isLoading,
    authError,
    clearError,
  } = useAuthStore();

  const [otpDigits, setOtpDigits] = useState<string[]>([]);
  const [timer, setTimer] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleKeyPress = (digit: string) => {
    clearError();
    if (otpDigits.length < 6) {
      const next = [...otpDigits, digit];
      setOtpDigits(next);
      if (next.length === 6) {
        void submitOtp(next.join(''));
      }
    }
  };

  const handleBackspace = () => {
    clearError();
    setOtpDigits((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    clearError();
    setOtpDigits([]);
  };

  const submitOtp = async (code: string) => {
    const success = await confirmOtp(code);
    if (success) {
      router.replace('/(tabs)/dashboard' as any);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingIdentifier || !canResend) return;
    setOtpDigits([]);
    setTimer(COUNTDOWN_SECONDS);
    setCanResend(false);
    await requestOtp(pendingIdentifier);
  };

  const handleChangeNumber = () => {
    router.replace('/(auth)/login' as any);
  };

  const audioInstruction = `${t('verify_otp_title')}. ${t('verify_otp_sub')}`;

  return (
    <View style={styles.container}>
      <Header showAudioHelp={true} audioPromptText={audioInstruction} />

      <ImageBackground
        source={require('../../assets/handicrafts-bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
        imageStyle={{ opacity: 0.12 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={28} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>{t('verify_otp_title')}</Text>
              <Text style={styles.cardSubtitle}>{t('verify_otp_sub')}</Text>
              {pendingIdentifier ? (
                <View style={styles.phoneBadge}>
                  <Smartphone size={13} color={Colors.primary} strokeWidth={2.4} />
                  <Text style={styles.phoneBadgeText}>
                    {pendingIdentifier}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 6-Digit Pin Boxes Display */}
            <View style={styles.otpBoxesRow}>
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otpDigits[index];
                const isCurrent = otpDigits.length === index;
                return (
                  <View
                    key={`otp-box-${index}`}
                    style={[
                      styles.otpBox,
                      digit !== undefined && styles.filledOtpBox,
                      isCurrent && styles.activeOtpBox,
                    ]}
                  >
                    <Text style={styles.otpDigitText}>
                      {digit !== undefined ? digit : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Error Display */}
            {authError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#991B1B" strokeWidth={2.2} />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Visual Numpad */}
            <VisualNumpad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onClear={handleClear}
              disabled={isLoading}
            />

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => submitOtp(otpDigits.join(''))}
              style={[
                styles.submitBtn,
                (otpDigits.length < 6 || isLoading) && styles.disabledSubmitBtn,
              ]}
              disabled={otpDigits.length < 6 || isLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('btn_verify')}
            >
              {isLoading ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>{t('verifying')}</Text>
                </View>
              ) : (
                <View style={styles.btnLoadingRow}>
                  <Text style={styles.submitBtnText}>{t('btn_verify')}</Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              )}
            </TouchableOpacity>

            {/* Resend & Change Number Footer */}
            <View style={styles.footerRow}>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  style={styles.resendBtnRow}
                  activeOpacity={0.75}
                >
                  <RotateCcw size={14} color={Colors.primary} strokeWidth={2.4} />
                  <Text style={styles.resendLink}>{t('resend_otp')}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  {t('resend_in')} {timer}s
                </Text>
              )}

              <Text style={styles.footerDot}>•</Text>

              <TouchableOpacity onPress={handleChangeNumber} activeOpacity={0.75}>
                <Text style={styles.changeNumLink}>{t('change_number')}</Text>
              </TouchableOpacity>
            </View>

            {/* Audio Guidance Button */}
            <View style={styles.audioPromptRow}>
              <AudioPromptButton
                textToSpeak={audioInstruction}
                size={40}
                label={t('audio_listen')}
                variant="card"
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgImage: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  phoneBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledOtpBox: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
  },
  activeOtpBox: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FDF2F2',
  },
  otpDigitText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledSubmitBtn: {
    opacity: 0.5,
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  resendBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendLink: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  footerDot: {
    color: '#D1D5DB',
  },
  changeNumLink: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  audioPromptRow: {
    alignItems: 'center',
    marginTop: 14,
  },
});
