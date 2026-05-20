import { apiClient } from './client';

export const login = (email, password) =>
  apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const signup = ({ fullName, email, password }) =>
  apiClient('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email: email.toLowerCase(), password, userType: 'user' }),
  });

export const uploadCertificate = async (fileUri, fileName, mimeType) => {
  const formData = new FormData();
  formData.append('file', { uri: fileUri, name: fileName, type: mimeType });

  return apiClient('/auth/doctor/certificate', {
    method: 'POST',
    body: formData,
  });
};

export const doctorSignup = ({ fullName, email, password, speciality, certificateUrl }) =>
  apiClient('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      email: email.toLowerCase(),
      password,
      userType: 'doctor',
      speciality,
      certificateUrl,
    }),
  });
