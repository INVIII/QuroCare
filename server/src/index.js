const express = require('express')
const app = express()
const path = require('path')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', '..', 'web', 'views'))

app.use(express.static(path.join(__dirname, '..', '..', 'web', 'public')))

app.get('/', (req, res) => {
  res.render('home')
})

app.listen(3000, () => {
  console.log('Server running')
})
