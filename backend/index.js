import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta'

app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenido al Sistema Escolar</h1>
    <p>Este es el backend API para la gestión de alumnos, maestros y calificaciones.</p>
    <p>Pronto implementaremos más funcionalidades.</p>
  `)
})

// Registro
app.post('/api/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const { data: existingUser, error: findError } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single()

  if (findError === null && existingUser) {
    return res.status(400).json({ error: 'Email ya registrado' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nombre,
      email,
      password: hashedPassword,
      rol_id: rol
    })
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Usuario creado', usuario: { id: data.id, nombre: data.nombre, email: data.email } })
})

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return res.status(400).json({ error: 'Email o contraseña incorrectos' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Email o contraseña incorrectos' })
  }

  const token = jwt.sign({ id: user.id, nombre: user.nombre, rol_id: user.rol_id }, JWT_SECRET, { expiresIn: '8h' })

  res.json({ message: 'Login exitoso', token })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
