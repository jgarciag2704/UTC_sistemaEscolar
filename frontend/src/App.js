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

  return (
    <>
     <Navbar
  token={token}
  onLoginClick={() => { setShowLogin(true); setShowRegister(false); }}
  onRegisterClick={() => { setShowRegister(true); setShowLogin(false); }}
  onLogout={() => { setToken(null); setShowLogin(false); setShowRegister(false); }}
/>

      <main>
        {/* Mostrar login */}
        {showLogin && !token && (
          <div className="container d-flex justify-content-center">
            <Login
              onLogin={(tok) => {
                setToken(tok);
                setShowLogin(false);
              }}
              onCancel={handleCancelLogin}
            />
          </div>
        )}

        {/* Mostrar registro */}
        {showRegister && !token && (
  <Register 
    onRegistered={() => setShowRegister(false)} 
    onCancel={() => setShowRegister(false)} 
  />
)}


        {/* Mostrar contenido principal solo si NO estamos en login ni registro */}
       {!showLogin && !showRegister && (
  <>
    <HeroCarousel />
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
