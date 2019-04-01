const mongoose = require('mongoose');

//Course Schema 
const courseSchema = mongoose.Schema({
    code:{
        type: String,
        require: true,
        uppercase: true
    },
    title:{
        type: String,
        require: true,
        uppercase: true
    },
    venue:{
        type: String,
        require: true
    },
    duration:{
        type: String,
        require:true
    },
    time:{
        type : String, 
        require: true
    },
    day:{
        type: Number,
        require: true
    },
    assigned: {
        type: mongoose.Types.ObjectId,
        default: null
    }
},{timestamps: true});

const Course = module.exports = mongoose.model('courses', courseSchema);
