import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { backend_Url } from "../constants/env";

export default function PasswordUpdatePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (pwd) => {
    const lengthValid = pwd.length >= 8 && pwd.length <= 16;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return lengthValid && hasUppercase && hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be 8-16 characters and include at least one uppercase letter and one special character."
      );
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${backend_Url}/api/auth/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-3xl font-semibold text-center text-gray-800">Update Password</h2>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-2 mb-4 text-sm text-green-600 bg-green-100 border border-green-300 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-gray-700"
              onClick={() => setShowCurrent((prev) => !prev)}
            >
              {showCurrent ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-gray-700"
              onClick={() => setShowNew((prev) => !prev)}
            >
              {showNew ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-gray-700"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled || loading}
            className="w-full py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {success && (
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 mt-4 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
