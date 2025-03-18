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
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<{ group: string; subject: string; count: number }[]>([]);
  const [gradesData, setGradesData] = useState<{ partial: string; count: number; percentage: string }[]>([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceAverage, setAttendanceAverage] = useState("0%");

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const response = await api.get("/users/homepage/stats");
        console.log("Datos recibidos:", response.data);
        
        setAttendanceData(response.data.attendanceData || []);
        setGradesData(response.data.gradesData || []);
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
    labels: attendanceData.map((item) => `${item.group} - ${item.subject}`), // Grupo + Materia en etiquetas
    datasets: [
      {
        label: "Asistencias por Grupo y Materia",
        data: attendanceData.map((item) => item.count),
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.text,
        borderWidth: 1,
      },
    ],
  };
  const pieData = {
    labels: gradesData.map((item) => item.partial), // "Parcial 1", "Parcial 2", "Parcial 3"
    datasets: [
      {
        data: gradesData.map((item) => item.count), // Usamos el promedio de calificación
        backgroundColor: [theme.colors.primary, theme.colors.secondary, theme.colors.sidebar],
      },
    ],
  };
  
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => `Promedio: ${tooltipItem.raw.toFixed(2)}`, // Mostramos el promedio real
        },
      },
    },
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
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
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
                <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text, textAlign: "center", p: 2, borderRadius: theme.borderRadius, border: `2px solid ${theme.colors.primary}` }}>
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
                <Typography variant="h6" color={theme.colors.primary}>
                  Asistencias por Grupo y Materia
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
      <Typography variant="h6" color={theme.colors.primary}>
        Promedio de Calificaciones por Parcial
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <Pie data={pieData} options={pieOptions} />
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
