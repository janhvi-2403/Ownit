import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHub from './pages/DashboardHub';
import DocumentViewer from './pages/DocumentViewer';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:qrId" element={<DocumentViewer />} />
        <Route path="/" element={<ProtectedRoute><DashboardHub /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
