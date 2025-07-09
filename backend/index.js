import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

app.get('/', (req, res) => {
  res.send('Hola mundo backend')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenido al Sistema Escolar</h1>
    <p>Este es el backend API para la gestión de alumnos, maestros y calificaciones.</p>
    <p>Pronto implementaremos más funcionalidades.</p>
  `)
})
