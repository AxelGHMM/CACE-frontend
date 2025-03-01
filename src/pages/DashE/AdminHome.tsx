import React, { useEffect, useState } from "react";
import { Typography, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashELayout from "../Layout/DashELayout";
import api from "../../utils/api";
import theme from "../../theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [usersByRole, setUsersByRole] = useState<number[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get("/admin/homepage");
        setTotalUsers(response.data.totalUsers);
        setTotalSubjects(response.data.totalSubjects);
        setTotalGroups(response.data.totalGroups);
        setUsersByRole(response.data.usersByRole);
      } catch (err) {
        console.error("Error al cargar datos administrativos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const barData = {
    labels: ["Administradores", "Profesores"],
    datasets: [
      {
        label: "Cantidad",
        data: usersByRole,
        backgroundColor: theme.colors.primary, // 🟢 Verde brillante
      },
    ],
  };

  if (loading) {
    return (
      <DashELayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress color="secondary" />
        </Box>
      </DashELayout>
    );
  }

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh", fontFamily: theme.fontFamily }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Panel de Administración
        </Typography>
        <Typography variant="body1" gutterBottom>
          Vista general del sistema.
        </Typography>

        {/* Tarjetas Resumen */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[
            { label: "Usuarios Totales", value: totalUsers },
            { label: "Materias Registradas", value: totalSubjects },
            { label: "Grupos Registrados", value: totalGroups },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, textAlign: "center", p: 2, borderRadius: "10px", border: `2px solid ${theme.colors.primary}` }}>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="h4">{item.value}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" color={theme.colors.primary}>
                  Usuarios por Rol
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashELayout>
  );
};

export default AdminHome;
