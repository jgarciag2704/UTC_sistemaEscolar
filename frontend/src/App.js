import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AccessCards from './components/AccessCards';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Login from './Login';
import Register from './Register';
import Usuarios from './Usuarios';

function App() {
  const [user, setUser] = useState(null); // objeto usuario o null
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);

  // Al montar, intenta obtener la sesión activa
  useEffect(() => {
    fetch('http://localhost:3001/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('No autenticado');
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  // Al login exitoso, actualiza estado usuario y cierra modales
  const handleLoginSuccess = () => {
    fetch('http://localhost:3001/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
    setShowLogin(false);
    setShowRegister(false);
  };

  // Logout elimina sesión y limpia estados
  const handleLogout = () => {
    fetch('http://localhost:3001/api/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setUser(null);
      setShowUsuarios(false);
      setShowLogin(false);
      setShowRegister(false);
    });
  };

  const handleShowUsuarios = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowUsuarios(true);
  };

  const handleCloseUsuarios = () => {
    setShowUsuarios(false);
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => {
          setShowLogin(true);
          setShowRegister(false);
          setShowUsuarios(false);
        }}
        onRegisterClick={() => {
          setShowRegister(true);
          setShowLogin(false);
          setShowUsuarios(false);
        }}
        onLogout={handleLogout}
        onUsuariosClick={handleShowUsuarios}
      />

      <main>
        {showUsuarios && user && (
          <div className="container my-4">
            <Usuarios />
            <button className="btn btn-secondary mt-3" onClick={handleCloseUsuarios}>
              Volver
            </button>
          </div>
        )}

        {showLogin && !user && (
          <div className="container d-flex justify-content-center my-4">
            <Login
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setShowLogin(false)}
            />
          </div>
        )}

        {showRegister && !user && (
          <Register
            onRegistered={handleLoginSuccess}
            onCancel={() => setShowRegister(false)}
          />
        )}

        {!showLogin && !showRegister && !showUsuarios && !user && <HeroCarousel />}

        {!showLogin && !showRegister && !showUsuarios && user && (
          <>
            <AccessCards />
            <Banner />
            <Footer />
          </>
        )}
      </main>
    </>
  );
}

export default App;
