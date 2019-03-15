const mongoose = require('mongoose');

//User Schema
const studentSchema = mongoose.Schema({
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
    id:String,
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
    courses:[mongoose.Schema.Types.ObjectId]
});

const Student = module.exports = mongoose.model('student',studentSchema); 