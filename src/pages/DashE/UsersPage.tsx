import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import api from "../../utils/api";
import DashELayout from "../Layout/DashELayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import theme from "../../theme";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UsersPage = () => {
  const isAdmin = useAdminAuth();
  if (!isAdmin) return null;

  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<{ 
    id: string | null; 
    name: string; 
    email: string; 
    role: string; 
    password: string; 
  }>({
    id: null,
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleOpen = (user: Partial<User> = {}) => {
    setFormData({
      id: user.id || null, 
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      password: "", 
    });
    setEditMode(!!user.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const { id, password, ...data } = formData;

      if (editMode) {
        await api.put(`/users/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/users/register", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Error saving user", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        const token = sessionStorage.getItem("token");
        await api.delete(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user", error);
      }
    }
  };

  return (
    <DashELayout>
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: "100vh", p: 4, bgcolor: theme.colors.background, color: theme.colors.text }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Gestión de Usuarios
        </Typography>

        <Button
          variant="contained"
          sx={{ bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
          onClick={() => handleOpen()}
        >
          Crear Usuario
        </Button>

        <TableContainer component={Paper} sx={{ mt: 2, bgcolor: theme.colors.card, flexGrow: 1, borderRadius: "10px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: theme.colors.text }}>Nombre</TableCell>
                <TableCell sx={{ color: theme.colors.text }}>Email</TableCell>
                <TableCell sx={{ color: theme.colors.text }}>Rol</TableCell>
                <TableCell sx={{ color: theme.colors.text }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ color: theme.colors.text }}>{user.name}</TableCell>
                  <TableCell sx={{ color: theme.colors.text }}>{user.email}</TableCell>
                  <TableCell sx={{ color: theme.colors.text }}>{user.role}</TableCell>
                  <TableCell>
                    <IconButton sx={{ color: theme.colors.primary }} onClick={() => handleOpen(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton sx={{ color: "#ff1744" }} onClick={() => handleDelete(user.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: theme.colors.card, color: theme.colors.text } }}>
        <DialogTitle>{editMode ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            name="name"
            label="Nombre"
            value={formData.name}
            onChange={handleInputChange}
            InputLabelProps={{ style: { color: theme.colors.text } }}
            sx={{ input: { color: theme.colors.text }, bgcolor: theme.colors.background }}
          />
          <TextField
            fullWidth
            margin="dense"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            InputLabelProps={{ style: { color: theme.colors.text } }}
            sx={{ input: { color: theme.colors.text }, bgcolor: theme.colors.background }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: theme.colors.text }}>Rol</InputLabel>
            <Select name="role" value={formData.role} onChange={handleSelectChange} sx={{ color: theme.colors.text, bgcolor: theme.colors.background }}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="professor">Profesor</MenuItem>
            </Select>
          </FormControl>

          {!editMode && (
            <TextField
              fullWidth
              margin="dense"
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              InputLabelProps={{ style: { color: theme.colors.text } }}
              sx={{ input: { color: theme.colors.text }, bgcolor: theme.colors.background }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: theme.colors.text }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.secondary } }}
            onClick={handleSubmit}
          >
            {editMode ? "Guardar Cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashELayout>
  );
};

export default UsersPage;
