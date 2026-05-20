import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Lock,
  Activity,
  Upload,
  ChevronDown,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { authApi } from "../services/api";
import { ActivityIndicator, Image as RNImage } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { saveToken, saveUserId, saveUserProfile } from "../utils/authStorage";

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState("");
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certUploadError, setCertUploadError] = useState("");
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [errors, setErrors] = useState({});

  const SPECIALTIES = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Orthopedics",
    "Ophthalmology",
    "Otolaryngology",
    "Gastroenterology",
    "Pulmonology",
    "Nephrology",
    "Rheumatology",
    "Oncology",
    "Radiology",
    "Pathology",
    "Anesthesiology",
    "General Surgery",
    "Urology",
    "Gynecology",
    "Family Medicine",
  ];

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const validatePassword = (value) => value.length >= 6;

  const getFileTypeFromUri = (uri) => {
    const extension = uri.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "application/pdf";
    if (extension === "png") return "image/png";
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    return "";
  };

  const isValidCertificateType = (uri) => {
    const type = getFileTypeFromUri(uri);
    return ["application/pdf", "image/png", "image/jpeg"].includes(type);
  };

  const canSubmit = () => {
    if (
      !fullName.trim() ||
      !validateEmail(email) ||
      !validatePassword(password)
    ) {
      return false;
    }
    if (role === "doctor") {
      return specialty.trim().length > 0 && certificateUrl.length > 0;
    }
    return true;
  };

  const pickAndUploadCertificate = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const picked = result.assets[0];
      if (!isValidCertificateType(picked.uri)) {
        return alert(
          "Please upload a valid certificate file: JPG, PNG, or PDF",
        );
      }

      setCertificate(picked);
      setCertUploadError("");
      setUploadingCert(true);

      const uploadData = new FormData();
      const fileType = getFileTypeFromUri(picked.uri);
      const fileName = picked.uri.split("/").pop() || "certificate.pdf";

      uploadData.append("file", {
        uri: picked.uri,
        name: fileName,
        type: fileType,
      });

      const uploadResponse =
        await authApi.uploadDoctorCertificate(uploadData);

      console.log("Certificate upload response:", JSON.stringify(uploadResponse, null, 2));

      const resData = uploadResponse.data;
      const url =
        resData?.data?.url ||
        resData?.data?.certificateUrl ||
        resData?.data?.fileUrl ||
        resData?.url ||
        resData?.certificateUrl ||
        resData?.fileUrl ||
        "";

      console.log("Extracted certificate URL:", url);

      if (!url) {
        throw new Error("No URL returned from server");
      }

      setCertificateUrl(url);
      setShowCertificatePreview(true);
    } catch (err) {
      setCertificate(null);
      setCertificateUrl("");
      setCertUploadError(err.data?.message || err.message || "Failed to upload certificate");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleRegister = async () => {
    const validationErrors = {};

    if (!fullName.trim()) validationErrors.fullName = "Full name is required.";
    if (!email.trim()) validationErrors.email = "Email is required.";
    else if (!validateEmail(email))
      validationErrors.email = "Enter a valid email address.";
    if (!password) validationErrors.password = "Password is required.";
    else if (!validatePassword(password))
      validationErrors.password = "Password must be at least 6 characters.";
    if (role === "doctor") {
      if (!specialty.trim())
        validationErrors.specialty = "Specialty is required for doctors.";
      if (!certificateUrl)
        validationErrors.certificate =
          "Certificate upload failed. Please try again.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const body = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        userType: role === "doctor" ? "doctor" : "user",
      };

      if (role === "doctor") {
        body.speciality = specialty.trim();
        body.certificateUrl = certificateUrl;
      }

      console.log("Signup body:", JSON.stringify(body, null, 2));

      const { API_BASE_URL } = require("../config/api");

      const signupRes = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const signupData = await signupRes.json();
      console.log("Signup response status:", signupRes.status);
      console.log("Signup response body:", JSON.stringify(signupData, null, 2));

      if (!signupRes.ok) {
        throw new Error(signupData.message || signupData.error || "Registration failed");
      }

      const response = { data: signupData };

      if (role === "patient") {
        const accessToken = response.data?.accessToken || response.data?.token;
        const userId = response.data?.userId || response.data?.uid;
        const user = response.data?.user || response.data || {};

        if (accessToken) {
          await saveToken(accessToken);
        }
        if (userId) {
          await saveUserId(userId);
        }
        await saveUserProfile({ ...user, fullName: fullName.trim(), email: email.trim().toLowerCase(), userType: "user" });

        navigation.navigate("Login", {
          autofillEmail: email.trim().toLowerCase(),
          autofillPassword: password,
        });
      } else {
        navigation.navigate("DoctorPending");
      }
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Activity color="#1552C1" size={32} />
            </View>
            <Text style={styles.logoText}>MediCare</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your digital healthcare journey today.
            </Text>

            <View style={styles.roleSwitcher}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "patient" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("patient")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "patient" && styles.roleButtonTextActive,
                  ]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "doctor" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("doctor")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "doctor" && styles.roleButtonTextActive,
                  ]}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User color="#94A3B8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={"gray"}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail color="#94A3B8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor={"gray"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#94A3B8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={"gray"}
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {role === "doctor" && (
              <>
                <View style={styles.divider} />
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: "#64748B" }]}>
                    Specialty & Verification (Doctor Only)
                  </Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowSpecialtyPicker(true)}
                  >
                    <Activity color="#94A3B8" size={20} style={styles.icon} />
                    <Text
                      style={[
                        styles.input,
                        { color: specialty ? "#1E293B" : "#9CA3AF" },
                      ]}
                    >
                      {specialty || "Select Specialty"}
                    </Text>
                    <ChevronDown color="#94A3B8" size={20} />
                  </TouchableOpacity>
                  {errors.specialty && (
                    <Text style={styles.errorText}>{errors.specialty}</Text>
                  )}
                </View>

                <Modal
                  visible={showSpecialtyPicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowSpecialtyPicker(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      justifyContent: "flex-end",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 16,
                        maxHeight: "80%",
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 24,
                          paddingBottom: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: "#E2E8F0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#1E293B",
                          }}
                        >
                          Select Specialty
                        </Text>
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
                              borderBottomColor: "#F1F5F9",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color:
                                  specialty === spec ? "#1552C1" : "#1E293B",
                                fontWeight: specialty === spec ? "600" : "400",
                              }}
                            >
                              {spec}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <View
                        style={{
                          paddingHorizontal: 24,
                          paddingVertical: 16,
                          borderTopWidth: 1,
                          borderTopColor: "#E2E8F0",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setShowSpecialtyPicker(false)}
                          style={{
                            backgroundColor: "#F1F5F9",
                            paddingVertical: 12,
                            borderRadius: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#1E293B",
                              fontWeight: "600",
                              fontSize: 16,
                            }}
                          >
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                <TouchableOpacity
                  style={[
                    styles.uploadCard,
                    uploadingCert && styles.uploadCardDisabled,
                  ]}
                  onPress={uploadingCert ? null : pickAndUploadCertificate}
                  activeOpacity={0.75}
                  disabled={uploadingCert}
                >
                  {uploadingCert ? (
                    <>
                      <ActivityIndicator size="large" color="#1552C1" />
                      <Text style={[styles.uploadTitle, { marginTop: 12 }]}>
                        Uploading certificate...
                      </Text>
                    </>
                  ) : certUploadError ? (
                    <>
                      <AlertCircle color="#DC2626" size={24} />
                      <Text
                        style={[
                          styles.uploadTitle,
                          { marginTop: 12, color: "#DC2626" },
                        ]}
                      >
                        Upload failed
                      </Text>
                      <Text style={styles.uploadDesc}>{certUploadError}</Text>
                      <Text
                        style={[
                          styles.uploadDesc,
                          { marginTop: 8, color: "#1552C1" },
                        ]}
                      >
                        Tap to retry
                      </Text>
                    </>
                  ) : certificateUrl ? (
                    <>
                      <CheckCircle color="#166534" size={24} />
                      <Text
                        style={[
                          styles.uploadTitle,
                          { marginTop: 12, color: "#166534" },
                        ]}
                      >
                        Certificate uploaded
                      </Text>
                      <Text
                        style={[
                          styles.uploadDesc,
                          { marginTop: 8, color: "#1552C1" },
                        ]}
                      >
                        Tap to replace
                      </Text>
                    </>
                  ) : certificate ? (
                    <>
                      <RNImage
                        source={{ uri: certificate.uri }}
                        style={{ width: "100%", height: 140, borderRadius: 12 }}
                      />
                      <Text style={[styles.uploadTitle, { marginTop: 12 }]}>
                        Tap to replace certificate
                      </Text>
                    </>
                  ) : (
                    <>
                      <Upload color="#94A3B8" size={24} />
                      <Text style={styles.uploadTitle}>
                        Upload Medical License / Certificate
                      </Text>
                      <Text style={styles.uploadDesc}>
                        PNG or JPG (Max 5MB)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {errors.certificate && (
                  <Text style={styles.errorText}>{errors.certificate}</Text>
                )}

                <Modal
                  visible={showCertificatePreview}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowCertificatePreview(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalSuccessHeader}>
                        <CheckCircle color="#166534" size={28} />
                        <Text style={styles.modalTitle}>
                          Certificate Uploaded
                        </Text>
                      </View>
                      <RNImage
                        source={{ uri: certificate?.uri }}
                        style={styles.modalImage}
                      />
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

            <TouchableOpacity
              style={[
                styles.button,
                (!canSubmit() || loading) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!canSubmit() || loading}
            >
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
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
  },
  roleSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  roleButtonTextActive: {
    color: "#1552C1",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
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
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  uploadCard: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    marginBottom: 32,
  },
  uploadCardDisabled: {
    opacity: 0.7,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
    textAlign: "center",
  },
  uploadDesc: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalSuccessHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  modalImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#1552C1",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#1552C1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  linkText: {
    color: "#1552C1",
    fontSize: 14,
    fontWeight: "700",
  },
});
