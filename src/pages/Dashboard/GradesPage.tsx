import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../../utils/api";
import DashboardLayout from "../Layout/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import theme from "../../theme"; // 🔹 Importar el tema

const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [partials] = useState<number[]>([1, 2, 3]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedPartial, setSelectedPartial] = useState<number | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [editedGrades, setEditedGrades] = useState<Record<number, any>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [originalValues, setOriginalValues] = useState<Record<number, Record<string, any>>>({});

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get(`/assignments/user/${user.id}`);
        setAssignments(response.data);
        const uniqueGroups = response.data.reduce((acc: any[], curr: { group_id: number; group_name: string }) => {
          if (!acc.find((g) => g.id === curr.group_id)) {
            acc.push({ id: curr.group_id, name: curr.group_name });
          }
          return acc;
        }, []);
        setGroups(uniqueGroups);
        setSubjects([]);
      } catch (error) {
        console.error("Error al obtener asignaciones:", error);
      }
    };

    fetchAssignments();
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    const relatedSubjects = assignments
      .filter((a) => a.group_id === selectedGroup)
      .map((a) => ({ id: a.subject_id, name: a.subject_name }));
    setSubjects(relatedSubjects);
    setSelectedSubject(null);
  }, [selectedGroup, assignments]);

  const fetchGrades = async () => {
    if (!selectedGroup || !selectedSubject || !selectedPartial) return;
    try {
      const response = await api.get(
        `/grade/group/${selectedGroup}/subject/${selectedSubject}/${selectedPartial}`
      );
      const sortedGrades = response.data.sort((a: any, b: any) => a.matricula.localeCompare(b.matricula));
      setGrades(sortedGrades);
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [selectedGroup, selectedSubject, selectedPartial]);

  const handleChange = (id: number, field: string, value: string) => {
    setEditedGrades((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    try {
      await api.put(`/grade/${id}`, editedGrades[id]);

      setSnackbar({ open: true, message: "Calificación guardada con éxito", severity: "success" });

      setEditedGrades({});
      fetchGrades();
    } catch (error) {
      console.error("Error al actualizar calificación:", error);
      setSnackbar({ open: true, message: "Error al guardar la calificación", severity: "error" });
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Calificaciones
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Grupo</InputLabel>
          <Select
            value={selectedGroup ?? ""}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Materia</InputLabel>
          <Select
            value={selectedSubject ?? ""}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
            sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Parcial</InputLabel>
          <Select
            value={selectedPartial ?? ""}
            onChange={(e) => setSelectedPartial(Number(e.target.value))}
            sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
          >
            {partials.map((partial) => (
              <MenuItem key={partial} value={partial}>
                Parcial {partial}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box component={Paper} sx={{ mt: 3, maxHeight: 400, overflow: "auto", bgcolor: theme.colors.card, p: 2 }}>
          <Typography variant="h6" color={theme.colors.text}>Lista de Calificaciones</Typography>
          <Table>
            <TableHead>
              <TableRow>
                {["Matrícula", "Nombre", "Actividad 1", "Actividad 2", "Asistencia", "Proyecto", "Examen", "Acción"].map((header) => (
                  <TableCell key={header} sx={{ color: theme.colors.text }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell sx={{ color: theme.colors.text }}>{grade.matricula}</TableCell>
                  <TableCell sx={{ color: theme.colors.text }}>{grade.name}</TableCell>
                  {["activity_1", "activity_2", "attendance", "project", "exam"].map((field) => (
  <TableCell key={field}>
    <TextField
      value={editedGrades[grade.id]?.[field] ?? grade[field]}
      onFocus={() => {
        // Al hacer foco, almacenamos el valor original si aún no se ha guardado
        const currentValue = editedGrades[grade.id]?.[field] ?? grade[field];
        setOriginalValues((prev) => ({
          ...prev,
          [grade.id]: {
            ...prev[grade.id],
            [field]: currentValue,
          },
        }));
        // Limpiamos el input
        handleChange(grade.id, field, "");
      }}
      onBlur={() => {
        // Si el usuario no ingresó nada, restauramos el valor original
        const currentValue = editedGrades[grade.id]?.[field];
        if (currentValue === "" || currentValue === null || currentValue === undefined) {
          const original = originalValues[grade.id]?.[field];
          if (original !== undefined) {
            handleChange(grade.id, field, original);
          }
        }
      }}
      onChange={(e) => handleChange(grade.id, field, e.target.value)}
      sx={{ input: { color: theme.colors.text }, bgcolor: theme.colors.card }}
    />
  </TableCell>
))}



                  <TableCell>
                    <Button variant="contained" onClick={() => handleSave(grade.id)} sx={{ bgcolor: theme.colors.primary }}>
                      Guardar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* 🔹 Snackbar para mostrar alertas */}
        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default GradesPage;
