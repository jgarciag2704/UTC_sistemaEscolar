import React, { useState, useEffect } from 'react';

export default function Register({ onRegistered, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido1: '',
    apellido2: '',
    email: '',
    password: '',
    rol: '2',
    carrera_id: '',
    direccion: '',
    telefono: '',
  });

  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/carreras')
      .then((res) => res.json())
      .then((data) => {
        setCarreras(data);
      })
      .catch((err) => console.error('Error al cargar carreras:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.carrera_id || !carreras.some(c => String(c.carrera_id) === String(form.carrera_id))) {
      setError('Por favor selecciona una carrera válida');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // para cookies HttpOnly
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el registro');

      setSuccess('Registro exitoso.');
      onRegistered(); // avisar al padre para actualizar estado / UI
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    onCancel && onCancel();
  };

  return (
    <section className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5" style={{ minWidth: '340px', maxWidth: '1000px', width: '100%' }}>
        <h2 className="text-center mb-4 text-primary">Crear Cuenta</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="apellido1" className="form-label">Apellido Paterno</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-vcard"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="apellido1"
                  name="apellido1"
                  value={form.apellido1}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="apellido2" className="form-label">Apellido Materno</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-vcard-fill"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="apellido2"
                  name="apellido2"
                  value={form.apellido2}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="email" className="form-label">Correo</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="carrera_id" className="form-label">Carrera</label>
              <div className="input-group">
                <select
                  name="carrera_id"
                  value={form.carrera_id}
                  onChange={handleSelectChange}
                  required
                  className="form-select"
                >
                  <option value="">Selecciona una carrera</option>
                  {carreras.map((c) => (
                    <option key={c.carrera_id} value={c.carrera_id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-8 mb-3">
              <label htmlFor="direccion" className="form-label">Dirección</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">Registrarse</button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </section>
  );
}
