const express = require('express')

const { 
    getBootcamps
    , getBootcamp
    , putBootcamp
    , patchBootcamp
    , postBootcamp
    , deleteBootcamp    
} = require('../controllers/bootcamps');

const router = express.Router();


router.route('/')
.get(getBootcamps)
.post(postBootcamp);


router.route('/:id')
.get(getBootcamp)
.delete(deleteBootcamp)
.put(putBootcamp)
.patch(patchBootcamp);

module.exports = router