const express = require('express');
const router = express.Router();

// bring in student model
let Student = require('../../models/student');
let Course = require('../../models/course');
let Attendace = require('../../models/attendance');
//Post Student registeration data
router.post('/student',(req,res)=>{
    if(!req.body){
        return res.status(400),send('Request Body Required');
    }

    let student = new Student(req.body)
    student.save()
    .then(data=>{
        if(!data || data.length === 0){
            return res.status(500).send(data);
        }
        res.status(201).send(data);
    })
    .catch(err =>{
        res.status(500).json(err)
    })
});

//Get Students from the database
router.post('/student/login',(req,res)=>{
    if(!req.body.email && !req.body.password){
        console.log('Error Occured. req.body is empty!');
        return res.status(400).send('Missing parameters: email and password')
    }
    Student.findOne({
        email:req.body.email,
        password:req.body.password
    })
    .then(data=>{
        console.log(data.name.lastName)
        res.json(data)
    })
    .catch(err=>{
        res.status(500).json(err)
    })
});

// logging attendance
router.put('/student/attendace/',(req,res)=>{
    // push student ID's to the page. 
    
});

module.exports = router;