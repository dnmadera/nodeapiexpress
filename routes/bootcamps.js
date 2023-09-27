const express = require('express')

const { 
    getBootcamps
    , getBootcamp
    , putBootcamp
    , patchBootcamp
    , createBootcamp
    , deleteBootcamp   
    , getBootcampRadius 
} = require('../controllers/bootcamps');

const router = express.Router();


router.route('/')
.get(getBootcamps)
.post(createBootcamp);


router.route('/radius/:zipcode/:distance').get(getBootcampRadius)


router.route('/:id')
.get(getBootcamp)
.delete(deleteBootcamp)
.put(putBootcamp)
.patch(patchBootcamp);

module.exports = router