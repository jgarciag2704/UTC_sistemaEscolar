import React, { useState } from 'react';

export default function Login({ onLoginSuccess, onPasswordResetRequired, onCancel }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

onLoginSuccess(data);


    } catch (err) {
      setError(err.message);
    }
  };
  const handleCancel = () => {
    onCancel();
  };

  return (
    <section className="login-section d-flex justify-content-center align-items-center vh-100">
      <div className="login-card p-5 shadow bg-white rounded">
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Usuario</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 m-2">Entrar</button>
          <button
            type="button"
            className="btn btn-danger w-100 m-2"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </form>
      </div>
    </section>
  );
}
