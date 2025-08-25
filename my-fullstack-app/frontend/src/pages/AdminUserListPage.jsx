import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { backend_Url } from "../constants/env";

export default function AdminUserListPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState("");

  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers("");
    try {
      const params = {
        sort: sortField,
        dir: sortOrder,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const res = await axios.get(`${backend_Url}/api/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });
      setUsers(res.data.data || []);
    } catch (err) {
      setErrorUsers("Failed to fetch users");
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortField, sortOrder, filters, accessToken]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleAddUserClick = () => {
    navigate("/admin/users/add");
  };

  const clearFilters = () => {
    setFilters({ name: "", email: "", address: "", role: "" });
  };

  return (
    <div className="max-w-5xl p-6 mx-auto mt-10 bg-white border border-gray-300 shadow-lg rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold">User Management</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <input
          name="name"
          type="text"
          value={filters.name}
          onChange={handleFilterChange}
          placeholder="Filter by name"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          name="email"
          type="text"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Filter by email"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          name="address"
          type="text"
          value={filters.address}
          onChange={handleFilterChange}
          placeholder="Filter by address"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Roles</option>
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="system_admin">System Administrator</option>
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={clearFilters} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Clear Filters
        </button>

        <button
          onClick={handleAddUserClick}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          + Add New User
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Users table */}
      {loadingUsers ? (
        <p>Loading users...</p>
      ) : errorUsers ? (
        <p className="text-red-600">{errorUsers}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full mb-10 border border-gray-300 rounded-lg shadow">
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
              <th className="p-3 cursor-pointer" onClick={() => handleSort("role")}>
                Role {sortField === "role" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.address}</td>
                <td className="p-3">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
