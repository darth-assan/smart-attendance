const mongoose = require('mongoose');

//User Schema
const userSchema = mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    firstname:{
        type:String,
        require:true
    },
    lastname:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require
    }
});

const User = module.exports = mongoose.model('users',userSchema); 