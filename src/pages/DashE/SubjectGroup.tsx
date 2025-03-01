import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../../utils/api";
import DashELayout from "../Layout/DashELayout";
import theme from "../../theme";

const SubjectGroup: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "success" });

  // 🔹 Función para agregar grupo
  const handleAddGroup = async () => {
    if (!groupName.trim()) {
      setMessage({ text: "El nombre del grupo es obligatorio", type: "error" });
      return;
    }

    try {
      const response = await api.post("/groups", { name: groupName });
      console.log("Grupo agregado:", response.data);
      setMessage({ text: "Grupo agregado con éxito", type: "success" });
      setGroupName("");
    } catch (error) {
      console.error("Error al agregar grupo:", error);
      setMessage({ text: "Error al agregar grupo", type: "error" });
    }
  };

  // 🔹 Función para agregar materia
  const handleAddSubject = async () => {
    if (!subjectName.trim()) {
      setMessage({ text: "El nombre de la materia es obligatorio", type: "error" });
      return;
    }

    try {
      const response = await api.post("/subjects", { name: subjectName });
      console.log("Materia agregada:", response.data);
      setMessage({ text: "Materia agregada con éxito", type: "success" });
      setSubjectName("");
    } catch (error) {
      console.error("Error al agregar materia:", error);
      setMessage({ text: "Error al agregar materia", type: "error" });
    }
  };

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Materias y Grupos
        </Typography>

        {/* 🔹 Formulario para agregar grupos */}
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

        {/* 🔹 Formulario para agregar materias */}
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

        {/* 🔹 Mensajes de éxito/error */}
        <Snackbar open={Boolean(message.text)} autoHideDuration={3000} onClose={() => setMessage({ text: "", type: "success" })}>
          <Alert severity={message.type === "error" ? "error" : "success"} sx={{ width: "100%" }}>
            {message.text}
          </Alert>
        </Snackbar>
      </Box>
    </DashELayout>
  );
};

export default SubjectGroup;
