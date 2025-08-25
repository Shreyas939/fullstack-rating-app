import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserProfileMenu from "./UserProfileMenu";
import { backend_Url } from "../constants/env";

export default function StoreOwnerDashboard() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStoreRatings = async () => {
    if (!accessToken) {
      setError("No access token found, please login.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${backend_Url}/api/store-owner/ratings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRatings(response.data.data);
    } catch (err) {
      setError("Failed to load store ratings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreRatings();
  }, [accessToken]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

  if (loading) return <div className="p-6">Loading Store Owner Dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl p-6 mx-auto mt-10 bg-white border border-gray-300 shadow-lg rounded-2xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Store Owner Dashboard</h1>
        <UserProfileMenu />
      </header>

      <section className="p-4 mb-6 border border-gray-300 rounded-lg bg-gray-50">
        <h2 className="mb-2 text-xl font-semibold">Average Rating</h2>
        <p className="text-3xl font-bold text-blue-600">{averageRating.toFixed(2)}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Users Who Rated Your Store</h2>
        {ratings.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          <ul className="space-y-4">
            {ratings.map(({ id, user_name, rating, created_at }) => (
              <li key={id} className="p-4 bg-white border border-gray-300 rounded shadow">
                <p className="font-semibold">{user_name}</p>
                <p>Rating: {rating} / 5</p>
                <p className="text-sm text-gray-500">
                  Rated on: {new Date(created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
