import express from 'express'
import ligasRouter from './routes/ligas.routes.js'
import equiposRouter from './routes/equipos.routes.js'
import categoriasRouter from './routes/categorias.routes.js'
import usuariosRouter from './routes/usuarios.routes.js'

const app = express()
const PORT = 3000

// Middleware para leer JSON
app.use(express.json())

// Registrar rutas
app.use('/ligas', ligasRouter)
app.use('/equipos', equiposRouter)
app.use('/categorias', categoriasRouter)
app.use('/usuarios', usuariosRouter)

// Endpoint de prueba
app.get('/ping', (req, res) => {
  res.json({ message: 'pong 🏓' })
})

app.get('/', (req, res) => {
  res.json({ message: 'API De la Paz funcionando 😎🚀' })
})

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`)
})
