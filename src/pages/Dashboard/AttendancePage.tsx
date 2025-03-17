import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Modal,
  IconButton,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import DashboardLayout from "../Layout/DashboardLayout";
import axios from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import theme from "../../theme"; // 🔹 Importar el tema

// Tipos de datos
interface Assignment {
  group_id: number;
  group_name: string;
  subject_id: number;
  subject_name: string;
}

interface Attendance {
  student_id: number;
  matricula: string;
  name: string;
  status: "presente" | "ausente" | "retardo";
}

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
const [searchDate, setSearchDate] = useState(dayjs());
const [searchedData, setSearchedData] = useState<{ [key: string]: Attendance[] }>({});

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`/assignments/user/${user.id}`);
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    fetchAssignments();
  }, [user]);

  useEffect(() => {
    if (!selectedGroup || !selectedSubject) return;

    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/attendances/group/${selectedGroup}/subject/${selectedSubject}`);
        const formattedData: Attendance[] = response.data.map((student: any) => ({
          ...student,
          status: "presente", // Por defecto, todos presentes
        }));
        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedGroup, selectedSubject]);
  
  const handleSearchAttendance = async () => {
    try {
      const response = await axios.get(`/attendances/search`, {
        params: { date: searchDate.format("YYYY-MM-DD") }
      });
      setSearchedData(response.data);
    } catch (error) {
      console.error("Error searching attendance:", error);
      setSearchedData({});
    }
  };
  
  const handleStatusChange = (studentId: number, newStatus: Attendance["status"]) => {
    setAttendanceData(attendanceData.map(att =>
      att.student_id === studentId ? { ...att, status: newStatus } : att
    ));
  };

  const handleSendAttendance = async () => {
    if (!selectedGroup || !selectedSubject) {
      setSnackbar({ open: true, message: "Selecciona un grupo y una materia antes de enviar la asistencia", severity: "error" });
      return;
    }

    try {
      await axios.post(`/attendances/submit`, {
        group_id: selectedGroup,
        subject_id: selectedSubject,
        date: new Date().toISOString().split("T")[0],
        attendances: attendanceData.map(att => ({
          student_id: att.student_id,
          status: att.status,
        })),
      });

      setSnackbar({ open: true, message: "Asistencia enviada correctamente", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "No se pudo enviar la asistencia", severity: "error" });
      console.error("Error al enviar asistencia:", error);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh", fontFamily: theme.fontFamily }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Registro de Asistencias
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Grupo y Materia</InputLabel>
          <Select
            value={selectedGroup && selectedSubject ? `${selectedGroup}-${selectedSubject}` : ""}
            onChange={(e) => {
              const [groupId, subjectId] = e.target.value.split("-");
              setSelectedGroup(groupId);
              setSelectedSubject(subjectId);
            }}
            sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
          >
            {assignments.map((assignment) => (
              <MenuItem key={`${assignment.group_id}-${assignment.subject_id}`} value={`${assignment.group_id}-${assignment.subject_id}`}>
                {`${assignment.subject_name} - ${assignment.group_name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box component={Paper} sx={{ mt: 3, maxHeight: 400, overflow: "auto", bgcolor: theme.colors.card, p: 2 }}>
          <Typography variant="h6" color={theme.colors.text}>Lista de Asistencias</Typography>
          {isLoading ? (
            <Typography color={theme.colors.text}>Cargando asistencias...</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {["Matrícula", "Nombre", "Estado"].map((header) => (
                    <TableCell key={header} sx={{ color: theme.colors.text }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: theme.colors.text, textAlign: "center" }}>
                      No hay datos de asistencia
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map(attendance => (
                    <TableRow key={attendance.student_id}>
                      <TableCell sx={{ color: theme.colors.text }}>{attendance.matricula}</TableCell>
                      <TableCell sx={{ color: theme.colors.text }}>{attendance.name}</TableCell>
                      <TableCell>
                        <FormControl sx={{ minWidth: 120 }}>
                          <Select
                            value={attendance.status}
                            onChange={(e) => handleStatusChange(attendance.student_id, e.target.value as Attendance["status"])}
                            sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
                          >
                            <MenuItem value="presente">Presente</MenuItem>
                            <MenuItem value="ausente">Ausente</MenuItem>
                            <MenuItem value="retardo">Retardo</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Box>
        <Button variant="contained" onClick={() => setModalOpen(true)} sx={{ mt: 3, bgcolor: theme.colors.secondary }}>
  Consultar Asistencias
</Button>

        <Button variant="contained" onClick={handleSendAttendance} sx={{ mt: 3, bgcolor: theme.colors.primary }}>
          Enviar Asistencia
        </Button>

        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
  <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
    <Typography variant="h6">Buscar Asistencias</Typography>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Selecciona una fecha"
        value={searchDate}
        onChange={(newValue) => newValue && setSearchDate(newValue)}
        sx={{ mt: 2, width: "100%" }}
      />
    </LocalizationProvider>
    <Button variant="contained" onClick={handleSearchAttendance} sx={{ mt: 2 }}>
      Buscar
    </Button>

    {Object.keys(searchedData).length > 0 && (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Resultados</Typography>
        {Object.entries(searchedData).map(([hour, records]) => (
          <Box key={hour} sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Hora: {hour}</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Materia</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.student_name}</TableCell>
                    <TableCell>{record.subject_name}</TableCell>
                    <TableCell>{record.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </Box>
    )}
  </Box>
</Modal>

      </Box>
    </DashboardLayout>
  );
};

export default AttendancePage;
