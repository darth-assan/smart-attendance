const mongoose = require('mongoose');

//User Schema
const userSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require
    },
    courses:[{
        code : String
    }]
});

const User = module.exports = mongoose.model('users',userSchema); 