const {Router} = require('express')
const bcrypt = require('bcryptjs') // >npm i bcryptjs
const jwt = require('jsonwebtoken') // >npm i jsonwebtoken
const config = require('config')
const {check, validationResult} = require('express-validator') //>npm i express-validator
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
    '/register', // роут
    [
        check('email', 'Некоректный email').isEmail(),                // валидаторы на серваке
        check('password', 'Минимальная длинна пароля 6 символов').isLength({min: 6}) // валидаторы на серваке
    ],
    async (req, res) => { // логика
        try {
            const errors = validationResult(req) // запись ошибок через валидатор
            if(!errors.isEmpty()){ // если есть ошибки
                return res.status(400).json({errors: errors.array(), message: 'Некорректные данные при регистрации' })
            }

            const {email, password} = req.body // тащим почту и пароль из body

            const candidate = await User.findOne({email: email}) // проверка есть ли уже такой мейл
            if(candidate){
                return res.status(400).json({message: 'Такой юзер уже есть'})
            }

            const hashedPassword = await bcrypt.hash(password, 12) // хешируем пароль на 12 символов

            const user = new User({ // записуем
                email: email, 
                password: hashedPassword
            })
            await user.save() // сохр
            res.status(201).json({message: 'Пользователь создан'})

            
        } catch (error) {
            res.status(500).json({message: 'Что-то пошло не так, давай ещё!'})
            console.log(error.message)
        }
})

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req) // запись ошибок через валидатор
            if(!errors.isEmpty()){ // если есть ошибки
                return res.status(400).json({errors: errors.array(), message: 'Некорректные данные при входе' })
            }

            const {email, password} = req.body // тащим почту и пароль из body
            const user = await User.findOne({email})
            if(!user){ // если нема юзера
                return res.status(400).json({message: 'Пользователь не найден'})
            }

            const isMatch = await bcrypt.compare(password, user.password) // проверка на пароль
            if(!isMatch){ // если не совпало
                return res.status(400).json({message: 'Неверный пароль, давай ещё'})
            }

            //авторизация через jwt token
            const token = jwt.sign(
                {userId: user.id}, // ловим id
                config.get('jwtSecret'), //секреный вопрос через config/default.js
                {expiresIn: '1h'} // время жизни токена
            )

            res.json({token, userId: user.id})



        } catch (error) {
            res.status(500).json({message: 'Что-то пошло не так, давай ещё!'})
            console.log(error.message)
        }

})

module.exports = router