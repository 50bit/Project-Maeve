var Calendar = require("../models/calendar");
var User = require ("../models/user");
var call = require("../routes/webhook");

// SEND MAIL IF THERE ARE ANY SCHEDULING EVENT
module.exports.sendMail=function (senderName,senderID,msg){

    // msg = "schedule me a meeting at 8pm in 15 july  with omar.gamalfciscu@gmail.com";
    
    var spawn = require("child_process").spawn; 
        
    var process = spawn('python3',["../Final_Final/SecondPhase.py", msg] );
    
    process.stdout.on('data', function (data) {
        let date = JSON.parse(data).Date;
        let action = JSON.parse(data).Action;
        let time = JSON.parse(data).Time;
        let email = JSON.parse(data).Email;
        var parts =date.split('-');
        var times =time.split(':');
        var mydate = new Date(parts[0], parts[1]-1, parts[2],times[0],times[1],'00'); 
        
        if(action=="Schedule"){
            console.log(mydate.toISOString()+"\n\n\n\n\n")
            Calendar.findOne({"start_date":mydate.toISOString()},(err,res)=>{
                if(res){
                    let noUserMessage = {
                        "text":"this date or time is not available"
                    };
                    call.callSendAPIBrain(senderID,noUserMessage);
                }
                if(!res){
                    var spawn = require("child_process").spawn; 
                    var process = spawn('python3',["../Final_Final/Mail.py", action,time,date,email,senderName] );
                    var schedule = new Calendar()
                    schedule.text = "waiting for confirmation";
                    schedule.start_date = mydate.toISOString();
                    let newDate= new Date(mydate.setHours(mydate.getHours()+1));
                    console.log(newDate.toISOString()+"\n\n\n\n")
                    schedule.end_date = newDate.toISOString();

                    let userObj=User.findOne({"fbUserID":senderID},(err,res)=>{
                        if(res){
                            schedule.user=res._id;
                            schedule.save();
                        }
                        if(!res){
                            console.log("no user\n");
                        }
                    });
                    

                    process.stdout.on('data', function (data) {
                        console.log('stderr: ' + data.toString());
                    });

                    process.stderr.on('data', function (data) {
                        console.log('stderr: ' + data.toString());
                    });
                    
                    process.on('exit', function (code) {
                        console.log('child process exited with code ' + code.toString());
                    });
                    var waitingForConf={
                        "text":"waiting for your partner to confirm"
                    }
                    call.callSendAPIBrain(senderID,waitingForConf);
                }
                if(err){
                    console.log("kosom 7yaty \n\n");
                }
            })
        }
    });
    
    process.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
    });
    
    process.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });
    
}


// RESPONDS TO THE USER MESSAGE IF THERE ARE ANY SCHEDULING EVENT ,
// THEN sendMAil FUNCTION INVOKED

module.exports.getResponse = function(senderID,msg,callback) {

    let spawn = require("child_process").spawn; 
    let process = spawn('python3',["../Final_Final/Final_Final.py",msg] ); 

    process.stdout.on('data', function (data) {
        let flag,message;
        try {
            flag = JSON.parse(data).flag;
            message =JSON.parse(data).message;
        } catch (err) {
            var x = '{"message":'
            var y = data.toString()
            if(y.includes(x)){
                var res='{"message":'+y.split(x).pop();
                flag = JSON.parse(res).flag;
                message =JSON.parse(res).message;
            }
        }

        if(flag== true){
            User.findOne({"fbUserID":senderID},(err,res)=>{
                if(res){
                    module.exports.sendMail(res.username,senderID,msg);
                    callback(message);
                    console.log("doneeeeeeeeeee");
                }
                else{
                    console.log("probleeeeeeeem");
                }
            })
            
        }
        if(flag==false){
            
            callback(message);
        }
        

    });
    
    process.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
    });
    
    process.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });

    
}

