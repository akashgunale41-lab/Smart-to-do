import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TaskReminder from './components/TaskReminder';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskReminder />
        <div className="min-h-screen flex flex-col bg-slate-100">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
              <Route path="/add-task" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
              <Route path="/edit-task/:id" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 bg-white">
            © {new Date().getFullYear()} SmartDo — Smart To-Do List Management App
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
