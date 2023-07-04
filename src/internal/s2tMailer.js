const path = require('path');
const nodemailer = require('nodemailer');


exports.sendEmail = function(subject, receiver, content) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'spin2time@gmail.com',
        pass: 'had23Pwe2Time'
      }
    });
  
    var mailOptions = {
      from: 'spin2time@gmail.com',
      to: receiver,
      subject: subject,
      html: content
    }
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        showError("Whoops, die E-Mail konnte nicht zugestellt werden. Bitte versuchen Sie es später erneut.");
        console.error(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  }