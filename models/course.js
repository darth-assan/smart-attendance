const mongoose = require('mongoose');

//Course Schema 
const courseSchema = mongoose.Schema({
    code:{
        type: String,
        require: true
    },
    title:{
        type: String,
        require: true
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
        type: String,
        require: true
    }
});

const Course = module.exports = mongoose.model('courses', courseSchema);
