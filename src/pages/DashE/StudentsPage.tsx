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
import { Delete } from "@mui/icons-material";
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

  const handleAssign = async () => {
    if (!selectedProfessor || !selectedGroupForAssignment || !selectedSubject) {
      alert("Por favor, selecciona profesor, grupo y materia.");
      return;
    }

    try {
      await api.post("/assignments", {
        user_id: selectedProfessor,
        group_id: selectedGroupForAssignment,
        subject_id: selectedSubject,
      });
      alert("Asignación realizada con éxito.");
    } catch (error) {
      console.error("Error al asignar:", error);
      alert("Error al realizar la asignación.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo.");
      return;
    }

    if (!selectedGroupForUpload) {
      alert("Por favor, selecciona un grupo antes de subir el archivo.");
      return;
    }

    try {
      await api.post("/upload", { data: previewData, groupId: selectedGroupForUpload });
      alert("Archivo subido con éxito.");
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error al subir el archivo.");
    }
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Profesores y Estudiantes
        </Typography>
 {/* Botón para abrir modal de manejo de asignaciones */}
 <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={() => setOpenModal(true)}
        >
          Manejo de Asignaciones</Button>
        {/* Asignar Profesor a Grupo y Materia */}
        <Typography variant="h6" sx={{ mt: 3 }} color={theme.colors.primary}>
          Asignar Profesor a Grupo y Materia
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Profesor</InputLabel>
          <Select
            value={selectedProfessor ?? ""}
            onChange={(e) => setSelectedProfessor(Number(e.target.value))}
            sx={{
              bgcolor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            {professors.map((professor) => (
              <MenuItem key={professor.id} value={professor.id}>
                {professor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Grupo</InputLabel>
          <Select
            value={selectedGroupForAssignment ?? ""}
            onChange={(e) => setSelectedGroupForAssignment(Number(e.target.value))}
            sx={{
              bgcolor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" sx={{ mt: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }} onClick={handleAssign}>
          Asignar Materia y Grupo
        </Button>
 {/* Modal para manejo de asignaciones */}
 <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
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

            {selectedProfessor && (
              <Table sx={{ mt: 3, bgcolor: theme.colors.card }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.colors.text }}>Grupo</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>Materia</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>Acciones</TableCell>
        {/* Subir Lista de Alumnos */}
        <Typography variant="h6" sx={{ mt: 4 }} color={theme.colors.primary}>
          Subir Lista de Alumnos
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: theme.colors.text }}>Grupo para Subida</InputLabel>
          <Select
            value={selectedGroupForUpload ?? ""}
            onChange={(e) => setSelectedGroupForUpload(Number(e.target.value))}
            sx={{
              bgcolor: theme.colors.card,
              color: theme.colors.text,
            }}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ color: theme.colors.text }} />
        </Box>

        {previewData.length > 0 && (
          <Box component={Paper} sx={{ mt: 4, p: 2, maxHeight: 300, overflowY: "auto", bgcolor: theme.colors.card }}>
            <Typography variant="h6" color={theme.colors.primary}>
              Vista Previa de la Lista
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: theme.colors.text }}>Matrícula</TableCell>
                  <TableCell sx={{ color: theme.colors.text }}>Nombre</TableCell>
                  <TableCell sx={{ color: theme.colors.text }}>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: theme.colors.text }}>{student.matricula}</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>{student.name}</TableCell>
                    <TableCell sx={{ color: theme.colors.text }}>{student.email || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Button variant="contained" sx={{ mt: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }} onClick={handleUpload} disabled={!file}>
          Subir Archivo
        </Button>
      </Box>
    </DashELayout>
  );
};

export default StudentsPage;
