const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// bring in user model
let User = require('../models/user');
// bring in course model
let Course = require('../models/course');
// bring in student model
let Student = require('../models/student');

// Register Courses
router.post('/register',[
    check('code').isString(),
    check('title').isString(),
    check('duration').isString(),
    check('time').isString(),
    check('venue').isString(),
    check('day').isNumeric()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const code = req.body.code;
    const title = req.body.title;
    const duration = req.body.duration;
    const time = req.body.time;
    const venue = req.body.venue;
    const day = req.body.day;


let newCourse = new Course({
    code:code,
    title:title,
    duration:duration,
    time:time,
    venue:venue,
    day:day
});

newCourse.save(function(err){
    if(err){
        console.log(err);
        return;
    }else{
        req.flash('success','Course added successfully');
        res.redirect('/users/admin');
    }
});

});

//Get Single Course
router.get('/attendance_session/:id',(req,res)=>{
    // Getting today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    User.findById(req.user._id,(err,data)=>{
        if(err) throw err
        Course.findById(req.params.id,(err,course)=>{
        if (err) throw err
            Student.find({ courses: { $in: [req.params.id]}},(err,students)=>{
                if (err) throw err
                res.render('attendance_session',{
                    title:'Attendance Session',
                    isAdmin:data.isAdmin, 
                    user_name:data.name.lastName,
                    course:course,
                    students:students,
                    today:today
                });
            });
        });
    });
});

// Delete course
router.delete('/delete-course/:id',(req,res)=>{
    Course.findOneAndRemove({_id:req.params.id},(err)=>{
        if(err) throw err
        console.log('Coursse deleted successfully');
    });
});


module.exports = router;