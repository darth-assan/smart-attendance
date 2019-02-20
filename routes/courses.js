const express = require('express');
const router = express.Router();

//Add Routes
router.get('/course', (req,res)=>{
    res.render('course',{
        title: 'Courses'
    });
});


module.exports = router;
