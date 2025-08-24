import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // backend base URL
});

// 🔹 Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Refresh token logic when 401 happens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // Call backend refresh endpoint
        const { data } = await axios.post("http://localhost:4000/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // Update axios headers
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the failed request
        return api(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed:", err);

        // Clear tokens & force re-login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
