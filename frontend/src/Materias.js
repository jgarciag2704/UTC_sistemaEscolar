import React, { useState, useEffect } from 'react';

export default function Materias() {
    const [form, setForm] = useState({
        materia_id: '',
        nombre_materia: '',
        carrera_id: '',
        tipo: '',
    });

    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCarreras();
        fetchMaterias();
    }, []);

    const fetchCarreras = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/carreras', { credentials: 'include' });
            const data = await res.json();
            setCarreras(data);
        } catch (err) {
            console.error('Error cargando carreras', err);
        }
    };

    const fetchMaterias = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/materias', { credentials: 'include' });
            if (!res.ok) throw new Error('Error al cargar materias');
            const data = await res.json();
            setMaterias(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar materias');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            materia_id: '',
            nombre_materia: '',
            carrera_id: '',
            tipo: '',
        });
        setEditingId(null);
        setMessage(null);
        setError(null);
    };

    const handleNuevo = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditar = (materia) => {
        setForm({
            materia_id: materia.materia_id,
            nombre_materia: materia.nombre_materia,
            carrera_id: materia.carrera_id,
            tipo: materia.tipo,
        });
        setEditingId(materia.materia_id);
        setShowForm(true);
        setMessage(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            if (editingId) {
                // Actualizar materia
                const res = await fetch(`http://localhost:3001/api/materias/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Error al actualizar materia');
                }
                setMessage('Materia actualizada correctamente');
            } else {
                // Crear materia
                const res = await fetch('http://localhost:3001/api/materias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Error al crear materia');
                }
                setMessage('Materia creada correctamente');
            }
            resetForm();
            setShowForm(false);
            fetchMaterias();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancelar = () => {
        resetForm();
        setShowForm(false);
    };

    const handleEliminar = async (materia_id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta materia? Esta acción no se puede deshacer.')) {
            return;
        }
        try {
            const res = await fetch(`http://localhost:3001/api/materias/${materia_id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Error al eliminar materia');
            }
            setMessage('Materia eliminada correctamente');
            setError(null);
            fetchMaterias();
        } catch (err) {
            setError(err.message);
            setMessage(null);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Materias</h2>
            {!showForm && (
                <>
                    <button className="btn btn-primary mb-3" onClick={handleNuevo}>
                        Registrar Materia
                    </button>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre Materia</th>
                                <th>Carrera</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materias.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        No hay materias
                                    </td>
                                </tr>
                            )}
                            {materias.map((m) => (
                                <tr key={m.materia_id}>
                                    <td>{m.nombre_materia}</td>
                                    <td>{m.carrera_id}</td>
                                    <td>{m.tipo}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(m)}>
                                            Editar
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(m.materia_id)}>
                                            Eliminar
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
                    <h3>{editingId ? 'Editar Materia' : 'Registrar Materia'}</h3>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <label>ID Materia</label>
                            <input
                                type="text"
                                name="materia_id"
                                value={form.materia_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={!!editingId}  // para que no puedas cambiar el ID si estás editando
                            />
                        </div>
                        <div className="mb-2">
                            <label>Nombre Materia</label>
                            <input
                                type="text"
                                name="nombre_materia"
                                value={form.nombre_materia}
                                onChange={handleChange}
                                className="form-control"
                                required
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
                            <label>Tipo</label>
                            <input
                                type="text"
                                name="tipo"
                                value={form.tipo}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ej. Obligatoria, Optativa..."
                                required
                            />
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
