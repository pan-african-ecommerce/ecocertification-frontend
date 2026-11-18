import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import LandingHome from './components/public/LandingHome';
import QuoteWizard from './components/public/QuoteWizard';
import EducationPortal from './components/public/EducationPortal';
import Login from './components/auth/Login';
import InspectorRegister from './components/auth/InspectorRegister';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* THE PUBLIC FRONT PAGE */}
          <Route path="/" element={<LandingHome />} />
          
          {/* OTHER PUBLIC PAGES */}
          <Route path="/quote" element={<QuoteWizard />} />
          <Route path="/education" element={<EducationPortal />} />
          
          {/* LOGIN & REGISTRATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/:actor" element={<Login />} />
          <Route path="/register/inspector" element={<InspectorRegister />} />
          
          {/* IF SOMEONE TYPES A WRONG URL, SEND THEM HOME */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={4000} />
      </AuthProvider>
    </Router>
  );
}