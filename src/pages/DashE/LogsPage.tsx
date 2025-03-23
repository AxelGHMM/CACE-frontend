import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import DashELayout from "../Layout/DashELayout";
import api from "../../utils/api";
import theme from "../../theme";

const logFiles = ["app.log", "combined.log", "error.log", "health.log", "http.log"];

const LogsPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState("app.log");
  const [logContent, setLogContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLog = async (filename: string) => {
    try {
      setLoading(true);
      const res = await api.get(`users/logs/${filename}`);
      setLogContent(res.data.content);
    } catch (err) {
      setLogContent(`⚠️ Error al obtener el log: ${(err as any).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog(selectedFile);
  }, [selectedFile]);

  return (
    <DashELayout>
      <Box sx={{ p: 4, bgcolor: theme.colors.background, color: theme.colors.text, minHeight: "100vh", fontFamily: theme.fontFamily }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color={theme.colors.primary}>
          Visor de Logs
        </Typography>
        <Typography variant="body1" gutterBottom>
          Selecciona un archivo de log para visualizar su contenido.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="select-log-label" sx={{ color: theme.colors.text }}>
                Archivo de log
              </InputLabel>
              <Select
                labelId="select-log-label"
                value={selectedFile}
                label="Archivo de log"
                onChange={(e) => setSelectedFile(e.target.value)}
                sx={{ color: theme.colors.text, bgcolor: theme.colors.card }}
              >
                {logFiles.map((file) => (
                  <MenuItem key={file} value={file}>
                    {file}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: theme.colors.card, color: theme.colors.text }}>
              <CardContent>
                <Typography variant="h6" color={theme.colors.primary} gutterBottom>
                  Contenido de: {selectedFile}
                </Typography>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                    <CircularProgress color="secondary" />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      bgcolor: "#111",
                      color: "#0f0",
                      fontFamily: "monospace",
                      padding: 2,
                      maxHeight: "60vh",
                      overflowY: "auto",
                      borderRadius: "5px",
                      whiteSpace: "pre-wrap",
                      mt: 1,
                    }}
                  >
                    {logContent}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashELayout>
  );
};

export default LogsPage;
