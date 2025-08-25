import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserProfileMenu from "./UserProfileMenu";

export default function AdminDashboard() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    ratings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!accessToken) {
      setError("No access token found. Please login.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:4000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStats(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [accessToken]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="p-6">
        <div className="p-6 bg-white shadow-lg rounded-2xl">Loading dashboard...</div>
      </div>
    );

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <UserProfileMenu />
      </header>

      {error && <p className="mb-4 font-medium text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Total Users" value={stats.users} />
        <StatCard title="Total Stores" value={stats.stores} />
        <StatCard title="Total Ratings" value={stats.ratings} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-6 text-center bg-white border border-gray-300 shadow-lg rounded-2xl">
      <p className="text-xl font-semibold text-gray-700">{title}</p>
      <p className="mt-2 text-4xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
