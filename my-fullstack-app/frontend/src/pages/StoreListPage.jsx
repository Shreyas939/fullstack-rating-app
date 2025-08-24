// src/pages/StoreListPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function StoreListPage() {
  const { accessToken } = useAuth(); // Get token from context
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingsLoading, setRatingsLoading] = useState({}); // To track rating submission per store

  // Fetch stores with optional filters
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
  }, [accessToken]); // Refetch when token changes

  // Submit or update user's rating for a store
  const handleRatingSubmit = async (storeId, rating) => {
    setRatingsLoading((prev) => ({ ...prev, [storeId]: true }));

    if (!accessToken) {
      alert("No access token found. Please login again.");
      setRatingsLoading((prev) => ({ ...prev, [storeId]: false }));
      return;
    }

    try {
      await axios.post(
        `http://localhost:4000/api/ratings/${storeId}`, // storeId in URL path
        { rating }, // body contains rating only
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchStores(); // Refresh list to update ratings
    } catch (e) {
      console.error("❌ Failed to submit rating:", e.response?.data || e.message);
      alert("Failed to submit rating.");
    } finally {
      setRatingsLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Stores</h1>

      {/* Search inputs */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by store name"
          value={search.name}
          onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Search by address"
          value={search.address}
          onChange={(e) =>
            setSearch((s) => ({ ...s, address: e.target.value }))
          }
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchStores}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Content */}
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

  const handleChangeRating = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (selectedRating >= 1 && selectedRating <= 5) {
      onSubmitRating(store.id, selectedRating);
    } else {
      alert("Please select a rating between 1 to 5.");
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold">{store.name}</h2>
      <p className="text-gray-600">{store.address}</p>
      <p>
        Overall Rating:{" "}
        <strong>
          {typeof store.average_rating === "number"
            ? store.average_rating.toFixed(2)
            : "0.00"}
        </strong>
      </p>
      <div className="flex items-center mt-2 space-x-3">
        <RatingSelector
          rating={selectedRating}
          onChange={handleChangeRating}
          disabled={disabled}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
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
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "#fbbf24" : "none"}
          viewBox="0 0 24 24"
          stroke="#fbbf24"
          strokeWidth={2}
          className="w-6 h-6"
          onClick={() => !disabled && onChange(star)}
          style={{ pointerEvents: disabled ? "none" : "auto" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 
            3.974a1 1 0 00.95.69h4.178c.969 
            0 1.371 1.24.588 1.81l-3.388 
            2.455a1 1 0 00-.364 1.118l1.287 
            3.974c.3.922-.755 1.688-1.54 
            1.118l-3.388-2.455a1 1 0 
            00-1.176 0l-3.388 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 
            1 0 00-.364-1.118L2.047 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z"
          />
        </svg>
      ))}
    </div>
  );
}
