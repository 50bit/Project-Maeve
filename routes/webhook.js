var express = require('express');
var router = express.Router();
const request = require('request');
var User = require('../models/user');
var brain = require('../services/brain');

const PAGE_ACCESS_TOKEN = "EAAO3eCzKNI4BALZANz8YJP7EofOUaRFmkxu01DRkwZCZARZC3H4cF8DRBDwX915UJNSlwDhrcQHyoZBoRPcGO1feD59knF9FSTy8QUL11z2hjQ2YZA0XJ7ZB1AY4ayQRuTIYyLziy9sl70u1wWligDlGZBYZCMC44fWquVqTxsl03d7GV8SMPQTjIX4G9oWxPhLwZD";
const loginUrl = "https://44c5d9c2.ngrok.io/users/auth";

router.get("/", function (req, res) {
    if (req.query["hub.verify_token"] === "maeve") {
      console.log("Verified webhook");
      res.send(req.query["hub.challenge"]);
    } else {
      res.send('no entry');
    }
});

/*************** access messaging events ************/

router.post("/", function(req, res){  

    let body = req.body;

    if (body.object === 'page') {
  
      body.entry.forEach(function(entry) {
        let webhook_event = entry.messaging[0];
        let sender_psid = webhook_event.sender.id;
        let message = webhook_event.message;
        

        if (webhook_event.optin) {
          receivedAuthentication(webhook_event);
        }
        if (message) {
          handleReceivedMessage(sender_psid,message);        
        }

        if (webhook_event.account_linking) {
          receivedAccountLink(webhook_event);
        }
        
      });
  
      res.status(200).send('EVENT_RECEIVED');
  
    } else {
      res.sendStatus(404);
    }
  

});


/***************** Sending Response To User Throw Facebook API  **************/

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent! ')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}


/************** handle Received Message **************/

function handleReceivedMessage(senderID,message){
  var status;
  var messageText = message.text;
  var messageAttachments = message.attachments;
  
  response = {
    "text": "this is my message to you oo oo ooh : " + messageText
  };
  if(!message.is_echo){
    try {

      status = getUserStatus(senderID,(err,user)=>{
        if(user.fbStatus=='linked'){
          console.log("\n\n\n\nStatus : " + user.fbStatus);
          if(messageText){
            switch (messageText) {
              case 'account linking':
                console.log("you sent account linking")
                sendAccountLinking(senderID);
                break;
              
              case 'unlink':
                console.log("you sent account linking")
                unlink(senderID);
                break;
        
              default:
                brain.getResponse(senderID,messageText,(message)=>{
                  if(message){
                    sendTypingOff(senderID);
                    res = {
                      "text": message
                    };
                    callSendAPI(senderID, res);
                  }
                  
                });
                
                sendTypingOn(senderID);
                
            }
          }
        }
        else if(user.fbStatus == 'unlinked'){
          sendAccountLinking(senderID);
        }
        else{
          console.log("its unlinked our undefined ");
        }
      });
      
    } catch (error) {
      
      console.log("erorrrrrrrrrrrrrrrrrrr")

    }
    

  }

  else{
    callSendAPI(senderID, response);
  }

  
}


/************************* Send Account Linking Button To user *******************/
function sendAccountLinking(recipientId) {
  var message= {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Welcome. Link your account.",
        buttons:[{
          type: "account_link",
          url: loginUrl
        }]
      }
    }
  };  
  callSendAPI(recipientId,message);
}

/*********************** Recieved Account Linking Event From User **************/
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;
  if(status == 'linked'){
    setStatus(authCode,(err,user)=>{
      user.fbStatus = status;
      user.fbUserID = senderID;
      user.save((err,updatedUser)=>{
        if(err){
          console.log("errrrr : " +err)
        }else{
          console.log("updated successfully !")
          console.log("user : " +user.fbUserID)
        }
      });
    });
  }
  if(status == 'unlinked'){
    User.findOne({fbUserID:senderID},(err,user)=>{
      if(!err&&user){
        user.fbStatus = 'unlinked';
        user.save((err,updatedUser)=>{
          if(err){
            console.log("errrrr : " +err)
          }else{
            console.log("unlinkeeeeeeeed")
            console.log("user : " +user.fbStatus)
          }
        });
      }
      else{
        console.log("kosom 7yaty awwwwwwwwwy ");
      }
      
    });
    console.log("kosom 7yaty");
  }
  
  
  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
  
}

/********************************** unlink  *****************************/
function unlink(sender_psid){
  
  request({
    "uri": "https://graph.facebook.com/v2.6/me/unlink_accounts",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "psid": sender_psid
    }
  }, (err, res, body) => {
    if (!err) {
      console.log('account unlinked successfully ! \n ' + res.result)
    } else {
      console.error("Unable unlink :" + err);
    }
  }); 
}
/****************************** After Authentication Process **************************/
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  message = {
    "text" : "Authentication successful"
  }

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  callSendAPI(senderID, message );
}

/***************************** Set User Status ***********************/
function setStatus(userID,callback){
  User.findById(userID,callback);
  
}

/************************* Get User Status  **************************/
function getUserStatus(senderID,callback){
  var query ={fbUserID:senderID};
  User.findOne(query,callback);
}


/******************************* exported send api ****************/
module.exports.callSendAPIBrain=function(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent! ')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

/******************************** typing on/off indicator  ***********************/
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");
  indicator(recipientId,"typing_on");
}

function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");    
  indicator(recipientId,"typing_off");
}

function indicator(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action":response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent! ')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}



module.exports = router;
