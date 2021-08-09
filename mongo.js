const mongoose = require('mongoose')
require('dotenv').config()

const connectURL = process.env.MONGO_DB_URI

// Conexion
mongoose.connect(connectURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    console.log('Database connected')
  }).catch(err => {
    console.log(err)
  })

process.on('uncaughtException', () => {
  mongoose.connection.disconnect()
})
