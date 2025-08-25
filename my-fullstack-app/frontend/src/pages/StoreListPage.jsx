// src/pages/StoreListPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserProfileMenu from "./UserProfileMenu";
import { AiFillStar, AiOutlineStar } from "react-icons/ai"; 

export default function StoreListPage() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingsLoading, setRatingsLoading] = useState({});

  const fetchStores = async () => {
    if (!accessToken) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;

      const res = await axios.get("http://localhost:4000/api/stores", {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setStores(res.data.data);
    } catch (e) {
      console.error("❌ Error fetching stores:", e.response?.data || e.message);
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [accessToken]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRatingSubmit = async (storeId, rating) => {
    setRatingsLoading((prev) => ({ ...prev, [storeId]: true }));

    if (!accessToken) {
      alert("No access token found. Please login again.");
      setRatingsLoading((prev) => ({ ...prev, [storeId]: false }));
      return;
    }

    try {
      await axios.post(
        `http://localhost:4000/api/ratings/${storeId}`,
        { rating },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchStores();
    } catch (e) {
      console.error("❌ Failed to submit rating:", e.response?.data || e.message);
      alert("Failed to submit rating.");
    } finally {
      setRatingsLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Stores</h1>
        <UserProfileMenu />
      </header>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by store name"
            value={search.name}
            onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            placeholder="Search by address"
            value={search.address}
            onChange={(e) => setSearch((s) => ({ ...s, address: e.target.value }))}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={fetchStores}
            className="px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading stores...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : stores.length === 0 ? (
        <p>No stores found.</p>
      ) : (
        <div className="space-y-6">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              userRating={store.user_rating}
              disabled={ratingsLoading[store.id]}
              onSubmitRating={handleRatingSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCard({ store, userRating, disabled, onSubmitRating }) {
  const [selectedRating, setSelectedRating] = useState(userRating || 0);

  const handleChangeRating = (rating) => setSelectedRating(rating);

  const handleSubmit = () => {
    if (selectedRating >= 1 && selectedRating <= 5) {
      onSubmitRating(store.id, selectedRating);
    } else {
      alert("Please select a rating between 1 to 5.");
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-300 shadow-lg rounded-2xl">
      <h2 className="text-xl font-semibold">{store.name}</h2>
      <p className="text-gray-600">{store.address}</p>
      <p>
        Overall Rating:{" "}
        <strong>
          {store.average_rating && !isNaN(store.average_rating)
            ? Number(store.average_rating).toFixed(2)
            : "0.00"}
        </strong>
      </p>
      <div className="flex items-center mt-3 space-x-3">
        <RatingSelector rating={selectedRating} onChange={handleChangeRating} disabled={disabled} />
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {userRating ? "Update Rating" : "Submit Rating"}
        </button>
      </div>
    </div>
  );
}

function RatingSelector({ rating, onChange, disabled }) {
  return (
    <div className="flex space-x-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <AiFillStar
            key={star}
            onClick={() => !disabled && onChange(star)}
            className="w-6 h-6 text-yellow-400"
          />
        ) : (
          <AiOutlineStar
            key={star}
            onClick={() => !disabled && onChange(star)}
            className="w-6 h-6 text-gray-400"
          />
        )
      )}
    </div>
  );
}
