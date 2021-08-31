const express = require('express')
const app = express()
const path = require('path')
const mainRoutes = require('./routes/main.js')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', '..', 'web', 'views'))

app.use(express.static(path.join(__dirname, '..', '..', 'web', 'public')))

app.use('/', mainRoutes)

app.listen(3000, () => {
  console.log('Server running')
})
