const express = require('express') // рег експресс
const config = require('config') // рег конфиг 
const mongoose = require('mongoose')// mongodb

const app = express()

app.use('/api/auth', require('./routes/auth.routes'))  //роут на авторизацию

const PORT = config.get('port') || 5000  // тащим константу из config или порт=5000

async function start(){
    try {
        await mongoose.connect(config.get('mongoUri'), { // тащим URI из config с параметрами
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true

        })
    } catch (error) {
        console.log('Error', error.message)
        process.exit(1)
    }
}

start()

app.listen(PORT, () => {PORT, console.log(`App started on port ${PORT}`)})