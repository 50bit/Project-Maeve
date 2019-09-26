var express = require('express');
var router = express.Router();
mongoose = require('mongoose');


var Calendar = require('../models/calendar');
const {ensureAuthentication} = require('../helpers/auth');

// Calendar
router.get('/',ensureAuthentication,function(req, res, next) {
    // try {
    //     const newCalendar = new Calendar({
    //         text:"One more test event", 
    //         start_date: new Date(2018,8,1),
    //         end_date:   new Date(2018,8,8),
    //         color: "#DD8616",
    //         user:req.user._id
    //     });
    //     newCalendar.save().then(()=>{
    //         console.log("saved successfully \n\n" );
    //     })
    // } catch (error) {
    //     res.redirect('/users/login');
    //     console.log(handleError(error));
    // }
    

    res.render('calendar');
});

router.get('/data',ensureAuthentication,function(req,res){
    Calendar.find({user:req.user.id}).then(data=>{
        for (var i = 0; i < data.length; i++){
            data[i].id = data[i]._id;
            
        }
        res.send(data);
    });
});


router.post('/data',ensureAuthentication,function(req, res){
    var data = req.body;
    data.user = req.user.id;
    
    //get operation type
    var mode = data["!nativeeditor_status"];
    //get id of record
    var sid = data.id;
    var tid = sid;
    
    //remove properties which we do not want to save in DB
    delete data.id;
    delete data["!nativeeditor_status"];


    //output confirmation response
    function update_response(err, result){
        if (err)
            mode = "error";
        else if (mode == "inserted")
            tid = data._id;

        res.setHeader("Content-Type","application/json");
        res.send({action: mode,sid:sid,tid:tid});

    }

    //run db operation
    if (mode == "updated"){
        
        Calendar.findByIdAndUpdate(sid,data,update_response)
    }
    else if (mode == "inserted"){
        var newCalendar = Calendar({
            text:data.text,
            start_date:data.start_date,
            end_date:data.end_date,
            user:data.user
        });
        newCalendar.save();
        console.log("inseted!");
    }
    else if (mode == "deleted"){
        Calendar.findByIdAndRemove(sid,update_response);
    }
    else
        res.send("Not supported operation");
    
});


module.exports = router;