const express = require('express')

const {
    register,
    login,
    getMe,
    forgotPassword,
    resetpassword
} = require('../controllers/auth')

const { protect } = require('../middleware/auth')


const router = express.Router();

router.route('/resetpassword/:resettoken')
    .put(resetpassword);

router
    .post('/register', register)
    .post('/login', login)
    .get('/me', protect, getMe)
    .post('/forgotpassword', forgotPassword);




module.exports = router