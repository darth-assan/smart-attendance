const express = require('express');
const router = express.Router();

// bring in student model
let Student = require('../models/student');

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

//Get Student from the database
router.post('/student/login',(req,res)=>{
    if(!req.query.studentID){
        return res.status(400).send('Missing parameters: email')
    }
    Student.findOne({
        studentID:req.query.studentID
    })
    .then(data=>{
        res.json(data)
    })
    .catch(err=>{
        res.status(500).json(err)
    })
})

module.exports = router;