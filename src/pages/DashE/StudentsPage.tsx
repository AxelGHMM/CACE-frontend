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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../../utils/api";
import * as XLSX from "xlsx";
import DashELayout from "../Layout/DashELayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import theme from "../../theme";

const StudentsPage: React.FC = () => {
  const isAdmin = useAdminAuth();
  if (!isAdmin) return null;

  const [professors, setProfessors] = useState<any[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState<number | null>(null);
  const [selectedGroupForUpload, setSelectedGroupForUpload] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [professorAssignments, setProfessorAssignments] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchProfessors();
    fetchGroupsAndSubjects();
  }, []);

  const fetchProfessors = async () => {
    try {
      const response = await api.get("/users/role/professor");
      setProfessors(response.data);
    } catch (error) {
      console.error("Error al obtener profesores:", error);
    }
  };

  const fetchGroupsAndSubjects = async () => {
    try {
      const [groupsResponse, subjectsResponse] = await Promise.all([
        api.get("/groups"),
        api.get("/subjects"),
      ]);
      setGroups(groupsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
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

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProfessor(null);
    setProfessorAssignments([]);
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Profesores y Estudiantes
        </Typography>

        {/* Botón para abrir el modal de manejo de asignaciones */}
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={handleOpenModal}
        >
          Manejo de Asignaciones
        </Button>

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

export default StudentsPage;