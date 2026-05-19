import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://backup-earrings-finance-davis.trycloudflare.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const isFormData = config.data instanceof FormData;

    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error("Session expired - Please login again");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else if (status === 403) {
        console.error("No permission to access this resource");
      } else if (status === 404) {
        console.error("Resource not found");
      } else if (status === 422) {
        console.error("Validation error - Please check your input");
      } else if (status === 500) {
        console.error("Server error - Please try again later");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
