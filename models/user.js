const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//User Schema
const userSchema = mongoose.Schema({
    name:{
        firstName:{
            type:String,
            require:[true, "can't be blank"],
            lowercase: true
        },
        lastName:{
            type:String,
            require:[true, "can't be blank"],
            lowercase: true
        }
        
    },
    email: {
        type: String, 
        lowercase: true, 
        unique: true, 
        required: [true, "can't be blank"], 
        match: [/\S+@\S+\.\S+/, 'is invalid'], 
        index: true,
        lowercase: true,
    },

    password:{
        type:String,
        require:true
    },
    isAdmin:{
        type:Boolean,
        require:true,
        default:false
    }
},{timestamps: true});

userSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('users',userSchema); 