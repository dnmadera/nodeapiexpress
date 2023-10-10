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
const { protect, authorize } = require('../middleware/auth')

//include other route sources
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router();

//re-route into other resourse routers
router.use('/:bootcamp_id/courses', courseRouter)
router.use('/:bootcamp_id/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampRadius)

router.route('/:id/photo').put(protect, authorize('admin', 'publisher'), photoUploadBootcamp)

router.route('/')
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(protect, authorize('admin', 'publisher'), createBootcamp);


router.route('/:id')
.get(getBootcamp)
.delete(protect, authorize('admin', 'publisher'), deleteBootcamp)
.put(protect, authorize('admin', 'publisher'), putBootcamp)
.patch(protect, authorize('admin', 'publisher'), patchBootcamp);




module.exports = router