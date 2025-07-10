import React, { useState } from 'react'

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '2', // por ejemplo rol alumno id = 2
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
  e.preventDefault()
  setError('')
  setSuccess('')

  try {
    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const text = await res.text()  // obtiene el texto crudo (posible HTML o error)
      throw new Error(`Error ${res.status}: ${text}`)
    }

    const data = await res.json()
    setSuccess('Registro exitoso. Ya puedes iniciar sesión.')
    onRegistered && onRegistered()
  } catch (err) {
    setError(err.message)
  }
}


  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>

      {error && <p style={{color:'red'}}>{error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}

      <input
        name="nombre"
        placeholder="Nombre completo"
        value={form.nombre}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Registrarse</button>
    </form>
  )
}
