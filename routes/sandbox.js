const express = require('express')
const { 
    sandboxPromise
} = require('../controllers/sandbox');

const router = express.Router();


router.route('/promise')
    .get(sandboxPromise)


module.exports = router