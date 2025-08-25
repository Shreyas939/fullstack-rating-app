import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; 
import { backend_Url } from "../constants/env";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); //  state for toggle

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) {
      errs.name = "Name must be between 20 and 60 characters.";
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Valid email is required.";
    }
    if (form.address && form.address.length > 400) {
      errs.address = "Address must not exceed 400 characters.";
    }
    if (!form.password || !/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(form.password)) {
      errs.password =
        "Password must be 8-16 characters, include 1 uppercase letter and 1 special character.";
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${backend_Url}/api/auth/signup`, form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      setApiError(error.response?.data?.message || "Signup failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-xl">
        <h2 className="mb-6 text-3xl font-semibold text-center text-gray-800">SignUp</h2>

        {apiError && (
          <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded-md">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address (optional)"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.address
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            rows="3"
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}

          {/* Password with toggle */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            <div className="absolute inset-y-0 flex items-center right-3">
              {showPassword ? (
                <FaRegEye
                  size={22}
                  className="cursor-pointer text-primary"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaRegEyeSlash
                  size={24}
                  className="cursor-pointer text-slate-400"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-medium text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="font-medium text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
