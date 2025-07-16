import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta';

app.get('/', (req, res) => {
  res.send('<h1>Sistema Escolar API</h1><p>Funciona correctamente 🚀</p>');
});

/** Registro */
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, apellido1, apellido2, email, password, rol, carrera_id, direccion, telefono } = req.body;

    if (!nombre || !apellido1 || !email || !password || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const { data: existingUser, error: findError } = await supabase
      .from('usuarios')
      .select('matricula')
      .eq('email', email)
      .maybeSingle();

    if (findError) throw findError;
    if (existingUser) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const matricula = uuidv4();

    const { data, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        matricula,
        nombre,
        apellido1,
        apellido2,
        email,
        contrasena: hashed,
        rol,
        carrera_id,
        direccion,
        telefono,
        activo: 1
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.json({
      message: 'Usuario creado exitosamente',
      usuario: { matricula: data.matricula, nombre: data.nombre, email: data.email }
    });
  } catch (err) {
    console.error('🛑 Registro error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

/** Login */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const { data: user, error: findError } = await supabase
      .from('usuarios')
      .select('matricula, nombre, contrasena, rol')
      .eq('email', email)
      .maybeSingle();

    if (findError) throw findError;
    if (!user) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const token = jwt.sign({ matricula: user.matricula, nombre: user.nombre, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ message: 'Login exitoso', token });
  } catch (err) {
    console.error('🛑 Login error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend escuchando en http://localhost:${PORT}`));
