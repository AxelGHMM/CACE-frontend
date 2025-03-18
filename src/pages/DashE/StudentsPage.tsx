import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
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
  TextField,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../../utils/api";
import * as XLSX from "xlsx";
import DashELayout from "../Layout/DashELayout";
import useAdminAuth from "../../hooks/useAdminAuth";
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

  // Estado para modal de asignaciones
  const [openModal, setOpenModal] = useState(false);
  const [professorAssignments, setProfessorAssignments] = useState<any[]>([]);
  const [selectedProfessorForModal, setSelectedProfessorForModal] = useState<number | null>(null);

  // Estado para Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Estado para modal de consulta de estudiantes (único modal)
  const [openStudentsModal, setOpenStudentsModal] = useState(false);
  const [studentsGrouped, setStudentsGrouped] = useState<Record<string, any[]>>({});

  // Estado para edición inline del estudiante
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      setSnackbar({ open: true, message: "Asignación eliminada con éxito.", severity: "success" });
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      setSnackbar({ open: true, message: "Error al eliminar la asignación.", severity: "error" });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProfessorForModal(null);
    setProfessorAssignments([]);
  };

  const handleAssign = async () => {
    if (!selectedProfessorForAssignment || !selectedGroupForAssignment || !selectedSubject) {
      setSnackbar({ open: true, message: "Por favor, selecciona profesor, grupo y materia.", severity: "error" });
      return;
    }
    try {
      await api.post("/assignments", {
        user_id: selectedProfessorForAssignment,
        group_id: selectedGroupForAssignment,
        subject_id: selectedSubject,
      });
      setSnackbar({ open: true, message: "Asignación realizada con éxito.", severity: "success" });
      setSelectedProfessorForAssignment(null);
      setSelectedGroupForAssignment(null);
      setSelectedSubject(null);
    } catch (error) {
      console.error("Error al asignar:", error);
      setSnackbar({ open: true, message: "Error al realizar la asignación.", severity: "error" });
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

  // Función para obtener los estudiantes agrupados
  const fetchStudentsGrouped = async () => {
    try {
      const response = await api.get("/students");
      setStudentsGrouped(response.data);
    } catch (error) {
      console.error("Error al obtener listas de alumnos:", error);
      setSnackbar({ open: true, message: "Error al obtener listas de alumnos.", severity: "error" });
    }
  };

  // Función para eliminar un estudiante (eliminación lógica)
  const handleDeleteStudent = async (matricula: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este estudiante?")) return;
    try {
      await api.delete(`/students/${matricula}`);
      setSnackbar({ open: true, message: "Estudiante eliminado correctamente.", severity: "success" });
      fetchStudentsGrouped();
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
      setSnackbar({ open: true, message: "Error al eliminar el estudiante.", severity: "error" });
    }
  };

  // Función para guardar la edición inline del estudiante
  const handleSaveEdit = async () => {
    if (!selectedStudent) return;
    try {
      await api.put(`/students/${selectedStudent.matricula}`, {
        name: selectedStudent.name,
        email: selectedStudent.email,
        group_id: selectedStudent.group_id,
      });
      setSnackbar({ open: true, message: "Estudiante actualizado correctamente.", severity: "success" });
      setSelectedStudent(null);
      fetchStudentsGrouped();
    } catch (error) {
      console.error("Error al actualizar estudiante:", error);
      setSnackbar({ open: true, message: "Error al actualizar el estudiante.", severity: "error" });
    }
  };

  // Función auxiliar para obtener el nombre de un grupo a partir del id
  const getGroupName = (groupId: number) => {
    return groups.find((g) => g.id === groupId)?.name || "";
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Profesores y Estudiantes
        </Typography>

        {/* Botón para abrir modal de asignaciones */}
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
          <Select
            value={selectedProfessorForAssignment ?? ""}
            onChange={(e) => setSelectedProfessorForAssignment(Number(e.target.value))}
          >
            {professors.map((professor) => (
              <MenuItem key={professor.id} value={professor.id}>
                {professor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Grupo</InputLabel>
          <Select
            value={selectedGroupForAssignment ?? ""}
            onChange={(e) => setSelectedGroupForAssignment(Number(e.target.value))}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Materia</InputLabel>
          <Select
            value={selectedSubject ?? ""}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" sx={{ mt: 2, bgcolor: theme.colors.primary }} onClick={handleAssign}>
          Asignar Materia y Grupo
        </Button>

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
        <Button
          variant="contained"
          sx={{ mt: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={handleUpload}
          disabled={!file}
        >
          Subir Archivo
        </Button>
        {/* Botón para abrir modal de Listas de Alumnos */}
        <Button
          variant="contained"
          sx={{ mt: 3, ml: 2, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={() => {
            setOpenStudentsModal(true);
            fetchStudentsGrouped();
          }}
        >
          Consultar Listas de Alumnos
        </Button>

        {/* Modal único para consultar, editar y eliminar estudiantes */}
        <Dialog open={openStudentsModal} onClose={() => { setOpenStudentsModal(false); setSelectedStudent(null); }} fullWidth maxWidth="lg">
          <DialogTitle>Listas de Alumnos por Grupo</DialogTitle>
          <DialogContent dividers>
          {Object.keys(studentsGrouped)
  .sort((a, b) => a.localeCompare(b))
  .map((group) => {
    const students = studentsGrouped[group];
    return (
      <Box key={group} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {group} ({students.length} alumno{students.length > 1 ? "s" : ""})
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: theme.colors.text }}>Matrícula</TableCell>
              <TableCell sx={{ color: theme.colors.text }}>Nombre</TableCell>
              <TableCell sx={{ color: theme.colors.text }}>Email</TableCell>
              <TableCell sx={{ color: theme.colors.text }}>Grupo</TableCell>
              <TableCell sx={{ color: theme.colors.text }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.matricula}>
                <TableCell sx={{ color: theme.colors.text }}>{student.matricula}</TableCell>
                <TableCell sx={{ color: theme.colors.text }}>
                  {selectedStudent && selectedStudent.matricula === student.matricula ? (
                    <TextField
                      fullWidth
                      value={selectedStudent.name}
                      onChange={(e) =>
                        setSelectedStudent({ ...selectedStudent, name: e.target.value })
                      }
                    />
                  ) : (
                    student.name
                  )}
                </TableCell>
                <TableCell sx={{ color: theme.colors.text }}>
                  {selectedStudent && selectedStudent.matricula === student.matricula ? (
                    <TextField
                      fullWidth
                      value={selectedStudent.email}
                      onChange={(e) =>
                        setSelectedStudent({ ...selectedStudent, email: e.target.value })
                      }
                    />
                  ) : (
                    student.email || "N/A"
                  )}
                </TableCell>
                <TableCell sx={{ color: theme.colors.text }}>
                  {selectedStudent && selectedStudent.matricula === student.matricula ? (
                    <FormControl fullWidth>
                      <Select
                        value={selectedStudent.group_id}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            group_id: Number(e.target.value),
                          })
                        }
                      >
                        {groups.map((groupOption) => (
                          <MenuItem key={groupOption.id} value={groupOption.id}>
                            {groupOption.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    getGroupName(student.group_id)
                  )}
                </TableCell>
                <TableCell sx={{ color: theme.colors.text }}>
                  {selectedStudent && selectedStudent.matricula === student.matricula ? (
                    <>
                      <Button onClick={handleSaveEdit} variant="contained" sx={{ mr: 1, bgcolor: theme.colors.primary }}>
                        Guardar
                      </Button>
                      <Button onClick={() => setSelectedStudent(null)} variant="outlined">
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => setSelectedStudent(student)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteStudent(student.matricula)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  })}

          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenStudentsModal(false); setSelectedStudent(null); }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para alertas */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashELayout>
  );
};

export default StudentsPage;
