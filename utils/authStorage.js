import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'userId';
const USER_PROFILE_KEY = 'userProfile';

export const saveToken = (token) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

export const getToken = () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const removeToken = () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);

export const saveUserId = (userId) => SecureStore.setItemAsync(USER_ID_KEY, userId);

export const getUserId = () => SecureStore.getItemAsync(USER_ID_KEY);

export const removeUserId = () => SecureStore.deleteItemAsync(USER_ID_KEY);

export const saveUserProfile = (user) =>
  SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(user || {}));

export const getUserProfile = async () => {
  const stored = await SecureStore.getItemAsync(USER_PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearSession = async () => {
  await Promise.all([
    removeToken(),
    removeUserId(),
    SecureStore.deleteItemAsync(USER_PROFILE_KEY),
  ]);
};
