const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true,
        min:6
    },

    confirm_password:{
        type:String,
        required:true,
        min:6
    },

    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],

    resetPasswordToken:{
        type:String
    },

    resetPasswordExpires:{
        type:Date
    }
    
});


//hashing the password
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
        this.confirm_password = await bcrypt.hash(this.confirm_password,12);
    }
    next();
});


//generating token
userSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        console.log('error from tokens', err);
    }
};


// create a collection
const User = mongoose.model('USER', userSchema);

module.exports = User;