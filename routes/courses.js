const express = require('express');
const router = express.Router();

//Add Routes
router.get('/registeration', (req,res)=>{
    res.render('add_student',{
        title: 'Registeration'
    });
});

//Add submit post request
// router.post('/add',(req,res)=>{
//    req.checkBody('title','Title is required').notEmpty();
//    req.checkBody('body','Body is required').notEmpty(); 

//    // Get Errors
//    let errors = req.validationErrors();

//    if(errors){
//        res.render('add_article',{
//            title:'Add Article',
//            errors:errors
//        });
//    }else{
//    let article = new Articles();
//    article.title = req.body.title;
//    article.author = req.user._id;
//    article.body = req.body.body;

//    article.save((err)=>{
//        if(err){
//            console.log(err);
//            return;
//        }else{
//            req.flash('success','Article Added');
//            res.redirect('/')
//        }
//    });
// }
// });

module.exports = router;
