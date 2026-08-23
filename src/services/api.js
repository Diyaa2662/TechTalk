import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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

      // هل كان الطلب أصلاً مرسل مع توكن (Authorization header)؟
      const hadToken = Boolean(error.config?.headers?.Authorization);

      if (status === 401) {
        if (hadToken) {
          // كان في جلسة فعلية (توكن موجود) وانتهت صلاحيتها أثناء الاستخدام
          console.error("Session expired - Please login again");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        } else {
          // ما كان في توكن أصلاً (مثلاً طلب /login بكلمة سر غلط)
          // ما لازم نعمل ريدايركت هون، خلي الكومبوننت يعرض رسالة الخطأ
          console.error("Login failed - Invalid credentials");
        }
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
