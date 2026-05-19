import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Activity, Upload, ChevronDown, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { authApi } from '../services/api';
import { ActivityIndicator, Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [errors, setErrors] = useState({});

  const SPECIALTIES = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Psychiatry',
    'Orthopedics',
    'Ophthalmology',
    'Otolaryngology',
    'Gastroenterology',
    'Pulmonology',
    'Nephrology',
    'Rheumatology',
    'Oncology',
    'Radiology',
    'Pathology',
    'Anesthesiology',
    'General Surgery',
    'Urology',
    'Gynecology',
    'Family Medicine',
  ];

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const validatePassword = (value) => value.length >= 6;

  const getFileTypeFromUri = (uri) => {
    const extension = uri.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'application/pdf';
    if (extension === 'png') return 'image/png';
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
    return '';
  };

  const isValidCertificateType = (uri) => {
    const type = getFileTypeFromUri(uri);
    return ['application/pdf', 'image/png', 'image/jpeg'].includes(type);
  };

  const canSubmit = () => {
    if (!fullName.trim() || !validateEmail(email) || !validatePassword(password)) {
      return false;
    }
    if (role === 'doctor') {
      return specialty.trim().length > 0 && certificate && isValidCertificateType(certificate.uri);
    }
    return true;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      if (!isValidCertificateType(picked.uri)) {
        return alert('Please upload a valid certificate file: JPG, PNG, or PDF');
      }
      setCertificate(picked);
      setShowCertificatePreview(true);
    }
  };

  const uploadDoctorCertificate = async () => {
    const uploadData = new FormData();
    const fileType = getFileTypeFromUri(certificate.uri);
    const fileName = certificate.uri.split('/').pop() || 'certificate.pdf';

    uploadData.append('file', {
      uri: certificate.uri,
      name: fileName,
      type: fileType,
    });

    const uploadResponse = await authApi.uploadDoctorCertificate(uploadData);
    return (
      uploadResponse.data?.url ||
      uploadResponse.data?.certificateUrl ||
      uploadResponse.data?.fileUrl ||
      uploadResponse.data?.data?.url ||
      uploadResponse.data?.data?.certificateUrl ||
      uploadResponse.data?.data?.fileUrl ||
      ''
    );
  };

  const handleRegister = async () => {
    const validationErrors = {};

    if (!fullName.trim()) validationErrors.fullName = 'Full name is required.';
    if (!email.trim()) validationErrors.email = 'Email is required.';
    else if (!validateEmail(email)) validationErrors.email = 'Enter a valid email address.';
    if (!password) validationErrors.password = 'Password is required.';
    else if (!validatePassword(password)) validationErrors.password = 'Password must be at least 6 characters.';
    if (role === 'doctor') {
      if (!specialty.trim()) validationErrors.specialty = 'Specialty is required for doctors.';
      if (!certificate) validationErrors.certificate = 'Certificate upload is required for doctors.';
      else if (!isValidCertificateType(certificate.uri)) validationErrors.certificate = 'Certificate must be JPG, PNG, or PDF.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let certificateUrl = '';
      if (role === 'doctor') {
        certificateUrl = await uploadDoctorCertificate();
        if (!certificateUrl) {
          throw new Error('Failed to upload certificate. Please try again.');
        }
      }

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('userType', role);

      if (role === 'doctor') {
        formData.append('speciality', specialty.trim());
        formData.append('certificateUrl', certificateUrl);
      }

      const response = await authApi.register(formData);
      navigation.navigate('Main', { user: response.data.user });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Activity color="#1552C1" size={32} />
            </View>
            <Text style={styles.logoText}>MediCare</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your digital healthcare journey today.</Text>

            {/* Role Switcher */}
            <View style={styles.roleSwitcher}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
                onPress={() => setRole('patient')}
              >
                <Text style={[styles.roleButtonText, role === 'patient' && styles.roleButtonTextActive]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'doctor' && styles.roleButtonActive]}
                onPress={() => setRole('doctor')}
              >
                <Text style={[styles.roleButtonText, role === 'doctor' && styles.roleButtonTextActive]}>Doctor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User color="#94A3B8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={'gray'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

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
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <>
                <View style={styles.divider} />
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: '#64748B' }]}>Specialty & Verification (Doctor Only)</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowSpecialtyPicker(true)}
                  >
                    <Activity color="#94A3B8" size={20} style={styles.icon} />
                    <Text
                      style={[
                        styles.input,
                        { color: specialty ? '#1E293B' : '#9CA3AF' }
                      ]}
                    >
                      {specialty || 'Select Specialty'}
                    </Text>
                    <ChevronDown color="#94A3B8" size={20} />
                  </TouchableOpacity>
                  {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
                </View>

                <Modal
                  visible={showSpecialtyPicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowSpecialtyPicker(false)}
                >
                  <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                    <View style={{
                      backgroundColor: 'white',
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingTop: 16,
                      maxHeight: '80%',
                    }}>
                      <View style={{ paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>Select Specialty</Text>
                      </View>
                      <ScrollView style={{ paddingHorizontal: 24 }}>
                        {SPECIALTIES.map((spec) => (
                          <TouchableOpacity
                            key={spec}
                            onPress={() => {
                              setSpecialty(spec);
                              setShowSpecialtyPicker(false);
                            }}
                            style={{
                              paddingVertical: 16,
                              borderBottomWidth: 1,
                              borderBottomColor: '#F1F5F9',
                            }}
                          >
                            <Text style={{
                              fontSize: 16,
                              color: specialty === spec ? '#1552C1' : '#1E293B',
                              fontWeight: specialty === spec ? '600' : '400',
                            }}>
                              {spec}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                        <TouchableOpacity
                          onPress={() => setShowSpecialtyPicker(false)}
                          style={{
                            backgroundColor: '#F1F5F9',
                            paddingVertical: 12,
                            borderRadius: 12,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#1E293B', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                <TouchableOpacity style={styles.uploadCard} onPress={pickImage} activeOpacity={0.75}>
                  {certificate ? (
                    <>
                      <RNImage source={{ uri: certificate.uri }} style={{ width: '100%', height: 140, borderRadius: 12 }} />
                      <Text style={[styles.uploadTitle, { marginTop: 12 }]}>Tap to replace certificate</Text>
                    </>
                  ) : (
                    <>
                      <Upload color="#94A3B8" size={24} />
                      <Text style={styles.uploadTitle}>Upload Medical License / Certificate</Text>
                      <Text style={styles.uploadDesc}>PNG or JPG (Max 5MB)</Text>
                    </>
                  )}
                </TouchableOpacity>
                {errors.certificate && <Text style={styles.errorText}>{errors.certificate}</Text>}

                <Modal
                  visible={showCertificatePreview}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowCertificatePreview(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Certificate Preview</Text>
                      <RNImage source={{ uri: certificate?.uri }} style={styles.modalImage} />
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setShowCertificatePreview(false)}
                      >
                        <Text style={styles.modalButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            <TouchableOpacity style={[styles.button, (!canSubmit() || loading) && styles.buttonDisabled]} onPress={handleRegister} disabled={!canSubmit() || loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 20,
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
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  roleButtonTextActive: {
    color: '#1552C1',
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadCard: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    marginBottom: 32,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    textAlign: 'center',
  },
  uploadDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#1552C1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
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
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  errorText: {
    color: '#DC2626',
    marginTop: 8,
    fontSize: 12,
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
});
