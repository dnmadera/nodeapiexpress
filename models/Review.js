const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxLength: 100
    },
    text: {
        type: String,
        trim: true,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,        
        min: 1,
        max: 10,
        required: [true, 'Please enter a rating']
    },
   
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    //user relationship
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
});

//Prevent user for submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user:1 }, { unique: true })


//static method to get avg rating of bootcamp reviews
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const result = await this.aggregate([{
        $match: { bootcamp: bootcampId}
    }, 
    {
        $group: {
            _id: '$bootcamp',
            averageRating: { $avg: '$rating'}
        }
    }

    ]);

    try {        

        let averageRating = result?.[0]?.averageRating ?? 0;        
        const modelBootcamp = this.model('Bootcamp')
        
        modelBootcamp.findByIdAndUpdate(bootcampId ,{
            averageRating: averageRating
        })
    } catch (error) {
        console.error(error);
    }
    

}


//
ReviewSchema.pre('deleteOne', { document: true }, function() {    
    this.constructor.getAverageRating(this.bootcamp)
})



  ReviewSchema.post('validate', function(result) {
    console.log('%s has been validated (but not saved yet)'.yellow, result._id);
  });
  
  ReviewSchema.post('deleteOne', function(result) {
    console.log('%s has been deleted', result._id);
  });



  // Call getAverageRating after save
ReviewSchema.post('findOneAndUpdate', async function(result) {    
    //this.constructor.getAverageRating(result.bootcamp) 
    //this line throws this.constructor.getAverageRating(result.bootcamp) but it works ok in .post('save')

    console.log('%s has been updated'.green, result._id);
    const Review = mongoose.model('Review');
    await Review.getAverageRating(result.bootcamp);
});


ReviewSchema.post('save', function(result) {
    console.log('%s has been saved'.green, result._id);
    this.constructor.getAverageRating(result.bootcamp)
  });


module.exports = mongoose.model('Review', ReviewSchema);