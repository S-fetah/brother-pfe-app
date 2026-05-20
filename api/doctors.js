import { apiClient } from './client';

export const DEFAULT_DOCTOR_IMAGE = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200';

export const normalizeDoctor = (doctor) => ({
  ...doctor,
  id: doctor.uid || doctor._id || doctor.id,
  uid: doctor.uid || doctor._id || doctor.id,
  name: doctor.fullName || doctor.name || 'Unknown Doctor',
  fullName: doctor.fullName || doctor.name || 'Unknown Doctor',
  specialty: doctor.speciality || doctor.specialty || 'General',
  speciality: doctor.speciality || doctor.specialty || 'General',
  image: doctor.image || DEFAULT_DOCTOR_IMAGE,
});

export const getDoctors = async () => {
  const response = await apiClient('/doctors');
  const rawDoctors = Array.isArray(response?.data)
    ? response.data
    : response?.data?.FileterdDoctors || [];

  return rawDoctors.map(normalizeDoctor);
};

export const getDoctorAppointments = async (doctorId) => {
  const response = await apiClient(`/doctors/${doctorId}/appointments`);
  return Array.isArray(response?.data) ? response.data : [];
};
