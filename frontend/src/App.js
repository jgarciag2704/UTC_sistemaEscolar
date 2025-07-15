// src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AccessCards from './components/AccessCards';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Login from './Login';
import Register from './Register';



//parte de variables globales
//variable para saber en que estado estamos si logeado o no
let var1 = "";

//variable para saber que nivel de usuario es administrador o alumno
let nivel = "";




function App() {



  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Función para manejar el "Cancelar" en Login
  const handleCancelLogin = () => {
    setShowLogin(false);
    setShowRegister(false); // Si también quieres ocultar el registro
  };

  return (
    <>
      <Navbar onLoginClick={() => {
        setShowLogin(true);
        setShowRegister(false);
      }} />

      <main className="">
        {/* Mostrar login */}
        {showLogin && !token && (
          <div className="container d-flex justify-content-center">
            <Login onLogin={(tok) => {
              setToken(tok);
              setShowLogin(false);
            }} onCancel={handleCancelLogin} />
          </div>
        )}

        {/* Mostrar el resto de la web solo si NO estás viendo el login */}
        {!showLogin && (
          <>
            <HeroCarousel />
            <AccessCards />
            <Banner />
            <Footer />
          </>
        )}

        {/* Mostrar registro si se activa */}
        {showRegister && !token && (
          <div className="container d-flex justify-content-center">
            <Register onRegistered={() => setShowRegister(false)} />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
