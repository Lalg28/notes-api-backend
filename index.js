require('dotenv').config()
require('./mongo')
const express = require('express')
const app = express()
const cors = require('cors')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound.js')
const handleError = require('./middleware/handleError')

app.use(cors())
app.use(express.json())

Sentry.init({
  dsn: 'https://381d238607b6441586682ff6d71a0bfe@o948295.ingest.sentry.io/5897495',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  tracesSampleRate: 1.0
})

// Sentry malwares
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

// Pagina de inicio
app.get('/', (req, response) => {
  response.send('<h1>Hello world</h1>')
})

// Obtener todas las notas
app.get('/api/notes', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes)
  })
})

// Obtener alguna nota por ID
app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id

  Note.findById(id)
    .then((note) => {
      if (note) {
        return response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((err) => {
      next(err)
    })
})

// Editar una nota por ID
app.put('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = request.body

  const noteUpdate = {
    content: note.content
  }

  Note.findByIdAndUpdate(id, noteUpdate, { new: true })
    .then((result) => {
      response.json(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

// Eliminar una nota por ID
app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id

  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// Agregar una nota
app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content
  })

  newNote.save().then((savedNote) => {
    response.json(savedNote)
  })

  response.json(newNote)
})

// Middlewares
app.use(notFound)

// Sentry middleware
app.use(Sentry.Handlers.errorHandler())
app.use(handleError)

// Correr el servidor
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
