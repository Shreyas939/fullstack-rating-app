import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminAddStorePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const [owners, setOwners] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // fetching owners
  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await axios.get("http://localhost:4000/api/admin/users", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const users = res.data.data || res.data.users || [];
        const storeOwners = users.filter(
          (user) => user.role === "store_owner" || user.role_id === 3
        );
        setOwners(storeOwners);
      } catch (err) {
        console.error("Failed to fetch users:", err.response || err.message);
      }
    }
    fetchOwners();
  }, [accessToken]);

  // fetching stores
  const fetchStores = async () => {
    setError("");
    try {
      const params = { sort: sortField, dir: sortOrder };
      if (search) params.name = search;
      const res = await axios.get("http://localhost:4000/api/stores", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });
      setStores(res.data.data || []);
    } catch (err) {
      setError("Could not fetch stores.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortField, sortOrder, search, accessToken]);

  const validateForm = () => {
    const { name, email, address, owner_id } = form;
    const nameValid = name.length >= 20 && name.length <= 60;
    const addressValid = address.length <= 400;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const ownerValid = !!owner_id;
    return nameValid && emailValid && addressValid && ownerValid;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) {
      setError("Name 20-60 chars, address ≤400, valid email, and owner selection required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:4000/api/stores", form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccess("Store added successfully!");
      setForm({ name: "", email: "", address: "", owner_id: "" });
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add store.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">Add New Store</h2>

      {error && (
        <div className="p-3 mb-4 text-red-600 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 text-green-600 bg-green-100 border border-green-300 rounded-lg">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-6 mb-8 space-y-4 bg-white border border-gray-300 shadow-lg rounded-2xl"
      >
        <input
          type="text"
          name="name"
          placeholder="Store Name (20-60 chars)"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Store Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address (max 400 chars)"
          value={form.address}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <select
          name="owner_id"
          value={form.owner_id}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Select Store Owner</option>
          {owners.length === 0 && <option disabled>No store owners available</option>}
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Store"}
        </button>

        {success && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 mt-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        )}
      </form>

      <h2 className="mb-2 text-xl font-semibold">Store List</h2>
      <input
        type="text"
        placeholder="Search by store name"
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border border-gray-300 rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="p-3 cursor-pointer" onClick={() => handleSort("email")}>
              Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="p-3 cursor-pointer" onClick={() => handleSort("address")}>
              Address {sortField === "address" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="p-3">Owner</th>
            <th className="p-3">Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="even:bg-gray-50">
              <td className="p-3">{store.name}</td>
              <td className="p-3">{store.email}</td>
              <td className="p-3">{store.address}</td>
              <td className="p-3">{store.owner_name || ""}</td>
              <td className="p-3">
                {store.average_rating ? Number(store.average_rating).toFixed(2) : "0.00"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
