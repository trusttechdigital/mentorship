import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import StaffProfiles from './pages/StaffProfiles/StaffProfiles';
import Mentees from './pages/Mentees/Mentees'; // Use full CRUD version
import Documents from './pages/Documents/Documents';
import Receipts from './pages/Receipts/Receipts';
import Invoices from './pages/Invoices/Invoices';
import Inventory from './pages/Inventory/Inventory'; // Use full CRUD version
import ProtectedRoute from './components/UI/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="staff" element={<StaffProfiles />} />
            <Route path="mentees" element={<Mentees />} />
            <Route path="documents" element={<Documents />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="stock" element={<Inventory />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;