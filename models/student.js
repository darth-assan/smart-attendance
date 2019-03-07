const mongoose = require('mongoose');

//User Schema
const studentSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    studentID:{
        type:String,
        require:true,
        unique: true
    },
    pin:{
        type:String,
        require:true,
        unique: true
    }
});

const Student = module.exports = mongoose.model('student',studentSchema); 