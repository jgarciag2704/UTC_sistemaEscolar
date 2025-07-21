import React, { useState } from 'react';

export default function ResetPassword({ onPasswordReset }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const userRes = await fetch('http://localhost:3001/api/me', { credentials: 'include' });
        if (!userRes.ok) throw new Error('Error al obtener datos del usuario');
        const userData = await userRes.json();

        onPasswordReset(userData.user); // Actualiza estado usuario en App
      } else {
        setError('Error al actualizar la contraseña');
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    }
  };

  return (
    <div className="container my-5">
      <h2>Restablecer Contraseña</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label">Nueva Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Cambiar contraseña
      </button>
    </div>
  );
}
