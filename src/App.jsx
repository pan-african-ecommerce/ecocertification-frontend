import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ConsentForm from './components/auth/ConsentForm';
import Verify from './components/public/Verify';
import Landing from './components/public/Landing';
import Certified from './components/public/Certified';
import Privacy from './components/public/Privacy';
import About from './components/public/About';
import Schemes_ from './components/public/Schemes';
import Operators from './components/public/Operators';
import StaffInfo from './components/public/Staff';

import ClientDashboard from './components/client/Dashboard';
import ClientFarmers from './components/client/Farmers';
import ClientApplication from './components/client/ApplicationDetail';
import InspectorDashboard from './components/inspector/Dashboard';
import InspectionWorkspace from './components/inspector/InspectionWorkspace';
import VerifierDashboard from './components/verifier/Dashboard';
import ManagerDashboard from './components/manager/Dashboard';
import StaffApplication from './components/staff/ApplicationView';
import Certificates from './components/manager/Certificates';
import StaffAdmin from './components/manager/Staff';
import Schemes from './components/manager/Schemes';
import AuditLog from './components/manager/AuditLog';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50"><Header /><main>{children}</main></div>
);

const Home = () => {
  const { user } = useAuth();
  switch (user?.user_type) {
    case 'inspector': return <InspectorDashboard />;
    case 'verifier': return <VerifierDashboard />;
    case 'manager':
    case 'admin': return <ManagerDashboard />;
    default: return <ClientDashboard />;
  }
};

const ApplicationRouter = () => {
  const { isClient } = useAuth();
  return isClient ? <ClientApplication /> : <StaffApplication />;
};

const guard = (el, types) => (
  <ProtectedRoute allowedTypes={types}><Layout>{el}</Layout></ProtectedRoute>
);

const AuthOnly = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/certified" element={<Certified />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/schemes" element={<Schemes_ />} />
      <Route path="/operators" element={<Operators />} />
      <Route path="/staff" element={<StaffInfo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/consent" element={<AuthOnly><ConsentForm /></AuthOnly>} />

      <Route path="/dashboard" element={guard(<Home />)} />
      <Route path="/farmers" element={guard(<ClientFarmers />, ['client'])} />
      <Route path="/applications/:id" element={guard(<ApplicationRouter />)} />
      <Route path="/inspections/:id" element={guard(<InspectionWorkspace />, ['inspector'])} />
      <Route path="/manager/certificates" element={guard(<Certificates />, ['manager', 'admin'])} />
      <Route path="/manager/staff" element={guard(<StaffAdmin />, ['manager', 'admin'])} />
      <Route path="/manager/schemes" element={guard(<Schemes />, ['manager', 'admin'])} />
      <Route path="/manager/audit" element={guard(<AuditLog />, ['manager', 'admin'])} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={4000} />
      </AuthProvider>
    </Router>
  );
}
