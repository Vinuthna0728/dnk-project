/**
 * Artisan Passwordless Login Screen
 * Screen 1 of Auth Flow: Phone/Email input with visual numpad,
 * language toggle, audio assistance, and real backend OTP request with Lucide icons.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Smartphone,
} from 'lucide-react-native';
import { VisualNumpad } from '../../components/auth/VisualNumpad';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { requestOtp, isLoading, authError, clearError } = useAuthStore();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleNumKeyPress = (digit: string) => {
    clearError();
    if (authMode === 'phone' && phoneNumber.length < 10) {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleNumBackspace = () => {
    clearError();
    if (authMode === 'phone') {
      setPhoneNumber((prev) => prev.slice(0, -1));
    }
  };

  const handleNumClear = () => {
    clearError();
    if (authMode === 'phone') {
      setPhoneNumber('');
    }
  };

  const handleSendOtp = async () => {
    const identifier = authMode === 'phone' ? phoneNumber.trim() : email.trim();
    if (!identifier) return;

    const success = await requestOtp(identifier);
    if (success) {
      router.push('/(auth)/verify-otp' as any);
    }
  };

  const isFormValid =
    authMode === 'phone'
      ? phoneNumber.trim().length === 10
      : email.trim().includes('@') && email.trim().includes('.');

  const audioInstruction = `${t('login_title')}. ${t('login_sub')}`;

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
                <Lock size={26} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle}>{t('login_title')}</Text>
              <Text style={styles.cardSubtitle}>{t('login_sub')}</Text>
            </View>

            {/* Mode Switcher Tabs (Phone / Email) */}
            <View style={styles.modeTabsRow}>
              <TouchableOpacity
                onPress={() => {
                  clearError();
                  setAuthMode('phone');
                }}
                style={[
                  styles.modeTab,
                  authMode === 'phone' && styles.activeModeTab,
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Phone Number Mode"
              >
                <Smartphone
                  size={16}
                  color={authMode === 'phone' ? Colors.primary : '#6B7280'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    authMode === 'phone' && styles.activeModeTabText,
                  ]}
                >
                  {t('login_phone_tab')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  clearError();
                  setAuthMode('email');
                }}
                style={[
                  styles.modeTab,
                  authMode === 'email' && styles.activeModeTab,
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Email Address Mode"
              >
                <Mail
                  size={16}
                  color={authMode === 'email' ? Colors.primary : '#6B7280'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    authMode === 'email' && styles.activeModeTabText,
                  ]}
                >
                  {t('login_email_tab')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Display Area */}
            {authMode === 'phone' ? (
              <View style={styles.inputWrapper}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>+91 (IN)</Text>
                </View>
                <View style={styles.phoneDisplayBox}>
                  <Text
                    style={[
                      styles.phoneDisplayText,
                      !phoneNumber && styles.phonePlaceholderText,
                    ]}
                  >
                    {phoneNumber ? phoneNumber : t('enter_phone')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emailInputWrapper}>
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    clearError();
                    setEmail(val);
                  }}
                  placeholder="artisan@domain.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.emailTextInput}
                />
              </View>
            )}

            {/* Error Display */}
            {authError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#991B1B" strokeWidth={2.2} />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Visual Numpad for Mobile Mode */}
            {authMode === 'phone' ? (
              <VisualNumpad
                onKeyPress={handleNumKeyPress}
                onBackspace={handleNumBackspace}
                onClear={handleNumClear}
                disabled={isLoading}
              />
            ) : null}

            {/* Primary Action Button */}
            <TouchableOpacity
              onPress={handleSendOtp}
              style={[
                styles.submitBtn,
                (!isFormValid || isLoading) && styles.disabledSubmitBtn,
              ]}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('btn_get_otp')}
            >
              {isLoading ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>{t('sending_otp')}</Text>
                </View>
              ) : (
                <View style={styles.btnLoadingRow}>
                  <Text style={styles.submitBtnText}>{t('btn_get_otp')}</Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              )}
            </TouchableOpacity>

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
    marginBottom: 20,
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
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    marginBottom: 16,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  activeModeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeModeTabText: {
    color: Colors.primary,
    fontWeight: '900',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  countryCodeBadge: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  phoneDisplayBox: {
    flex: 1,
    height: 54,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  phoneDisplayText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  phonePlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0,
  },
  emailInputWrapper: {
    marginBottom: 14,
  },
  emailTextInput: {
    height: 54,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 12,
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
  audioPromptRow: {
    alignItems: 'center',
    marginTop: 16,
  },
});
