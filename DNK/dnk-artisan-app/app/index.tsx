import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguageStore } from '../store/useLanguageStore';
import { useRouter } from 'expo-router';
import { loginArtisan, registerArtisan, fetchCurrentUser, getAuthToken } from '../services/api';

export default function AuthScreen() {
  const { t, setProfileFromUser } = useLanguageStore();
  const router = useRouter();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [craftType, setCraftType] = useState('Brass Artwork & Figurines');
  const [dnkCentre, setDnkCentre] = useState('Jaipur GPO - 302001');
  const [mobileNumber, setMobileNumber] = useState('+91 9829012345');
  const [password, setPassword] = useState('12345678');

  // Helper to format email for backend OAuth2 form login
  const getEmailFromInput = (input: string) => {
    if (input.includes('@')) return input.trim();
    const cleanDigits = input.replace(/\D/g, '');
    return cleanDigits ? `artisan${cleanDigits}@dnk.gov.in` : 'seller@example.com';
  };

  useEffect(() => {
    getAuthToken().then((token) => {
      if (token) {
        fetchCurrentUser()
          .then((user) => {
            if (user) setProfileFromUser(user);
            router.replace('/(tabs)');
          })
          .catch(() => {
            router.replace('/(tabs)');
          });
      }
    });
  }, []);

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const email = getEmailFromInput(mobileNumber);
      await loginArtisan(email, password);
      try {
        const user = await fetchCurrentUser();
        if (user) setProfileFromUser(user);
      } catch (_) {}
      setIsLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Login failed. Please check credentials.';
      setErrorMessage(msg);
      if (Platform.OS === 'web') {
        window.alert(`Authentication Error: ${msg}`);
      } else {
        Alert.alert('Authentication Error', msg);
      }
    }
  };

  // Direct Registration Handler compatible with Web & Mobile
  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const email = getEmailFromInput(mobileNumber);
      await registerArtisan({
        name: fullName || 'Artisan Exporter',
        email,
        password,
        phone: mobileNumber,
      });
      // Auto-login after registration
      await loginArtisan(email, password);
      try {
        const user = await fetchCurrentUser();
        if (user) setProfileFromUser(user);
      } catch (_) {}
      setIsLoading(false);

      const successMessage = `${t('reg_success')}\n\nAssigned ID: DNK-RJ-2026-9842\nLinked Centre: ${dnkCentre}`;
      if (Platform.OS === 'web') {
        window.alert(successMessage);
        router.replace('/(tabs)');
      } else {
        Alert.alert('DNK Registration', successMessage, [
          { text: 'Proceed to Dashboard', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Registration failed.';
      setErrorMessage(msg);
      if (Platform.OS === 'web') {
        window.alert(`Registration Error: ${msg}`);
      } else {
        Alert.alert('Registration Error', msg);
      }
    }
  };


  const handleForgotPassword = () => {
    if (Platform.OS === 'web') {
      window.alert('OTP has been sent to your registered mobile number.');
    } else {
      Alert.alert('Reset Password', 'An OTP has been sent to your registered mobile number.');
    }
  };

  return (
    <View style={styles.mainWrapper}>
      {/* 1. TOP RED BANNER */}
      <View style={styles.headerBanner}>
        <Text style={styles.subHeader}>IN INDIA POST | MINISTRY OF COMMUNICATIONS</Text>
        <Text style={styles.mainTitle}>डाक घर निर्यात केंद्र</Text>
        <Text style={styles.headerTagline}>Dak Ghar Niryat Kendra (DNK)</Text>
      </View>

      {/* 2. SELECT LANGUAGE BAR */}
      <LanguageSelector />

      {/* 3. FULL PAGE COVER BACKGROUND */}
      <View style={styles.bodyContainer}>
        <ImageBackground
          source={require('../assets/handicrafts-bg.jpg')}
          style={styles.fullScreenBackground}
          resizeMode="cover"
          imageStyle={{ opacity: 0.45 }}
        >
          <ScrollView contentContainerStyle={styles.centeredContainer}>

            {/* 4. DYNAMIC ARTISAN AUTH CARD */}
            <View style={styles.card}>

              {/* CARD HEADER */}
              <View style={styles.cardHeader}>
                <Text style={styles.headerTitle}>
                  {authMode === 'login' ? t('login_title') : t('register_title')}
                </Text>
                <Text style={styles.headerSub}>
                  {authMode === 'login' ? t('login_sub') : t('register_sub')}
                </Text>
              </View>

              {/* FORM FIELDS */}
              <View style={styles.formBody}>

                {/* REGISTRATION EXTRA FIELDS */}
                {authMode === 'register' && (
                  <>
                    <Text style={styles.inputLabel}>{t('full_name')}</Text>
                    <TextInput
                      placeholder="e.g. Ramesh Kumar Sharma"
                      value={fullName}
                      onChangeText={setFullName}
                      style={styles.inputField}
                    />

                    <Text style={styles.inputLabel}>{t('craft_type')}</Text>
                    <TextInput
                      value={craftType}
                      onChangeText={setCraftType}
                      style={styles.inputField}
                    />

                    <Text style={styles.inputLabel}>{t('dnk_centre')}</Text>
                    <TextInput
                      value={dnkCentre}
                      onChangeText={setDnkCentre}
                      style={styles.inputField}
                    />
                  </>
                )}

                {/* SHARED FIELDS */}
                <Text style={styles.inputLabel}>{t('mobile_num')}</Text>
                <TextInput
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  style={styles.inputField}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>{t('password')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                  onPress={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
                  style={[styles.loginBtn, isLoading && { opacity: 0.6 }]}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginBtnText}>
                    {isLoading
                      ? 'Authenticating...'
                      : authMode === 'login'
                      ? t('btn_login')
                      : t('btn_register')}
                  </Text>
                </TouchableOpacity>

                {/* SWITCH BETWEEN LOGIN & REGISTER */}
                <View style={styles.footerLinks}>
                  {authMode === 'login' ? (
                    <>
                      <TouchableOpacity onPress={() => setAuthMode('register')}>
                        <Text style={styles.registerText}>
                          {t('no_account')}{' '}
                          <Text style={styles.linkBold}>{t('register')}</Text>
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotText}>{t('forgot_password')}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity onPress={() => setAuthMode('login')}>
                      <Text style={styles.registerText}>
                        {t('have_account')}{' '}
                        <Text style={styles.linkBold}>{t('login_link')}</Text>
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>

            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBanner: {
    backgroundColor: '#8B2222',
    padding: 20,
    paddingTop: 30
  },
  subHeader: {
    color: '#FFC107',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  headerTagline: {
    color: '#FFD54F',
    fontSize: 14,
    fontWeight: '600'
  },
  bodyContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  fullScreenBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#8B2222',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#FFD54F',
    marginTop: 4,
    textAlign: 'center',
  },
  formBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 14
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeIcon: {
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#8B2222',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  },
  footerLinks: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  registerText: {
    fontSize: 12,
    color: '#4B5563',
  },
  linkBold: {
    color: '#8B2222',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  forgotText: {
    fontSize: 12,
    color: '#8B2222',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});