const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    imageId:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        username: {
            type:String
        },    
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments'  
        }
    ]

});


// create a collection
const Hotels = mongoose.model('HOTELS', hotelSchema);

module.exports = Hotels;