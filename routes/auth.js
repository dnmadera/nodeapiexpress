const express = require('express')

const {
    register,
    login,
    getMe,
    forgotPassword,
    resetpassword,
    updateUserDetails,
    updatePassword,
    logout
} = require('../controllers/auth')

const { protect } = require('../middleware/auth')


const router = express.Router();

router.route('/resetpassword/:resettoken')
    .put(resetpassword);

router
    .post('/register', register)
    .post('/login', login)
    .get('/me', protect, getMe)
    .post('/forgotpassword', forgotPassword)
    .put('/updatedetails', protect,  updateUserDetails)
    .put('/updatepassword', protect,  updatePassword)
    .get('/logout', protect, logout)
    



module.exports = router