import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import api from "../../utils/api";
import DashELayout from "../Layout/DashELayout";
import theme from "../../theme";

// Tipos de datos (ajusta según tu modelo)
interface Group {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

const SubjectGroup: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "success" });

  // Estados para listas
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Estados para los modales
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // Identificamos si es un "group" o "subject" el que vamos a editar/eliminar
  const [editType, setEditType] = useState<"group" | "subject">("group");
  const [deleteType, setDeleteType] = useState<"group" | "subject">("group");

  // Guardamos la información del elemento seleccionado
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");

  // ------------------------------------------
  //   Cargar datos (simulación o fetch real)
  // ------------------------------------------
  useEffect(() => {
    // Ejemplo: obtén grupos y materias de la API
    // Ajusta según tu backend.
    const fetchData = async () => {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          api.get("/groups"),    // GET /groups
          api.get("/subjects"),  // GET /subjects
        ]);
        setGroups(groupsRes.data);      // Array de grupos
        setSubjects(subjectsRes.data);  // Array de materias
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  // ------------------------------------------
  //   Crear grupo
  // ------------------------------------------
  const handleAddGroup = async () => {
    if (!groupName.trim()) {
      setMessage({ text: "El nombre del grupo es obligatorio", type: "error" });
      return;
    }

    try {
      const response = await api.post("/groups", { name: groupName });
      setMessage({ text: "Grupo agregado con éxito", type: "success" });
      setGroupName("");

      // Actualiza la lista de grupos en el estado
      setGroups((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error al agregar grupo:", error);
      setMessage({ text: "Error al agregar grupo", type: "error" });
    }
  };

  // ------------------------------------------
  //   Crear materia
  // ------------------------------------------
  const handleAddSubject = async () => {
    if (!subjectName.trim()) {
      setMessage({ text: "El nombre de la materia es obligatorio", type: "error" });
      return;
    }

    try {
      const response = await api.post("/subjects", { name: subjectName });
      setMessage({ text: "Materia agregada con éxito", type: "success" });
      setSubjectName("");

      // Actualiza la lista de materias en el estado
      setSubjects((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error al agregar materia:", error);
      setMessage({ text: "Error al agregar materia", type: "error" });
    }
  };

  // ------------------------------------------
  //   Abrir modal de editar
  // ------------------------------------------
  const handleOpenEditModal = (type: "group" | "subject", id: number, name: string) => {
    setEditType(type);
    setSelectedItemId(id);
    setSelectedItemName(name);
    setOpenEditModal(true);
  };

  // ------------------------------------------
  //   Confirmar edición
  // ------------------------------------------
  const handleConfirmEdit = async () => {
    if (!selectedItemId || !selectedItemName.trim()) {
      setMessage({ text: "El nombre es obligatorio", type: "error" });
      return;
    }

    try {
      // Llamada a la API para editar
      const endpoint = editType === "group" ? `/groups/${selectedItemId}` : `/subjects/${selectedItemId}`;
      const response = await api.patch(endpoint, { name: selectedItemName });

      setMessage({ text: `${editType === "group" ? "Grupo" : "Materia"} actualizado con éxito`, type: "success" });
      setOpenEditModal(false);

      // Actualiza la lista local
      if (editType === "group") {
        setGroups((prev) =>
          prev.map((g) => (g.id === selectedItemId ? { ...g, name: selectedItemName } : g))
        );
      } else {
        setSubjects((prev) =>
          prev.map((s) => (s.id === selectedItemId ? { ...s, name: selectedItemName } : s))
        );
      }
    } catch (error) {
      console.error("Error al editar:", error);
      setMessage({ text: "Error al editar", type: "error" });
    }
  };

  // ------------------------------------------
  //   Abrir modal de eliminar
  // ------------------------------------------
  const handleOpenDeleteModal = (type: "group" | "subject", id: number, name: string) => {
    setDeleteType(type);
    setSelectedItemId(id);
    setSelectedItemName(name);
    setOpenDeleteModal(true);
  };

  // ------------------------------------------
  //   Confirmar eliminación
  // ------------------------------------------
  const handleConfirmDelete = async () => {
    if (!selectedItemId) return;

    try {
      // Llamada a la API para eliminar
      const endpoint = deleteType === "group" ? `/groups/${selectedItemId}` : `/subjects/${selectedItemId}`;
      await api.delete(endpoint);

      setMessage({ text: `${deleteType === "group" ? "Grupo" : "Materia"} eliminado con éxito`, type: "success" });
      setOpenDeleteModal(false);

      // Actualiza la lista local
      if (deleteType === "group") {
        setGroups((prev) => prev.filter((g) => g.id !== selectedItemId));
      } else {
        setSubjects((prev) => prev.filter((s) => s.id !== selectedItemId));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMessage({ text: "Error al eliminar", type: "error" });
    }
  };

  // ------------------------------------------
  //   Render del componente
  // ------------------------------------------
  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Materias y Grupos
        </Typography>

        {/* -------------------------------
            FORMULARIO PARA AGREGAR GRUPOS
        ------------------------------- */}
        <Paper sx={{ p: 3, bgcolor: theme.colors.card, mb: 3, borderRadius: "10px" }}>
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

        {/* -------------------------------
            FORMULARIO PARA AGREGAR MATERIAS
        ------------------------------- */}
        <Paper sx={{ p: 3, bgcolor: theme.colors.card, borderRadius: "10px" }}>
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

        {/* ----------------------------------
            LISTA DE GRUPOS
        ---------------------------------- */}
        <Typography variant="h6" sx={{ mt: 4 }} color={theme.colors.primary}>
          Listado de Grupos
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.name}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={() => handleOpenEditModal("group", g.id, g.name)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteModal("group", g.id, g.name)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ----------------------------------
            LISTA DE MATERIAS
        ---------------------------------- */}
        <Typography variant="h6" sx={{ mt: 4 }} color={theme.colors.primary}>
          Listado de Materias
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={() => handleOpenEditModal("subject", s.id, s.name)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteModal("subject", s.id, s.name)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* -------------------------------
            MODAL PARA EDITAR
        ------------------------------- */}
        <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
          <DialogTitle>Editar {editType === "group" ? "Grupo" : "Materia"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nuevo nombre"
              fullWidth
              variant="outlined"
              value={selectedItemName}
              onChange={(e) => setSelectedItemName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleConfirmEdit}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* -------------------------------
            MODAL PARA ELIMINAR
        ------------------------------- */}
        <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
          <DialogTitle>Eliminar {deleteType === "group" ? "Grupo" : "Materia"}</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{selectedItemName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* -------------------------------
            SNACKBAR PARA MENSAJES
        ------------------------------- */}
        <Snackbar
          open={Boolean(message.text)}
          autoHideDuration={3000}
          onClose={() => setMessage({ text: "", type: "success" })}
        >
          <Alert severity={message.type === "error" ? "error" : "success"} sx={{ width: "100%" }}>
            {message.text}
          </Alert>
        </Snackbar>
      </Box>
    </DashELayout>
  );
};

export default SubjectGroup;
