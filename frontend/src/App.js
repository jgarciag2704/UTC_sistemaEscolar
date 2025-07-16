import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AccessCards from './components/AccessCards';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Login from './Login';
import Register from './Register';

function App() {
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleCancelLogin = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogin = (tok) => {
    setToken(tok);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setToken(null);
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      {/* Navbar siempre visible */}
      <Navbar
        token={token}
        onLoginClick={() => {
          setShowLogin(true);
          setShowRegister(false);
        }}
        onRegisterClick={() => {
          setShowRegister(true);
          setShowLogin(false);
        }}
        onLogout={handleLogout}
      />

      <main>
        {!showLogin && !showRegister && <HeroCarousel />}

        {showLogin && !token && (
          <div className="container d-flex justify-content-center my-4">
            <Login onLogin={handleLogin} onCancel={handleCancelLogin} />
          </div>
        )}

        {showRegister && !token && (
          <div className="container d-flex justify-content-center my-4">
            <Register
              onRegistered={() => setShowRegister(false)}
              onCancel={() => setShowRegister(false)}
            />
          </div>
        )}

        {!showLogin && !showRegister && token && (
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
