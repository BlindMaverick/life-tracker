import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timesheet from './pages/Timesheet';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Reflection from './pages/Reflection';
import Login from './pages/Login';
import Register from './pages/Register';

function AuthGate() {
  const { token } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!token) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} />
      : <Login onSwitch={() => setShowRegister(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="timesheet" element={<Timesheet />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reflection" element={<Reflection />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  );
}