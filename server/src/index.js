const express = require('express')
const app = express()
const path = require('path')
const mainRoutes = require('./routes/main.js')
const doctorRoutes = require('./routes/doctorRoutes.js')
const patientRoutes = require('./routes/patientRoute.js')
const adminRoutes = require('./routes/adminRoutes.js')
const session = require('express-session')
const flash = require('connect-flash')

const sessionOptions = { secret: 'asecretkeyforsession', resave: false, saveUninitialized: false }

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', '..', 'web', 'views'))

app.use(express.static(path.join(__dirname, '..', '..', 'web', 'public')))
app.use('/', express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session(sessionOptions))
app.use(flash())

app.use('/', mainRoutes)
app.use('/doctor', doctorRoutes)
app.use('/patient', patientRoutes)
app.use('/admin', adminRoutes)

app.get('*', (req, res) => {
  res.render('./pages/404')
})



app.listen(3000, () => {
  console.log('Server running @ http://localhost:3000/')
})
