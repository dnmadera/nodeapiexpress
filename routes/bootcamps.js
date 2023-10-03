const express = require('express')

const { 
    getBootcamps
    , getBootcamp
    , putBootcamp
    , patchBootcamp
    , createBootcamp
    , deleteBootcamp   
    , getBootcampRadius 
    , photoUploadBootcamp
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp')

const advancedResults = require('../middleware/advancedResults')


//include other route sources
const courseRouter = require('./courses')

const router = express.Router();

//re-route into other resourse routers
router.use('/:bootcamp_id/courses', courseRouter)




router.route('/radius/:zipcode/:distance').get(getBootcampRadius)

router.route('/:id/photo').put(photoUploadBootcamp)

router.route('/')
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(createBootcamp);


router.route('/:id')
.get(getBootcamp)
.delete(deleteBootcamp)
.put(putBootcamp)
.patch(patchBootcamp);




module.exports = router