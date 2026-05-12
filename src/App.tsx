import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Tactics from './pages/Tactics';
import Plays from './pages/Plays';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import TacticalBoard from './pages/TacticalBoard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
          } />
          <Route path="/players" element={
            <PrivateRoute><Layout><Players /></Layout></PrivateRoute>
          } />
          <Route path="/tactics" element={
            <PrivateRoute><Layout><Tactics /></Layout></PrivateRoute>
          } />
          <Route path="/plays" element={
            <PrivateRoute><Layout><Plays /></Layout></PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute><Layout><Reports /></Layout></PrivateRoute>
          } />
          <Route path="/board" element={
            <PrivateRoute><Layout><TacticalBoard /></Layout></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;