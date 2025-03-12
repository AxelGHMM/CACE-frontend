import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
  IconButton,
  Button,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import LogoutIcon from "@mui/icons-material/Logout";
import theme from "../../theme";

const adminSidebarItems = [
  { label: "Inicio", route: "/dashE", icon: <HomeIcon /> },
  { label: "Usuarios", route: "/dashE/users", icon: <PeopleIcon /> },
  { label: "Estudiantes", route: "/dashE/students", icon: <PeopleIcon /> },
  { label: "Academicos", route: "/dashE/subjects-groups", icon: <ClassIcon /> },
];

const drawerWidth = 250;

const DashELayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

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
        color: theme.colors.card,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: "1.2rem", color: theme.colors.card }}>
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
                  color: isActiveTab(route) ? theme.colors.text : "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        onClick={logout}
        sx={{
          bgcolor: theme.colors.sidebar,
          "&:hover": { bgcolor: theme.colors.sidebarHover },
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
      {!mobileOpen && (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            position: "fixed",
            height: "100vh",
            zIndex: 1200,
            bgcolor: theme.colors.sidebar,
            display: { xs: "none", md: "block" },
          }}
        >
          {drawerContent}
        </Box>
      )}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: theme.colors.sidebar,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3, ml: { xs: 0, md: `${drawerWidth}px` }, bgcolor: theme.colors.background }}>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 10,
            left: 10,
            color: "white",
          }}
        >
          <MenuIcon />
        </IconButton>

        {children}
      </Box>

      {navVisible && (
        <BottomNavigation
          sx={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            bgcolor: theme.colors.sidebar,
            display: { xs: "flex", md: "none" },
          }}
          value={location.pathname}
          onChange={(_, newValue) => {
            if (newValue === "logout") {
              logout();
            } else {
              navigate(newValue);
            }
          }}
        >
          {adminSidebarItems.map(({ label, route, icon }) => (
            <BottomNavigationAction
              key={label}
              label={label}
              value={route}
              icon={icon}
              sx={{
                color: theme.colors.secondary,
                "&.Mui-selected": {
                  color: theme.colors.primary,
                },
                "&.Mui-selected .MuiBottomNavigationAction-label": {
                  color: theme.colors.primary,
                },
              }}
            />
          ))}

          {/* Botón de Cerrar Sesión en Bottom Navbar */}
          <BottomNavigationAction
            label="Cerrar Sesión"
            value="logout"
            icon={<LogoutIcon />}
            sx={{
              color: theme.colors.secondary,
              "&.Mui-selected": {
                color: theme.colors.primary,
              },
              "&.Mui-selected .MuiBottomNavigationAction-label": {
                color: theme.colors.primary,
              },
            }}
          />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default DashELayout;
