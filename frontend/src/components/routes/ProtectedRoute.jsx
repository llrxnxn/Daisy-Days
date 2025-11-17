// components/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!user) {
    alert("Please login first!");
    return <Navigate to="/Login" replace />;
  }

  // ❌ Logged in but wrong role
  if (!allowedRoles.includes(user.role)) {
    alert("You can't go in this page!");

    // If ADMIN is trying to access USER pages → stay in Admin Dashboard
    if (user.role === "admin") {
      return <Navigate to="/AdminDashboard" replace />;
    }

    // If CUSTOMER trying to access Admin → go Home
    return <Navigate to="/" replace />;
  }

  // ✔ Role allowed
  return children;
}
