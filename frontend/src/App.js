import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AccessCards from './components/AccessCards';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Login from './Login';
import Register from './Register';
import Usuarios from './Usuarios';
import ResetPassword from './ResetPassword';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false); // nuevo estado

  // Obtener usuario al iniciar y actualizar localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetch('http://localhost:3001/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('No autenticado');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  // Sincronizar showResetPassword cuando cambia user
  useEffect(() => {
    if (user && user.changePassword === true) {
      setShowResetPassword(true);
    } else {
      setShowResetPassword(false);
    }
  }, [user]);

  const handleLoginSuccess = (userData = null) => {
    if (userData) {
      console.log('Login success - userData:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      fetch('http://localhost:3001/api/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        })
        .catch(() => setUser(null));
    }
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    fetch('http://localhost:3001/api/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setUser(null);
      localStorage.removeItem('user');
      setShowUsuarios(false);
      setShowLogin(false);
      setShowRegister(false);
      setShowResetPassword(false);
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

  if (loadingUser) {
    return <div className="container my-5 text-center">Cargando...</div>;
  }

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
        {showResetPassword ? (
          <ResetPassword onPasswordReset={handleLoginSuccess} />
        ) : (
          <>
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

            {showRegister && (!user || Object.keys(user).length === 0) && (
              <Register
                onRegistered={handleLoginSuccess}
                onCancel={() => setShowRegister(false)}
              />
            )}

            {!showLogin && !showRegister && !showUsuarios && !user && <HeroCarousel />}

            {user && !showLogin && !showRegister && !showUsuarios && (
              <>
                <AccessCards />
                <Banner />
                <Footer />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
