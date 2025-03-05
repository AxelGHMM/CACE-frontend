import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../../utils/api";
import DashELayout from "../Layout/DashELayout";
import theme from "../../theme";

const SubjectGroup: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "success" });

  const [assignments, setAssignments] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const [professorAssignments, setProfessorAssignments] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const response = await api.get("/users/role/professor");
      setProfessors(response.data);
    } catch (error) {
      console.error("Error al obtener profesores:", error);
    }
  };

  const handleAddGroup = async () => {
    if (!groupName.trim()) {
      setMessage({ text: "El nombre del grupo es obligatorio", type: "error" });
      return;
    }

    try {
      await api.post("/groups", { name: groupName });
      setMessage({ text: "Grupo agregado con éxito", type: "success" });
      setGroupName("");
    } catch (error) {
      console.error("Error al agregar grupo:", error);
      setMessage({ text: "Error al agregar grupo", type: "error" });
    }
  };

  const handleAddSubject = async () => {
    if (!subjectName.trim()) {
      setMessage({ text: "El nombre de la materia es obligatorio", type: "error" });
      return;
    }

    try {
      await api.post("/subjects", { name: subjectName });
      setMessage({ text: "Materia agregada con éxito", type: "success" });
      setSubjectName("");
    } catch (error) {
      console.error("Error al agregar materia:", error);
      setMessage({ text: "Error al agregar materia", type: "error" });
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProfessor(null);
    setProfessorAssignments([]);
  };

  const fetchProfessorAssignments = async (professorId: number) => {
    setSelectedProfessor(professorId);
    try {
      const response = await api.get(`/assignments/user/${professorId}`);
      setProfessorAssignments(response.data);
    } catch (error) {
      console.error("Error al obtener asignaciones del profesor:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta asignación?")) return;

    try {
      await api.delete(`/assignments/${id}`);
      if (selectedProfessor) fetchProfessorAssignments(selectedProfessor);
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
    }
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, minHeight: "100vh" }}>
        <Typography variant="h4" color={theme.colors.primary} fontWeight="bold">
          Gestión de Materias y Grupos
        </Typography>

        {/* Botón para abrir el modal */}
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={handleOpenModal}
        >
          Manejo de Asignaciones
        </Button>

        {/* 🔹 Formulario para agregar grupos */}
        <Paper sx={{ p: 3, bgcolor: theme.colors.card, mt: 3, borderRadius: "10px" }}>
          <Typography variant="h6" color={theme.colors.primary}>
            Agregar Grupo
          </Typography>
          <TextField
            fullWidth
            label="Nombre del Grupo"
            variant="outlined"
            sx={{ mt: 2, input: { color: theme.colors.text }, bgcolor: theme.colors.background }}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            InputLabelProps={{ style: { color: theme.colors.text } }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
            onClick={handleAddGroup}
          >
            Guardar Grupo
          </Button>
        </Paper>

        {/* 🔹 Formulario para agregar materias */}
        <Paper sx={{ p: 3, bgcolor: theme.colors.card, mt: 3, borderRadius: "10px" }}>
          <Typography variant="h6" color={theme.colors.primary}>
            Agregar Materia
          </Typography>
          <TextField
            fullWidth
            label="Nombre de la Materia"
            variant="outlined"
            sx={{ mt: 2, input: { color: theme.colors.text }, bgcolor: theme.colors.background }}
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            InputLabelProps={{ style: { color: theme.colors.text } }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
            onClick={handleAddSubject}
          >
            Guardar Materia
          </Button>
        </Paper>

        {/* Modal para manejo de asignaciones */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
          <DialogTitle sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}>
            Manejo de Asignaciones
          </DialogTitle>
          <DialogContent sx={{ bgcolor: theme.colors.background }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: theme.colors.text }}>Seleccionar Profesor</InputLabel>
              <Select
                value={selectedProfessor ?? ""}
                onChange={(e) => fetchProfessorAssignments(Number(e.target.value))}
                sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}
              >
                {professors.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tabla con las asignaciones del profesor */}
            {selectedProfessor && (
              <Table sx={{ mt: 3, bgcolor: theme.colors.card }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.colors.text }}>Grupo</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>Materia</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {professorAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell sx={{ color: theme.colors.text }}>{assignment.group_name}</TableCell>
                      <TableCell sx={{ color: theme.colors.text }}>{assignment.subject_name}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(assignment.id)} sx={{ color: theme.colors.error }}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: theme.colors.card }}>
            <Button onClick={handleCloseModal} sx={{ color: theme.colors.text }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashELayout>
  );
};

export default SubjectGroup;
