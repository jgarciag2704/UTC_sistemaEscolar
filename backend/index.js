import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; // para leer cookies
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

// CORS con credenciales para cookies
app.use(cors({
  origin: 'http://localhost:3000', // origen frontend React
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta';

// Ruta pública
app.get('/', (req, res) => {
  res.send('<h1>Sistema Escolar API</h1><p>Funciona correctamente 🚀</p>');
});

// Obtener carreras (pública)
app.get('/api/carreras', async (req, res) => {
  try {
    const { data, error } = await supabase.from('carreras').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error al obtener carreras:', err);
    res.status(500).json({ error: 'Error al obtener carreras' });
  }
});

// Función para registrar usuario (reutilizable)
async function registrarUsuario(req, res) {
  try {
    const { nombre, apellido1, apellido2, email, password, rol, carrera_id, direccion, telefono } = req.body;

    if (!nombre || !apellido1 || !email || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Si no envían password, usar 'Temporal1' por defecto
    const plainPassword = password && password.trim() !== '' ? password : 'Temporal1';

    // Verificar si ya existe el usuario
    const { data: existingUser, error: findError } = await supabase
      .from('usuarios')
      .select('matricula')
      .eq('email', email)
      .maybeSingle();

    if (findError) throw findError;
    if (existingUser) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hashed = await bcrypt.hash(plainPassword, 10);
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
        activo: 1,
        ultimo_inicio: null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.json({
      message: 'Usuario creado exitosamente',
      usuario: { matricula: data.matricula, nombre: data.nombre, email: data.email },
      passwordDefault: plainPassword,
    });
  } catch (err) {
    console.error('🛑 Registro error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

// Registrar usuario (ruta original)
app.post('/api/register', registrarUsuario);

// Registrar usuario (nueva ruta)
app.post('/api/usuarios', registrarUsuario);

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const { data: user, error: findError } = await supabase
      .from('usuarios')
      .select('matricula, nombre, contrasena, rol, email, ultimo_inicio')
      .eq('email', email)
      .maybeSingle();

    if (findError) throw findError;
    if (!user) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const token = jwt.sign(
      {
        matricula: user.matricula,
        nombre: user.nombre,
        rol: user.rol,
        email: user.email,
        ultimo_inicio: user.ultimo_inicio || null,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    // Si no ha iniciado sesión antes (primer inicio), pedir cambio de contraseña
    if (!user.ultimo_inicio) {
      return res.status(200).json({ message: 'Debe cambiar su contraseña', changePassword: true });
    }

    // Si ya tenía inicio previo, actualizamos la fecha
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ ultimo_inicio: new Date().toISOString() })
      .eq('email', email);

    if (updateError) {
      console.error('⚠️ Error al actualizar último inicio de sesión:', updateError);
    }

    return res.json({ message: 'Login exitoso', changePassword: false });
  } catch (err) {
    console.error('🛑 Login error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

app.post('/api/reset-password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Contraseña obligatoria' });

    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('usuarios')
      .update({
        contrasena: hashed,
        ultimo_inicio: new Date().toISOString(),
        usuario_rest_cont: req.user.matricula,
      })
      .eq('matricula', req.user.matricula);

    if (error) {
      console.error('❌ Error al restablecer contraseña:', error);
      return res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('🛑 Error general al restablecer contraseña:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

// Middleware para validar token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Verificar sesión
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logout exitoso' });
});

// Listar usuarios (protegido)
app.get('/api/usuarios', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('matricula, nombre, apellido1, apellido2, email, rol, carrera_id, telefono, direccion');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar usuario por matricula (protegido)
app.put('/api/usuarios/:matricula', authenticateToken, async (req, res) => {
  try {
    const matriculaParam = req.params.matricula;

    const {
      nombre,
      apellido1,
      apellido2,
      telefono,
      direccion,
      carrera_id,
      rol,
      password,
    } = req.body;

    const esAdmin = req.user.rol === 'admin' || req.user.rol === 1 || req.user.rol === '1';

    if (!esAdmin && req.user.matricula !== matriculaParam) {
      return res.status(403).json({ error: 'No autorizado para actualizar este usuario' });
    }

    const updateData = {
      nombre,
      apellido1,
      apellido2,
      telefono,
      direccion,
      carrera_id,
      rol,
    };

    if (password && password.trim() !== '') {
      updateData.contrasena = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('matricula', matriculaParam)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Usuario actualizado correctamente', usuario: data });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

// Eliminar usuario por matricula (protegido)
app.delete('/api/usuarios/:matricula', authenticateToken, async (req, res) => {
  try {
    const matriculaParam = req.params.matricula;

    const esAdmin = req.user.rol === 'admin' || req.user.rol === 1 || req.user.rol === '1';

    if (!esAdmin) {
      return res.status(403).json({ error: 'No autorizado para eliminar usuarios' });
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('matricula', matriculaParam);

    if (error) throw error;

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

// Obtener roles (pública)
app.get('/api/roles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('rol_id, nombre')
      .order('rol_id');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});



// Materias
// Listar todas las materias (protegido)
app.get('/api/materias', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('materias')
      .select('materia_id, nombre_materia, carrera_id, tipo')
      .order('nombre_materia');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error al obtener materias:', err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

// Obtener materia por ID (protegido)
app.get('/api/materias/:materia_id', authenticateToken, async (req, res) => {
  try {
    const materia_id = req.params.materia_id;

    const { data, error } = await supabase
      .from('materias')
      .select('materia_id, nombre_materia, carrera_id, tipo')
      .eq('materia_id', materia_id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Materia no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error al obtener materia:', err);
    res.status(500).json({ error: 'Error al obtener materia' });
  }
});

// Crear materia (protegido)
app.post('/api/materias', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 1 && req.user.rol !== '1') {
      return res.status(403).json({ error: 'No autorizado para crear materias' });
    }

    const { materia_id, nombre_materia, carrera_id, tipo } = req.body;

    if (!materia_id || !nombre_materia || !carrera_id || !tipo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const { data, error } = await supabase
      .from('materias')
      .insert({ materia_id, nombre_materia, carrera_id, tipo })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Materia creada exitosamente', materia: data });
  } catch (err) {
    console.error('Error al crear materia:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});


// Actualizar materia (protegido)
app.put('/api/materias/:materia_id', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 1 && req.user.rol !== '1') {
      return res.status(403).json({ error: 'No autorizado para actualizar materias' });
    }

    const materia_id = req.params.materia_id;
    const { nombre_materia, carrera_id, tipo } = req.body;

    const updateData = {};
    if (nombre_materia) updateData.nombre_materia = nombre_materia;
    if (carrera_id) updateData.carrera_id = carrera_id;
    if (tipo) updateData.tipo = tipo;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const { data, error } = await supabase
      .from('materias')
      .update(updateData)
      .eq('materia_id', materia_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Materia no encontrada' });

    res.json({ message: 'Materia actualizada correctamente', materia: data });
  } catch (err) {
    console.error('Error al actualizar materia:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

// Eliminar materia (protegido)
app.delete('/api/materias/:materia_id', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 1 && req.user.rol !== '1') {
      return res.status(403).json({ error: 'No autorizado para eliminar materias' });
    }

    const materia_id = req.params.materia_id;

    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('materia_id', materia_id);

    if (error) throw error;

    res.json({ message: 'Materia eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar materia:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend escuchando en http://localhost:${PORT}`));
