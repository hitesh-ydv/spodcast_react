import axios from "axios";
import { decodeObject } from "../utils/decodeHtml";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

let refreshPromise = null;

const getNewToken = async () => {
  const { data } = await axios.get(
    `${API_URL}/api/session`
  );

  sessionStorage.setItem(
    "token",
    data.token
  );

  return data.token;
};

api.interceptors.request.use(async (config) => {
  let token = sessionStorage.getItem("token");

  if (!token) {
    token = await getNewToken();
  }

  config.headers.Authorization =
    `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = decodeObject(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = getNewToken();
        }

        const token = await refreshPromise;

        refreshPromise = null;

        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      } catch (err) {
        refreshPromise = null;
        sessionStorage.removeItem("token");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;