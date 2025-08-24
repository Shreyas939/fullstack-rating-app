import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import StoreListPage from "../pages/StoreListPage";
import PrivateRoute from "./PrivateRoute";

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


      <Route path="/stores" element={
        <PrivateRoute allowedRoles={["normal_user", "store_owner", "system_admin"]}>
            <StoreListPage />
            </PrivateRoute>
        
        }
        />


      


    </Routes>
  );
}
