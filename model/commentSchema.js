const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type:String,
        required:true
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotels"
    },
    hotelName: String

});


// create a collection
const Comments = mongoose.model('COMMENT', commentSchema);

module.exports = Comments;