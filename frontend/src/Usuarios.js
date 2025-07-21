import React, { useState, useEffect } from 'react';

export default function Usuarios() {
  // Formulario para crear o editar usuario
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: '',
    direccion: '',
    carrera_id: '',
    rol: '',
  });

  // Listado de usuarios desde backend
  const [usuarios, setUsuarios] = useState([]);

  // Carreras y roles para selects
  const [carreras, setCarreras] = useState([]);
  const [roles, setRoles] = useState([]);

  // Control para mostrar/ocultar formulario (registro/edición)
  const [showForm, setShowForm] = useState(false);

  // Si estamos editando, guardamos el id o identificador del usuario que editamos (por ej. email o matricula)
  const [editingId, setEditingId] = useState(null);

  // Mensajes de éxito o error
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

 useEffect(() => {
  fetchCarreras();
  fetchRoles();
  fetchUsuarios();
}, []);

const fetchCarreras = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/carreras', { credentials: 'include' });
    const data = await res.json();
    setCarreras(data); // Ya trae carrera_id y nombre
  } catch (err) {
    console.error('Error cargando carreras', err);
  }
};

const fetchRoles = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/roles', { credentials: 'include' });
    const data = await res.json();
    setRoles(data); // Ya trae id y nombre
  } catch (err) {
    console.error('Error cargando roles', err);
  }
};


  // Función para obtener usuarios desde backend
  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usuarios', {
        credentials: 'include', // si usas cookies
      });
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios');
    }
  };

  // Cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Limpiar formulario
  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      nombre: '',
      apellido1: '',
      apellido2: '',
      telefono: '',
      direccion: '',
      carrera_id: '',
      rol: '',
    });
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  // Mostrar formulario para registrar nuevo usuario
  const handleNuevoUsuario = () => {
    resetForm();
    setShowForm(true);
  };

  // Cargar usuario para editar
 const handleEditar = (usuario) => {
  setForm({
    email: usuario.email,
    password: '',
    nombre: usuario.nombre,
    apellido1: usuario.apellido1,
    apellido2: usuario.apellido2,
    telefono: usuario.telefono,
    direccion: usuario.direccion,
    carrera_id: usuario.carrera_id,
    rol: usuario.rol,
  });
  setEditingId(usuario.matricula); // usar matrícula para identificar
  setShowForm(true);
  setMessage(null);
  setError(null);
};


  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (editingId) {
        // Actualizar usuario (PUT o PATCH)
        const res = await fetch(`http://localhost:3001/api/usuarios/${editingId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(form),
});

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al actualizar usuario');
        }
        setMessage('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario (POST)
        const res = await fetch('http://localhost:3001/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al crear usuario');
        }
        setMessage('Usuario creado correctamente');
      }

      resetForm();
      setShowForm(false);
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cancelar edición o registro
  const handleCancelar = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="container mt-4">
      <h2>Usuarios</h2>
      {!showForm && (
        <>
          <button className="btn btn-primary mb-3" onClick={handleNuevoUsuario}>
            Registrar Usuario
          </button>

          {error && <div className="alert alert-danger">{error}</div>}

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Apellido 1</th>
                <th>Apellido 2</th>
                <th>Teléfono</th>
                <th>Carrera</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No hay usuarios
                  </td>
                </tr>
              )}
              {usuarios.map((u) => (
  <tr key={u.matricula}>
    <td>{u.email}</td>
    <td>{u.nombre}</td>
    <td>{u.apellido1}</td>
    <td>{u.apellido2}</td>
    <td>{u.telefono}</td>
    <td>{u.carrera_id}</td>
    <td>{u.rol}</td>
    <td>
      <button
        className="btn btn-sm btn-warning"
        onClick={() => handleEditar(u)}
      >
        Editar
      </button>
    </td>
  </tr>
))}

            </tbody>
          </table>
        </>
      )}

      {showForm && (
        <>
          <h3>{editingId ? 'Editar Usuario' : 'Registrar Usuario'}</h3>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                required
                disabled={!!editingId} // no cambiar email al editar
              />
            </div>
            {!editingId ? (
  <div className="mb-3">
    <label>Contraseña</label>
    <p className="form-text">
      La contraseña es <strong>Temporal1</strong>, se le pedirá cambiar contraseña en su próximo inicio de sesión
    </p>
  </div>
) : (
  <div className="mb-2">
    <label>Contraseña <small>(Dejar vacío para no cambiar)</small></label>
    <input
      type="password"
      name="password"
      value={form.password}
      onChange={handleChange}
      className="form-control"
    />
  </div>
)}

            <div className="mb-2">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>Primer Apellido</label>
              <input
                type="text"
                name="apellido1"
                value={form.apellido1}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>Segundo Apellido</label>
              <input
                type="text"
                name="apellido2"
                value={form.apellido2}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Carrera</label>
              <select
  name="carrera_id"
  value={form.carrera_id}
  onChange={handleChange}
  className="form-select"
  required
>
  <option value="">Seleccionar carrera</option>
  {carreras.map((c) => (
    <option key={c.carrera_id} value={c.carrera_id}>
      {c.nombre}
    </option>
  ))}
</select>

            </div>
            <div className="mb-3">
              <label>Rol</label>
              <select
  name="rol"
  value={form.rol}
  onChange={handleChange}
  className="form-select"
  required
>
  <option value="">Seleccionar rol</option>
  {roles.map((r) => (
    <option key={r.rol_id} value={r.rol_id}>
      {r.nombre}
    </option>
  ))}
</select>

            </div>
            <button type="submit" className="btn btn-primary me-2">
              {editingId ? 'Actualizar' : 'Registrar'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
