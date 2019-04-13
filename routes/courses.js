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
                req.flash('warning','Session already exists');
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
    try {
        const user = await User.findById(req.user._id);
        const course = await Course.findById(req.params.id);
        const attendance = await Attendace.findOne({date: new Date(today), courseId: req.params.id});
        const attendanceIds = attendance.students.map( student => student );
        const preStudents = await Student.find({ _id: { $in:attendanceIds}});
        const abStudents = await Student.find({ _id: { $nin:attendanceIds},courses: { $in: [req.params.id]}});

        res.render('current_session',{
            title:'Attendance Session',
            isAdmin:user.isAdmin, 
            course:course,
            user_name:user.name.lastName,
            preStudents:preStudents,
            abStudents:abStudents,
            today:today
        });
    } catch (error) {
        console.log(error);
    }
});


// Delete course
router.delete('/delete-course/:id',(req,res)=>{
    Course.findOneAndRemove({_id:req.params.id},(err)=>{
        if(err) throw err
        console.log('Coursse deleted successfully');
    });
});

// Reset courses
router.post('/reset_courses',(req,res)=>{
    Course.updateMany({},{assigned:null},(err)=>{
        if (err) throw err
        req.flash('success','Courses reset successful')
        res.redirect('/users/admin/?_id='+ req.user._id);
    });
});

//Edit courses
router.get('/edit_course/:id', (req,res)=>{
    Course.findById(req.params.id,(err,data)=>{
        if (err) throw err
        User.findById(req.user._id,(err,result)=>{
            if (err) throw err
            if(result.isAdmin == false){
                req.flash('danger','Not Authorized');
                res.redirect('/');
            }else{
                res.render('edit_course',{
                    title:'Edit Course',
                    course:data,
                    user_name:result.name.lastName
                });
            }
        });
    });
});

// Update Courses
router.post('/edit_course/:id',[
    check('code').isString(),
    check('title').isString(),
    check('duration').isString(),
    check('time').isString(),
    check('venue').isString(),
    check('day').isNumeric()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('danger','Edit unsuccessful. Try Again !');
        // return res.status(422).json({ errors: errors.array() });
        return res.redirect(req.originalUrl)
    }

    const code = req.body.code;
    const title = req.body.title;
    const duration = req.body.duration;
    const time = req.body.time;
    const venue = req.body.venue;
    const day = req.body.day;


let course = {
    code:code,
    title:title,
    duration:duration,
    time:time,
    venue:venue,
    day:day
};

let query = {_id:req.params.id}

Course.update(query,course,(err)=>{
    if(err){
        console.log(err);
        return;
    }else{
        req.flash('success','Updated Successfully')
        res.redirect('/courses/edit_course/'+req.params.id)
    }
})

});

// Delete course
router.post('/delete_course/:id',(req,res)=>{
    let query = {_id:req.params.id};
    Course.findByIdAndDelete(query,(err)=>{
        if (err) throw err
        req.flash('success','Course Successfully Deleted')
        res.redirect('/users/admin/?='+req.user.id)
    });
});

//Get individual attendance records
router.get('/students/report/:id',async (req,res)=>{
    // Getting today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    try {
        const course = await Course.findById(req.query.course_id);
        const student = await Student.findById(req.params.id);
        const user = await User.findById(req.user._id);
        const attendance = await Attendace.find({courseId:req.query.course_id});
        const preAttendance = await Attendace.find({courseId:req.query.course_id,students:{ $in:req.params.id}});

        // Array of all lecture dates
        const lecture_dates = attendance.map(lectures=> lectures.date);
        // console.log(lecture_dates)
        // Array of student's attendance dates
        const student_dates = preAttendance.map(students_rec=> students_rec.date);
        // console.log(student_dates)
        // creating an empty array to store student attendance records
        const student_att = [];
        // for each lecture date, create a student attendance record with date set to the lecture date and status set to false;
        lecture_dates.map((lecture)=>{
            student_att.push({'date':lecture, 'status':false});
        });
        // for each student attendance date, check if that date exist in student attendance record, if it does set student attendace record status to true.
        student_dates.map((attendance)=>{
            student_att.map((attendance_record)=>{
                if (attendance_record.date.getTime() == attendance.getTime()){
                    attendance_record.status = true;
                }
            });
        });
        // display the results
        // console.log(student_att);

        const present = student_att.filter(length => length.status == true);

        res.render('individual_report_page',{
            title:'Students Report',
            student:student,
            isAdmin:user.isAdmin, 
            user_name:user.name.lastName,
            course:course,
            today:today,
            present:present.length,
            student_attendance:student_att
        });
    } catch (err) {
        console.log(err);
    }
    
});

//Getting past records for each student
router.get('/records/:id',async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        const course = await Course.findById(req.params.id);
        const attendance = await Attendace.find({courseId:req.params.id});
        const students = await Student.find({ courses: { $in: [req.params.id]}});

    res.render('records',{
        title:"Records",
        isAdmin:user.isAdmin, 
        course:course,
        user_name:user.name.lastName,
        students:students,
        attendances:attendance
    });
    } catch (err) {
        console.log(err);
    }
    
});

//Getting past records for a course per date
router.get('/records_spec/:id',async(req,res)=>{

    try {
        const user = await User.findById(req.user._id);
        const course = await Course.findById(req.params.id);
        const attendance = await Attendace.find({courseId:req.params.id});
        const attendancePerDate = await Attendace.findOne({courseId:req.params.id,date:req.query.date});
        const students = await Student.find({ courses: { $in: [req.params.id]}});

    res.render('records_specified',{
        title:"Records",
        isAdmin:user.isAdmin, 
        course:course,
        user_name:user.name.lastName,
        students:students,
        attendances:attendance,
        att_per_date:attendancePerDate
    });
    } catch (err) {
        console.log(err);
    }
    
});


module.exports = router;