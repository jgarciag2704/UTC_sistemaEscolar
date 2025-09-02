import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AccessCards from './components/AccessCards';
import Banner from './components/Banner';
import Footer from './components/Footer';

import Login from './Login';
import Register from './Register';
import Usuarios from './Usuarios';
import ResetPassword from './ResetPassword';
import Materias from './Materias';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/session', {
          credentials: 'include',
        });
        setIsAuthenticated(res.ok);
      } catch (err) {
        console.error('Error verificando sesión:', err);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  // Al iniciar sesión
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroCarousel />
                <AccessCards />
                <Banner />
                <Footer />
              </>
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />

          <Route
            path="/register"
            element={<Register onRegistered={() => window.location.href = "/"} />}
          />

          {/* Rutas adicionales */}
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/materias" element={<Materias />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
