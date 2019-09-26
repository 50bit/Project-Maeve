var express = require('express');
var router = express.Router();
const request = require('request');
var User = require('../models/user');

const PAGE_ACCESS_TOKEN = "EAAO3eCzKNI4BALZANz8YJP7EofOUaRFmkxu01DRkwZCZARZC3H4cF8DRBDwX915UJNSlwDhrcQHyoZBoRPcGO1feD59knF9FSTy8QUL11z2hjQ2YZA0XJ7ZB1AY4ayQRuTIYyLziy9sl70u1wWligDlGZBYZCMC44fWquVqTxsl03d7GV8SMPQTjIX4G9oWxPhLwZD";
const loginUrl = "https://946e5db2.ngrok.io/users/auth";

router.get("/", function (req, res) {
    if (req.query["hub.verify_token"] === "maeve") {
      console.log("Verified webhook");
      res.send(req.query["hub.challenge"]);
    } else {
      res.send('no entry');
    }
});



FIXME:

router.post("/", function(req, res){  

  var data = req.body;
 
  // Make sure this is a page subscription
  
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        }// } else if (messagingEvent.message) {
        //   receivedMessage(messagingEvent);
        // } else if (messagingEvent.account_linking) {
        //   receivedAccountLink(messagingEvent);
        // } else {
        //   console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        // }
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }

  else {
    // Return a '404 Not Found' if event is not from a page subscription
    console.log("weird entry")
    res.sendStatus(404);
  }

});




// function handleMessage(sender_psid, received_message) {

//   let response;

//   // Check if the message contains text
//   if (received_message.text) {    

//     // Create the payload for a basic text message
//     response = {
//       "text": `You sent the message: "${received_message.text}". Now send me an image!`
//     }
    
//   }  
  
//   // Sends the response message
//   callSendAPI(sender_psid, response);    
// }


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
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}




/****************************** check if authenticated **************************/
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


/*************************** check the recieved message  from user *************************/
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log("\n\n\n\n\n\n");
  console.log("senderID :"+senderID);
  console.log("\nrecipientID : "+recipientID);
  console.log("\n\n\n\n\n\n");
  

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  
  response = {
    "text": "this is my message to you oo oo ooh : " + messageText
  }
  var status =getUserStatus(senderID,recipientID);
  console.log("\n\n\n\n\n status : " + status + "\n\n\n\n" );
  if(status=='linked'){
    console.log("status is : " + status + "\n\n\n")
    if (messageText) {
      
      // // If we receive a text message, check to see if it matches any special
      // // keywords and send back the corresponding example. Otherwise, just echo
      // // the text we received.
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
          console.log("you sent : " + response)
          callSendAPI(senderID, response);
      }
      //callSendAPI(senderID,response );
    } else if (messageAttachments) {
      callSendAPI(senderID, "Message with attachment received");
    }
  }
  if(status=='unlinked'){
    sendAccountLinking(senderID);
  }

  
}


/*********************** handle account linking ************************/
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  console.log("\n\n\n\n\n senderID2 : "+senderID)
  console.log("\nrecipientID2 : "+recipientID+"\n\n\n\n");
  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  setStatus(authCode,recipientID,status);

  
}
/*********************** send account linking ***************************/
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
/******************** unlink  *****************/
function unlink(sender_psid){
  

  // Send the HTTP request to the Messenger Platform
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

/************** get authenticated user **************/

function setStatus(userID,recipientID,status){
  User.findById(userID,function(err,user){
    user.fbStatus = status;
    user.fbUserID = recipientID;
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
function getUserStatus(senderID,recipientID){
  var status ;
  
  console.log("\n\n\n\n\n senderID3 : "+senderID)
  console.log("\nrecipientID3 : "+recipientID+"\n\n\n\n");
  User.findOne({fbUserID:'1150820841722716'},(err,user)=>{
    console.log("\n\n\n\n\n name : "+user.name + "\n\n\n\n\n")
    if(!err&&user){
      return 'linked';
    }
    else{
      return 'unlinked';
    }
  });
  
}

module.exports = router;