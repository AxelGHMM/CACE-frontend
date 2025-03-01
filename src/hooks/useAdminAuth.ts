import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAdminAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/"); // Redirige a la página de inicio si no es admin
    }
  }, [user, navigate]);

  return user?.role === "admin";
};

export default useAdminAuth;
