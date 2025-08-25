import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import StoreListPage from "../pages/StoreListPage";
import PrivateRoute from "./PrivateRoute";
import AdminDashboard from "../pages/AdminDashboard";
import StoreOwnerDashboard from "../pages/StoreOwnerDashboard";
import PasswordUpdatePage from "../pages/PasswordUpdatePage";
import AdminAddUserPage from "../pages/AdminAddUserPage";
import AdminAddStorePage from "../pages/AdminAddStorePage";
import AdminUserListPage from "../pages/AdminUserListPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<div>404 - Page not found</div>} />

      <Route
        path="/stores"
        element={
          <PrivateRoute allowedRoles={["normal_user", "store_owner", "system_admin"]}>
            <StoreListPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["system_admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/store-owner"
        element={
          <PrivateRoute allowedRoles={["store_owner"]}>
            <StoreOwnerDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/update-password"
        element={
          <PrivateRoute allowedRoles={["normal_user", "store_owner", "system_admin"]}>
            <PasswordUpdatePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users/add"
        element={
          <PrivateRoute allowedRoles={["system_admin"]}>
            <AdminAddUserPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/stores"
        element={
          <PrivateRoute allowedRoles={["system_admin"]}>
            <AdminAddStorePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={["system_admin"]}>
            <AdminUserListPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
