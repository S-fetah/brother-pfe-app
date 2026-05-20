import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Activity, Eye, EyeOff, ShieldAlert, X } from 'lucide-react-native';
import { login } from '../api/auth';
import { authApi } from '../services/api';
import { clearSession, saveToken, saveUserId, saveUserProfile } from '../utils/authStorage';
import { ActivityIndicator } from 'react-native';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [modalAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const autofillEmail = route.params?.autofillEmail;
    const autofillPassword = route.params?.autofillPassword;
    if (autofillEmail) setEmail(autofillEmail);
    if (autofillPassword) setPassword(autofillPassword);
  }, [route.params?.autofillEmail, route.params?.autofillPassword]);

  const showDoctorWarning = () => {
    setShowDoctorModal(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const hideDoctorWarning = async () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDoctorModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { isDoctor: true } }],
      });
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email.trim().toLowerCase(), password);
      const accessToken = response.accessToken || response.data?.accessToken;
      const userId = response.userId || response.data?.userId || response.data?.uid;
      const user = response.user || response.data?.user || response.data || {};

      if (!accessToken || !userId) {
        throw new Error('Login succeeded but the session payload was incomplete.');
      }

      await saveToken(accessToken);
      await saveUserId(userId);
      await saveUserProfile({ ...user, uid: user.uid || userId, email: email.trim().toLowerCase() });

      try {
        const profileRes = await authApi.getUser();
        const profileData = profileRes.data?.data || profileRes.data || {};
        const userType = profileData.userType || user.userType;

        if (userType === 'doctor') {
          showDoctorWarning();
          return;
        }
      } catch (err) {
        console.log('Profile fetch failed, falling back to login response userType');
        if (user.userType === 'doctor') {
          showDoctorWarning();
          return;
        }
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { user: { ...user, uid: user.uid || userId } } }],
      });
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Login failed';
      Alert.alert('Login failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Activity color="#1552C1" size={32} />
          </View>
          <Text style={styles.logoText}>MediCare</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your healthcare journey.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#94A3B8" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={'gray'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock color="#94A3B8" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={'gray'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 8 }}
              >
                {showPassword ? (
                  <Eye color="#94A3B8" size={20} />
                ) : (
                  <EyeOff color="#94A3B8" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Log In</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showDoctorModal}
        transparent
        animationType="fade"
        onRequestClose={hideDoctorWarning}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
                opacity: modalAnim,
              },
            ]}
          >
            <View style={styles.modalIconWrapper}>
              <ShieldAlert color="#DC2626" size={48} />
            </View>

            <Text style={styles.modalTitle}>Doctor Account Detected</Text>

            <Text style={styles.modalMessage}>
              This app is designed for patients only. Doctors must access their dashboard through the designated doctor application.
            </Text>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                Please use the Doctor Dashboard app to manage your appointments, patients, and schedule.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={hideDoctorWarning}
            >
              <Text style={styles.modalButtonText}>Understood</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#1552C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  linkText: {
    color: '#1552C1',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  modalIconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#FEF2F2',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  modalInfoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#1552C1',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
