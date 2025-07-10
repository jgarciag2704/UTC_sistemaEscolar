import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function App() {
  const [token, setToken] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      {!token ? (
        <>
          {showRegister ? (
            <>
              <Register onRegistered={() => setShowRegister(false)} />
              <button onClick={() => setShowRegister(false)}>¿Ya tienes cuenta? Inicia sesión</button>
            </>
          ) : (
            <>
              <Login onLogin={setToken} />
              <button onClick={() => setShowRegister(true)}>¿No tienes cuenta? Regístrate</button>
            </>
          )}
        </>
      ) : (
        <div>
          <h2>¡Bienvenido!</h2>
          <button onClick={() => setToken(null)}>Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}
