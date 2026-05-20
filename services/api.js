import { apiClient } from '../api/client';
import { getDoctors } from '../api/doctors';
import { bookAppointment, getUserBookings } from '../api/bookings';

export const authApi = {
  login: (data) =>
    apiClient('/auth/login', {
      method: "POST",
      body: JSON.stringify(data),
    }).then((data) => ({ data })),

  register: (body) =>
    apiClient('/auth/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((data) => ({ data })),

  uploadDoctorCertificate: (formData) =>
    apiClient('/auth/doctor/certificate', {
      method: "POST",
      body: formData,
    }).then((data) => ({ data })),

  getUser: () =>
    apiClient('/user').then((data) => ({ data })),
};

const mockDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), 800));

export const doctorApi = {
  getDoctors: () => getDoctors().then((data) => ({ data })),
};

export const appointmentApi = {
  create: (data) => bookAppointment(data.appointmentId).then((response) => ({ data: response })),
  getUserAppointments: () => getUserBookings().then((data) => ({ data })),
};

export const messageApi = {
  getHistory: (u1, u2) =>
    mockDelay([
      {
        _id: "1",
        text: "Hello, how can I help you?",
        sender: u2,
        createdAt: new Date(),
      },
    ]),
  send: (data) =>
    mockDelay({
      ...data,
      _id: Math.random().toString(),
      createdAt: new Date(),
    }),
};

export default {
  get: () => Promise.resolve({ data: [] }),
  post: () => Promise.resolve({ data: {} }),
};
