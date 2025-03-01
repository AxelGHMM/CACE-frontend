import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, Grid, Typography, Box, Paper, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion"; 
import Swal from "sweetalert2"; // Importamos SweetAlert2
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";
import backgroundImage from "../../assets/fondo.jpg";
import theme from "../../theme";

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await api.post("users/login", data);
      if (response.status === 200) {
        login(response.data.token);
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 404) {
          setErrorMessage("El correo no está registrado.");
        } else if (err.response.status === 401) {
          setErrorMessage("La contraseña es incorrecta.");
        } else {
          setErrorMessage("Error de conexión.");
        }
      } else {
        setErrorMessage("Error de conexión.");
      }
    }
  };

  // 🔹 Función para mostrar la alerta de recuperación de contraseña
  const handleForgotPassword = () => {
    Swal.fire({
      icon: "info",
      title: "Recuperación de contraseña",
      text: "Por favor, contacta al administrador para restablecer tu contraseña.",
      confirmButtonText: "Entendido",
      confirmButtonColor: theme.colors.primary,
      background: theme.colors.card,
      color: theme.colors.text,
    });
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontFamily,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderRadius: "15px",
            padding: "2rem",
            width: "70%",
            height: "auto",
            maxWidth: 400,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            fontFamily: theme.fontFamily,
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold", color: theme.colors.text, fontFamily: theme.fontFamily }}
          >
            Bienvenido a CACE
          </Typography>
          <Typography
            
            sx={{ textAlign: "center", mb: 3, fontStyle: "italic", color: theme.colors.text, fontFamily: theme.fontFamily }}
          >
            "Más control, menos esfuerzo, mejores resultados"
          </Typography>

          <motion.div
            initial={{ x: 0 }}
            animate={errorMessage ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                variant="outlined"
                InputLabelProps={{ style: { color: theme.colors.text, fontFamily: theme.fontFamily } }}
                InputProps={{
                  style: {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                    borderRadius: "10px",
                    fontFamily: theme.fontFamily,
                  },
                }}
                {...register("email", {
                  required: "El correo es obligatorio.",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "El correo no tiene un formato válido.",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                margin="normal"
                fullWidth
                type="password"
                label="Contraseña"
                variant="outlined"
                InputLabelProps={{ style: { color: theme.colors.text, fontFamily: theme.fontFamily } }}
                InputProps={{
                  style: {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                    borderRadius: "10px",
                    fontFamily: theme.fontFamily,
                  },
                }}
                {...register("password", { required: "La contraseña es obligatoria." })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: theme.colors.primary,
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    fontFamily: theme.fontFamily,
                    "&:hover": { backgroundColor: "#06B224" },
                  }}
                >
                  Iniciar Sesión
                </Button>
              </motion.div>

              {/* 🔹 Enlace de "Olvidaste tu contraseña?" */}
              <Typography
                sx={{
                  color: theme.colors.text,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { color: theme.colors.primary },
                  fontSize: "0.9rem",
                  mt: 1,
                }}
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>
          </motion.div>

          <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage(null)}>
            <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: "100%", backgroundColor: theme.colors.error, color: "#fff", fontFamily: theme.fontFamily }}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </Paper>
      </motion.div>
    </Grid>
  );
};

export default LoginPage;
