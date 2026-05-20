import { API_BASE_URL } from "../config/api";
import { clearSession, getToken } from "../utils/authStorage";

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const apiClient = async (endpoint, options = {}) => {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    console.error(
      `[API ERROR] ${response.status} ${response.statusText}:`,
      data,
    );
    const error = new Error(data?.message || data?.error || "Request failed");
    error.status = response.status;
    error.data = data;
    if (response.status === 401) {
      await clearSession();
    }
    throw error;
  }

  return data;
};
