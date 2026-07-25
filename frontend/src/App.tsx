import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashboardPage";
import Patients from "./pages/PatientsPage";
import PatientDetails from "./pages/PatientDetailsPage";
import LiveMonitoring from "./pages/LiveMonitoringPage";
import History from "./pages/HistoryPage";
import Alerts from "./pages/AlertsPage";
import Reports from "./pages/ReportsPage";
import Settings from "./pages/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";
import { useThemeStore } from "./store/theme";
const queryClient = new QueryClient();
function Protected() { return useAuthStore((s) => s.token) ? <DashboardLayout /> : <Navigate to="/login" replace />; }
function ThemeInitializer() { const theme = useThemeStore((s) => s.theme); useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]); return null; }
export default function App() { return <QueryClientProvider client={queryClient}><ThemeInitializer /><BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route element={<Protected />}><Route path="/" element={<Dashboard />} /><Route path="/patients" element={<Patients />} /><Route path="/patients/:id" element={<PatientDetails />} /><Route path="/live" element={<LiveMonitoring />} /><Route path="/history" element={<History />} /><Route path="/alerts" element={<Alerts />} /><Route path="/reports" element={<Reports />} /><Route path="/settings" element={<Settings />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></QueryClientProvider>; }
