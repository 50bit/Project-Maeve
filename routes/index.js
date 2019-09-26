var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');


// get homepage
router.get('/',(req,res)=>{
    res.render('index');
});

router.post('/',(req,res)=>{
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'floki.bot.2018@gmail.com', // generated ethereal user
                pass: '#HqNmSQx8z9pxFaW' // generated ethereal password
            }
        });
    
        // setup email data with unicode symbols
        let mailOptions = {
            from: req.body.email, // sender address
            to: 'walter.white.hiezenberg@gmail.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: req.body.message
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });

    res.redirect('/');
});

module.exports = router;