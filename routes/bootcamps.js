const express = require('express')
const { responseLog } = require('../middleware/responseLog')

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
const { protect } = require('../middleware/auth')

//include other route sources
const courseRouter = require('./courses')

const router = express.Router();

//re-route into other resourse routers
router.use('/:bootcamp_id/courses', courseRouter)




router.route('/radius/:zipcode/:distance').get(getBootcampRadius)

router.route('/:id/photo').put(photoUploadBootcamp)

router.route('/')
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(responseLog, createBootcamp, responseLog);


router.route('/:id')
.get(getBootcamp)
.delete(protect, deleteBootcamp)
.put(protect, putBootcamp)
.patch(protect, patchBootcamp);




module.exports = router