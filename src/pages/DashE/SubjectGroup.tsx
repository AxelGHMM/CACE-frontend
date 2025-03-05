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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const [professorAssignments, setProfessorAssignments] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchProfessors();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get("/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await api.get("/users/role/professor");
      setProfessors(response.data);
    } catch (error) {
      console.error("Error al obtener profesores:", error);
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
      fetchAssignments();
      if (selectedProfessor) fetchProfessorAssignments(selectedProfessor);
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
    }
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, minHeight: "100vh" }}>
        <Typography variant="h4" color={theme.colors.primary} fontWeight="bold">
          Gestión de Asignaciones
        </Typography>

        {/* Botón para abrir el modal */}
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={handleOpenModal}
        >
          Manejo de Asignaciones
        </Button>

        {/* Modal para manejar asignaciones */}
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
