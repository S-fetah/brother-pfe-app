import { apiClient } from './client';

export const getUserBookings = async () => {
  const response = await apiClient('/user/bookings');
  return Array.isArray(response?.data) ? response.data : [];
};

export const bookAppointment = (appointmentId) =>
  apiClient('/user/bookings/book', {
    method: 'POST',
    body: JSON.stringify({ appointmentId }),
  });
