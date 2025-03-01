import React, { useEffect, useState } from "react";
import { Typography, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardLayout from "../Layout/DashboardLayout";
import api from "../../utils/api";
import theme from "../../theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<number[]>([]);
  const [gradesData, setGradesData] = useState<number[]>([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceAverage, setAttendanceAverage] = useState("0%");

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const response = await api.get("/users/homepage/stats");
        setUser(response.data.user);
        setAttendanceData(response.data.attendanceData || [0, 0, 0, 0, 0]);
        setGradesData(response.data.gradesData || [0, 0, 0]);
        setTotalAttendance(response.data.totalAttendance || 0);
        setTotalStudents(response.data.totalStudents || 0);
        setAttendanceAverage(response.data.attendanceAverage || "0%");
      } catch (err) {
        console.error("Error al cargar el homepage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  const barData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Asistencias",
        data: attendanceData,
        backgroundColor: "#08DC2B",
        borderColor: "#131515",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["1° Grado", "2° Grado", "3° Grado"],
    datasets: [
      {
        data: gradesData,
        backgroundColor: ["#08DC2B", "#2B2C28", "#131515"],
      },
    ],
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress color="secondary" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh", fontFamily: theme.fontFamily }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="#08DC2B">
          ¡Bienvenido a CACE!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Tu sesión ha sido confirmada con éxito.
        </Typography>

        {/* Tarjetas Resumen */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[{ label: "Total de Asistencias", value: totalAttendance }, { label: "Estudiantes Registrados", value: totalStudents }, { label: "Promedio de Asistencias", value: attendanceAverage }].map(
            (item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, textAlign: "center", p: 2, borderRadius: "10px", border: `2px solid #08DC2B` }}>
                  <Typography variant="h6">{item.label}</Typography>
                  <Typography variant="h4">{item.value}</Typography>
                </Card>
              </Grid>
            )
          )}
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" color="#08DC2B">
                  Asistencias de los últimos meses
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" color="#08DC2B">
                  Asistencias por Grados
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default HomePage;
