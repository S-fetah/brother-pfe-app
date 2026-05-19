const API_BASE_URL = "https://medi-care-vg2a.onrender.com/api";

const logRequest = (url, init) => {
  const requestInfo = {
    url,
    method: init.method,
    headers: init.headers,
  };

  if (init.body instanceof FormData) {
    const entries = [];
    for (const pair of init.body) {
      entries.push(pair[0]);
    }
    requestInfo.body = `FormData keys: ${entries.join(", ")}`;
  } else {
    requestInfo.body = init.body;
  }

  console.log("[API REQUEST]", requestInfo);
};

const handleResponse = async (url, response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  console.log("[API RESPONSE]", {
    url,
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.response = { status: response.status, data };
    throw error;
  }
  return { data };
};

const fetchWithLogging = async (url, init) => {
  logRequest(url, init);
  try {
    const response = await fetch(url, init);
    return await handleResponse(url, response);
  } catch (error) {
    console.log("[API ERROR]", {
      url,
      error: error.message,
      response: error.response,
    });
    throw error;
  }
};

export const authApi = {
  login: (data) =>
    fetchWithLogging(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }),

  register: (formData) =>
    fetchWithLogging(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    }),

  uploadDoctorCertificate: (formData) =>
    fetchWithLogging(`${API_BASE_URL}/auth/doctor/certificate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    }),
};

const mockDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), 800));

export const doctorApi = {
  getDoctors: () =>
    mockDelay([
      {
        _id: "1",
        fullName: "Dr. James Wilson",
        specialty: "Cardiology",
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        rating: 4.9,
        reviews: 120,
      },
      {
        _id: "2",
        fullName: "Dr. Sarah Chen",
        specialty: "Pediatrics",
        image:
          "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
        rating: 4.8,
        reviews: 85,
      },
    ]),
};

export const appointmentApi = {
  create: (data) => mockDelay({ ...data, _id: Math.random().toString() }),
  getUserAppointments: (userId) =>
    mockDelay([
      {
        _id: "1",
        doctor: { fullName: "Dr. James Wilson", specialty: "Cardiology" },
        date: new Date(),
        time: "10:30 AM",
        status: "upcoming",
      },
    ]),
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
