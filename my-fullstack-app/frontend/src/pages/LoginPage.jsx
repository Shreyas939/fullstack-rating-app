import { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { backend_Url } from "../constants/env";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, login } = useAuth();

  // redirect if already logged in
  if (user) {
    const redirectTo =
      user.role === "system_admin"
        ? "/admin"
        : user.role === "store_owner"
          ? "/store-owner"
          : "/stores";

    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${backend_Url}/api/auth/login`, {
        email,
        password,
      });

      const { accessToken, refreshToken, user: userData } = response.data.data;

      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Map role_id → role string
      const roleMap = {
        1: "system_admin",
        2: "normal_user",
        3: "store_owner",
      };
      const normalizedRole = roleMap[userData.role_id] || "normal_user";

      console.log("Backend user role_id:", userData.role_id);
      console.log("Normalized role:", normalizedRole);

      const normalizedUser = { ...userData, role: normalizedRole };

      // Update auth context
      login(normalizedUser, accessToken, refreshToken);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-3xl font-semibold text-center text-gray-800">Login</h2>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-gray-700"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Not registered yet?{" "}
          <Link to="/signup" className="font-medium text-blue-600 cursor-pointer hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
