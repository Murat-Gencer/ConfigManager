import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ConfigEditor from './pages/ConfigEditor';
import apiService from './api/api';
import { Toaster } from 'react-hot-toast';
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = apiService.auth.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Varsayılan ayarlar
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          // Başarılı toast
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#065f46',
              border: '1px solid #10b981',
            },
          },
          // Hata toast
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#7f1d1d',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <ConfigEditor />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
    </>
  );
}

export default App;