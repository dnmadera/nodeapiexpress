const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,        
        required: [true, 'Please enter a number of weeks']
    },
    tuition: {
        type: Number,
        trim: true,
        required: [true, 'Please enter a tuition cost']
    },
    minimumSkill: {
        type: String,
        trim: true,
        required: [true, 'Please inter a skill'],
        enum: ['beginner','intermediate','advance']
    }, 
    schoolashipAvailable: {
        type: Boolean,
        default: false
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

//static method to get avg cost of course tuition
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const result = await this.aggregate([{
        $match: { bootcamp: bootcampId}
    }, 
    {
        $group: {
            _id: '$bootcamp',
            averageCost: { $avg: '$tuition'}
        }
    }

    ]);

    try {        

        let averageCost = result?.[0]?.averageCost ?? 0;        
        const modelBootcamp = this.model('Bootcamp')        
        await modelBootcamp.findByIdAndUpdate(bootcampId ,{
            averageCost: Math.ceil(averageCost / 10) * 10
        })
    } catch (error) {
        console.error(error);
    }
    

}

// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp)
  });


//
CourseSchema.pre('deleteOne', { document: true }, function() {    
    this.constructor.getAverageCost(this.bootcamp)
  })



module.exports = mongoose.model('Course', CourseSchema);