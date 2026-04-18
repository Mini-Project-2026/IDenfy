import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import StudentPage from "./pages/StudentPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
          <Toaster />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <StudentPage />
                </ProtectedRoute>
              } 
            />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
