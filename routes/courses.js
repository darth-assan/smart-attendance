const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// bring in user model
let User = require('../models/user');
// bring in course model
let Course = require('../models/course');
// bring in student model
let Student = require('../models/student');
// bring in attendance model
let Attendace = require('../models/attendance');

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

    User.findById(req.user._id,(err,user)=>{
        if(err) throw err
        Course.findById(req.params.id,(err,course)=>{
            if (err) throw err
            Student.find({ courses: { $in: [req.params.id]}},(err,students)=>{
                if (err) throw err
                Attendace.findOne({date:new Date(today),courseId:req.params.id},(err,att_data)=>{
                    if (err) throw err
                    if(att_data == null){
                        req.flash('warning', 'Authorize attendance first')
                        res.redirect('/users/dashboard/?_id='+ req.user._id);
                    }else{
                        res.render('attendance_session',{
                            title:'Attendance Session',
                            isAdmin:user.isAdmin, 
                            user_name:user.name.lastName,
                            course:course,
                            students:students,
                            total_students:students.length,
                            total_students_present:att_data.students.length,
                            today:today
                        });
                    }
                });
            });
        });
    });
});

//Create attendance object in db
router.post('/attendance_session/:id',(req,res)=>{
    // Getting today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '-' + dd + '-' + yyyy;

    Attendace.findOne({courseId:req.params.id, date:new Date(today)},(err,results)=>{
        if (err) throw err
        if(results){
            let d1 = new Date(today).getTime();
            let d2 = results.date.getTime();
            // console.log(today)
            // console.log(results.date)
            if (d1 !== d2){
                let newAttendace = new Attendace({
                    date:today,
                    courseId:req.params.id
                }).save((err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        req.flash('success','Attendace session authorized successfully.')
                        res.redirect('/users/dashboard/?_id='+ req.user._id)
                    }
                });
            }else{
                req.flash('warning','Session Already Exit');
                res.redirect('/users/dashboard/?_id='+ req.user._id);
            }
        }else{
            let newAttendace = new Attendace({
                date:today,
                courseId:req.params.id
            }).save((err)=>{
                if(err){
                    console.log(err)
                }else{
                    req.flash('success','Attendace session authorized successfully.')
                    res.redirect('/users/dashboard/?_id='+ req.user._id)
                }
            });
        }
    });

});

//Get students present
router.get('/attendance_session/:id/stats',async(req,res)=>{
    // Getting today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.id);
    const attendance = await Attendace.findOne({date: new Date(today), courseId: req.params.id});
    const attendanceIds = attendance.students.map( student => student );

    Student.find({ _id: { $in:attendanceIds}},(err,preStudents)=>{
        if (err) throw err
        Student.find({ _id: { $nin:attendanceIds}},(err,abStudents)=>{
            if (err) throw err
            res.render('current_session',{
                title:'Attendance Session',
                isAdmin:user.isAdmin, 
                course:course,
                user_name:user.name.lastName,
                preStudents:preStudents,
                abStudents:abStudents,
                today:today
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