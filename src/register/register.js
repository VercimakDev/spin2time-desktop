const electron = require("electron");
const path = require('path')
const s2tDB = require("../internal/s2tDB");
const bcrypt = require("bcrypt")

const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const $ = require('jquery');

const s2tMailer = require('../internal/s2tMailer');

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/


function get4DigitRndInteger(digits) {
  var code = "";
  for (var i = 1; i <= digits; i++) {
    code += Math.floor(Math.random() * 10); //random number between 0 and 9 
  }
  return code;
}

function reactToSubmVal(expected, result, email, username, password) {
  if (expected == result) {
    var stmt = "INSERT INTO u_users (u_email, u_username, u_password) VALUES (?, ?, ?)";

    s2tDB.connect().query(stmt, [email, username, password], function (err) {
      if (err) {
        if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
          showError("Der Nutzer exisitiert bereits! Bitte versuchen Sie es erneut.");
        } else {
          showError("Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut");
          console.error(err);
        }
      } else {
        //Registrierung erfolgreich
        window.location.href = `../login/login.html?registration=success&username=${username}`;
      }
    });
  } else {
    showError("Ihr Bestätigungscode war leider nicht gültig. Versuchen Sie es bitte noch einmal.");
  }
}

function showError(msg) {
  var errorDiv = $("#dErrorNotification");
  errorDiv.show();
  errorDiv.html(`<button id='bDelete' class='delete'></button>${msg}`)

  $("#bDelete").click(function () {
    $(this).parent().hide();
  });
}
/**
--------------------------------------------------------------------------------------

Events

--------------------------------------------------------------------------------------
**/
$("document").ready(function () {

  //EMail can't have spaces
  $('#inEMail').bind('input', function () {
    $(this).val(function (_, v) {
      return v.replace(/\s+/g, '');
    });
  });

  //Username can't have spaces
  $('#inUsername').bind('input', function () {
    $(this).val(function (_, v) {
      return v.replace(/\s+/g, '');
    });
  });

  //Password can't have spaces
  $('#inPassword').bind('input', function () {
    $(this).val(function (_, v) {
      return v.replace(/\s+/g, '');
    });
  });


  //Submit Register
  $("#fRegister").submit(async (event) => {
    event.preventDefault();
    //Get input data
    var email = $("#inEMail").val();
    var username = $("#inUsername").val();
    var password = $("#inPassword").val();
    var passwordConfirm = $("#inPasswordConfirm").val();


    //Input data validation
    if (!email.includes("@") || email.toString().length == 0 || username.length == 0 || password.length == 0) {
      showError("Ungültige Daten. Bitte überprüfen Sie Ihre Eingaben!");
      return;
    }

    if (password != passwordConfirm) {
      showError("Ungültige Daten. Die Passwörter stimmen nicht überein!");
      return;
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 5);

    //Does the user already exist in the database? 
    var stmt =
      `
    START TRANSACTION;
    INSERT INTO u_users (u_username, u_email, u_password) VALUES ('${username}', '${email}', '${hashedPassword}');
    ROLLBACK;
    `
    s2tDB.connect().query(stmt, (err) => {
      if (err) {
        if (err.code = 1062) {
          console.log(`User input ${username} collides with an already exisiting user`);
          showError(`Der Nutzername ${username} exisitert bereits. Bitte wählen Sie einen anderen Namen.`);
          throw err;
        } else {
          console.error(`Unexpected error occured during registration. Err:${err}`);
        }
      } else {
        //Open validation window - Note a validation window is associated with a unique 4 digit code. Therefore there may only be one window for a registration
        const modalPath = path.join('file://', __dirname, 'validation/validation.html')
        let top = electron.remote.getCurrentWindow();
        let win = new BrowserWindow({ width: 500, height: 500, parent: top, modal: true, webPreferences: { nodeIntegration: true } });
        win.setMenu(null);
        win.on('close', function () { win = null });
        win.loadURL(modalPath);
        win.show();

        //Send E-Mail with verification a 4 digit code and show validation window
        var verificationCode = get4DigitRndInteger(4);
        sendEmail(email, verificationCode);

        //React to user submitted verification code
        ipc.on("submVal", function (event, arg) {
          reactToSubmVal(verificationCode, arg, email, username, hashedPassword);
        });
      }
    });
  });
});

/**
--------------------------------------------------------------------------------------

Mail

--------------------------------------------------------------------------------------
**/

function sendEmail(receiver, code) {
  var subject = 'Ihr Registrierungscode bei Spin2Time!';
  var content =
    `
      <h1 style="color: black">Herzlich Willkommen bei Spin2Time!</h1>
      <p style="color: black">Fast fertig! Geben Sie den unteren Bestätigungscode ein und schon haben Sie einen S2T-Account und können alle Features nutzen!</p>
      <br>
      <p style="color: black">Info: Spin2Time wird mit S2T abgekürzt.</p>
      <br>
      <p style="background-color: #01B5DD; color: white; padding: 10px; border-radius: 10px">
        Das ist Ihr Bestätigungscode: <strong>${code}</strong>
      </p>
      `;
  s2tMailer.sendEmail(subject, receiver, content);
}