const mongoose = require('mongoose');

//Course Schema 
const attendanceSchema = mongoose.Schema({
    courseId:mongoose.Types.ObjectId,
    date:{
        type:Date,
        require: true
    },
    // time:{
    //     startTime:{
    //         type: Date,
    //         require: true
    //     },
    //     EndTime:{
    //         type: Date,
    //         require:true
    //     }
    // },
    students:[{
        type: mongoose.Schema.Types.ObjectId,
        default:null
    }]
},{timestamps: true});

const Attendance = module.exports = mongoose.model('attendance', attendanceSchema);
