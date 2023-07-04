const electron = require("electron");
const path = require('path')
const s2tdb = require('../../internal/s2tDB')
const bcrypt = require("bcrypt")


var mysql = require('mysql')

const $ = require('jquery');

const s2tMailer = require('../../internal/s2tMailer');

const code = getDigitRndInteger(4);
/**
--------------------------------------------------------------------------------------

Functions 

--------------------------------------------------------------------------------------
**/
function getDigitRndInteger(digits) {
  var code = "";
  for (var i = 1; i <= digits; i++) {
    code += Math.floor(Math.random() * 10); //random number between 0 and 9 
  }
  return code;
}

function showError(msg) {
  var errorDiv = $("#dErrorNotification");
  errorDiv.css("display", "inline-block");
  errorDiv.html("<button id='bDelete' class='delete'></button>" + msg)

  $("#bDelete").click(function () {
    $(this).parent().css("display", "none");
  });
}

/**
 * Shows pre definied html message and hides all other elements
 */
function showSuccess() {
  var errorDiv = $("#dSuccessNotification");
  errorDiv.css("display", "inline-block");

  //hide all other elements
  $("#dResetBox").hide();
}

function reactToNewPassword(email, password) {
  if (password.length > 0 && password.length <= 300) {
    var stmt = "UPDATE u_users SET u_password = ? WHERE u_email = ?";
    s2tdb.connect().query(stmt, [password, email], function (err) {
      if (err) {
        showError("Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut");
        console.error(err);
      }
      showSuccess();
    })
  } else {
    showError("Das Passwort muss mindestens einen Buchstaben und höchstens 45 Buchstaben haben.");
  }
}

/**
--------------------------------------------------------------------------------------

Form

--------------------------------------------------------------------------------------
**/

$("document").ready(function () {
  $("#fResetPassword").submit(function (event) {
    event.preventDefault();
    //Get user input
    var email = $("#inEMail").val();

    var stmt = `SELECT u_email FROM u_users WHERE u_email = '${email}'`
    s2tdb.connect().query(stmt, function (err, data) {
      if (err) throw err;
      if (data.length <= 0) showError("Es existiert kein Nutzer mit dieser E-Mail Adresse");
      if (data.length > 0) {
        //Send validation code via mail
        
        sendEmail(email, code);

        //Hide unneeded elements
        $("#fResetPassword").hide();

        //Show new elements
        $("#dResetBox").show();
        
      }

    })

    if (email.toString().length == 0) { showError("Ungültige E-Mail Adresse"); return; }



    //Verification of code and new password
    $("#bSave").click(async function () {
      var password = $("#inPassword").val();

      //hash Password
      const hashedPassword = await bcrypt.hash(password, 5);

      var submCode = $("#inCode1").val() + $("#inCode2").val() + $("#inCode3").val() + $("#inCode4").val();

      if (submCode == code) {
        reactToNewPassword(email, hashedPassword);
      } else {
        showError("Ungültiger Bestätigungscode. Bitte versuchen Sie es erneut.");
      }
    });
  });

  $(".inCode").keyup(function () {
    if (this.value.length == this.maxLength) {
      var $next = $(this).next('.inCode');
      if ($next.length)
          $(this).next('.inCode').focus();
      else
          $(this).blur();
    }
  });
});

/**
--------------------------------------------------------------------------------------

Mail

--------------------------------------------------------------------------------------
**/

function sendEmail(receiver, code) {
  var subject = 'Passwort zurücksetzen - S2T';
  var content =
    `
    <h1 style="color: black">Passwort zurücksetzen</h1>
    <p style="color: black">Fast fertig! Geben Sie den unteren Bestätigungscode ein, um Ihr Passwort ändern zu können.</p>
    <br>
    <p style="background-color: #01B5DD; color: white; padding: 10px; border-radius: 10px">
      Das ist Ihr Bestätigungscode: <strong>${code}</strong>
    </p>
    `;
  s2tMailer.sendEmail(subject, receiver, content);
}