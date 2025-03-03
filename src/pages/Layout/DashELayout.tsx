import React, { useState } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Drawer, IconButton, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import MenuIcon from "@mui/icons-material/Menu";
import theme from "../../theme"; // ✅ Importamos el nuevo tema

const adminSidebarItems = [
  { label: "Inicio", route: "/dashE" },
  { label: "Usuarios", route: "/dashE/users" },
  { label: "Estudiantes", route: "/dashE/students" },
  { label: "Materias y Grupos", route: "/dashE/subjects-groups" },
];

const drawerWidth = 250;

const DashELayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const isActiveTab = (route: string) => location.pathname === route;
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        bgcolor: theme.colors.sidebar,
        p: 2,
        height: "95%",
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: "1.2rem", color: "#F2F2F2" }}>
        Admin: {user?.name || "Usuario"}
      </Typography>

      <List sx={{ flexGrow: 1 }}>
        {adminSidebarItems.map(({ label, route }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              onClick={() => navigate(route)}
              sx={{
                bgcolor: isActiveTab(route) ? theme.colors.primary : "transparent",
                "&:hover": { bgcolor: theme.colors.sidebarHover },
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <ListItemText 
                primary={label} 
                sx={{ 
                  color: isActiveTab(route) ? "#131515" : "#FFFFFF",
                  fontSize: "1rem", 
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        onClick={logout}
        sx={{
          bgcolor: "#131515",
          "&:hover": { bgcolor: "#2B2C28" },
          borderRadius: "8px",
          color: "white",
          fontWeight: "bold",
          fontSize: "1rem",
          padding: "12px",
          textTransform: "none",
          border: `2px solid ${theme.colors.primary}`,
        }}
        fullWidth
      >
        Cerrar Sesión
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar fijo solo en escritorio */}
      {!mobileOpen && (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            position: "fixed",
            height: "100vh",
            zIndex: 1200,
            bgcolor: theme.colors.sidebar,
            display: { xs: "none", md: "block" }, // 🔹 Solo en escritorio
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Sidebar deslizable en móviles */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" }, // 🔹 Solo en móviles
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: theme.colors.sidebar,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenido Principal */}
      <Box sx={{ flexGrow: 1, p: 3, ml: { xs: 0, md: `${drawerWidth}px` }, bgcolor: theme.colors.background }}>
        {/* Botón de menú en móviles */}
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1300,
            bgcolor: theme.colors.primary,
            color: "white",
            p: 1,
            borderRadius: "8px",
          }}
        >
          <MenuIcon />
        </IconButton>

        {children}
      </Box>
    </Box>
  );
};

export default DashELayout;
