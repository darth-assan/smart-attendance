const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// bring in db models
let Student = require('../../models/student');
let Course = require('../../models/course');
let Attendace = require('../../models/attendance');

// Student registeration 
router.post('/student/register',(req,res)=>{
    if(!req.body){
        return res.status(400),send('Request Body Required');
    }

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const pin = req.body.pin;
    const studentId = req.body.studentId;

    let newStudent = new Student({
        name:{
            firstName:firstName,
            lastName:lastName
        },
        email:email,
        studentId:studentId,
        pin:pin
    });

    bcrypt.hash(newStudent.pin,10,function(err,hash){
        if(err) throw err
        newStudent.pin = hash;
        newStudent.save()
        .then(data=>{
            if(!data || data.length === 0){
                return res.status(500).send(data);
            }else{
                res.status(201).send(data);
                console.log('Student added successfully')
            }
        })
        .catch(err =>{
            res.status(500).json(err)
        });
    });
});

// Register courses
router.post('/student/add_courses/',(req,res)=>{
    Student.findByIdAndUpdate({_id:req.query._id},{courses:req.body.courses},(err,data)=>{
        if(err) throw err
        console.log('course added successfully');
        res.status(201).send(data);
    });
});

//Get all courses
router.get('/student/add_courses',(req,res)=>{
    Course.find({},(err,data)=>{
        if(err) throw err
        res.send(data)
    })
});

//login
router.post('/student/login',(req,res)=>{
    if(!req.body.studentId && !req.body.pin){
        console.log('Error Occured. req.body is empty!');
        return res.status(400).send('Missing parameters: studentId and PIN')
    }

    Student.findOne({studentIdrs:req.body.studentId})
    .then(data=>{
        if(data == null){
            console.log("user do not exists")
        }else{
            let pin = req.body.pin
            // Match Password
            bcrypt.compare(pin,data.pin,function(err,isMatch){
                if(err) throw err;
                if(isMatch){
                    console.log(data.name.lastName)
                    res.json(data)
                }else{
                    console.log('PIN Incorrect')
                }
            });
        }
    })
    .catch(err=>{
        res.status(500).json(err)
    })
});

// logging attendance in db
router.post('/student/attendace/',(req,res)=>{
    // Getting today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '-' + dd + '-' + yyyy;

    Attendace.findOneAndUpdate({
        courseId:req.query.courseId,
        date:today
    },
        { $push: { students: req.query.studentId } 
    })
    .then(data=>{
        if(data == null){
            console.log("session do not exists")
            res.redirect(req.originalUrl)
        }else{
            console.log(data)
            console.log("saved successfully")
            res.json(data)
        }
    })
    .catch(err=>{
        res.status(500).json(err)
    })
});



module.exports = router;