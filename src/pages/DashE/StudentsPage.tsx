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
import api from "../../utils/api";
import * as XLSX from "xlsx";
import DashELayout from "../Layout/DashELayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import { Delete } from "@mui/icons-material";
import theme from "../../theme";

const StudentsPage: React.FC = () => {
  const isAdmin = useAdminAuth();
  if (!isAdmin) return null;

  // Estados generales
  const [professors, setProfessors] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Estados para asignación de materias y grupos
  const [selectedProfessorForAssignment, setSelectedProfessorForAssignment] = useState<number | null>(null);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  // Estados para la subida de alumnos
  const [selectedGroupForUpload, setSelectedGroupForUpload] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [professorAssignments, setProfessorAssignments] = useState<any[]>([]);
  const [selectedProfessorForModal, setSelectedProfessorForModal] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [professorsResponse, groupsResponse, subjectsResponse] = await Promise.all([
          api.get("/users/role/professor"),
          api.get("/groups"),
          api.get("/subjects"),
        ]);
        setProfessors(professorsResponse.data);
        setGroups(groupsResponse.data);
        setSubjects(subjectsResponse.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const fetchProfessorAssignments = async (professorId: number) => {
    setSelectedProfessorForModal(professorId);
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
      if (selectedProfessorForModal) fetchProfessorAssignments(selectedProfessorForModal);
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedProfessorForAssignment || !selectedGroupForAssignment || !selectedSubject) {
      alert("Por favor, selecciona profesor, grupo y materia.");
      return;
    }

    try {
      await api.post("/assignments", {
        user_id: selectedProfessorForAssignment,
        group_id: selectedGroupForAssignment,
        subject_id: selectedSubject,
      });
      alert("Asignación realizada con éxito.");
    } catch (error) {
      console.error("Error al asignar:", error);
      alert("Error al realizar la asignación.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        setPreviewData(jsonData);
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Profesores y Estudiantes
        </Typography>

        {/* Botón para abrir modal */}
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={() => setOpenModal(true)}
        >
          Manejo de Asignaciones
        </Button>

        {/* Asignación de Profesor a Materia y Grupo */}
        <Typography variant="h6" sx={{ mt: 3 }} color={theme.colors.primary}>
          Asignar Profesor a Grupo y Materia
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Profesor</InputLabel>
          <Select value={selectedProfessorForAssignment ?? ""} onChange={(e) => setSelectedProfessorForAssignment(Number(e.target.value))}>
            {professors.map((professor) => (
              <MenuItem key={professor.id} value={professor.id}>{professor.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Grupo</InputLabel>
          <Select value={selectedGroupForAssignment ?? ""} onChange={(e) => setSelectedGroupForAssignment(Number(e.target.value))}>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Materia</InputLabel>
          <Select value={selectedSubject ?? ""} onChange={(e) => setSelectedSubject(Number(e.target.value))}>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" sx={{ mt: 2, bgcolor: theme.colors.primary }} onClick={handleAssign}>
          Asignar Materia y Grupo
        </Button>

        {/* Modal de Asignaciones */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
          <DialogTitle>Manejo de Asignaciones</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Seleccionar Profesor</InputLabel>
              <Select value={selectedProfessorForModal ?? ""} onChange={(e) => fetchProfessorAssignments(Number(e.target.value))}>
                {professors.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>{professor.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProfessorForModal && (
              <Table sx={{ mt: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Grupo</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {professorAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.group_name}</TableCell>
                      <TableCell>{assignment.subject_name}</TableCell>
                      <TableCell><IconButton onClick={() => handleDelete(assignment.id)}><Delete /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </DashELayout>
  );
};

export default StudentsPage;
