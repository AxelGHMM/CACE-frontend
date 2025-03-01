import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { Backdrop } from "@mui/material";

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Backdrop open sx={{ zIndex: 9999, bgcolor: "rgba(0, 0, 0, 0.8)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <CircularProgress color="secondary" size={80} />
        </motion.div>
      </Backdrop>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isAdminRoute = location.pathname.startsWith("/dashE");

  // 🔹 Si es una ruta de admin pero el usuario no es admin, redirigir a Dashboard
  if (isAdminRoute && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // 🔹 Si es una ruta de profesores y el usuario es admin, redirigirlo a DashE
  if (!isAdminRoute && user.role === "admin") {
    return <Navigate to="/dashE" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
