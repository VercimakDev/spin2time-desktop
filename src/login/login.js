const electron = require("electron");
const remote = electron.remote;
const fs = require('fs');
const bcrypt = require("bcrypt")
const s2tDB = require("../internal/s2tDB");
const $ = require("jquery");

const savesPath = remote.app.getPath('userData');

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/
function showWarning(msg) {
    var dWarning = $("#dWarning");
    dWarning.show();
    dWarning.html("<button id='bDelete' class='delete'></button>" + msg)

    $("#bDelete").click(function () {
        $(this).parent().hide();
    });
}

//Checks whether the user was redirected to login from a registration success
function checkIfRedirectedFromRegistration() {
    var getArgs = window.location.search.substr(1);
    if (getArgs) {
        var username = getArgs.split("&")[1].split("=")[1].toLowerCase();
        $(".title").after(`<h2 class="title is-5">Herzlich Willkommen ${username}! <br> Der Account wurde erfolgreich erstellt.</h2>`);
    }
}

function writeS2TSaveFile(content) {
    //Create saves directory if it not exists
    if(!fs.existsSync(`${savesPath}/saves`)){
        fs.mkdirSync(`${savesPath}/saves`);
    }
    //Create or replace save.s2t file if it exists
    fs.writeFileSync(`${savesPath}/saves/state.s2t`, content);
        console.log(`Successfully written state to ${savesPath}/saves/state.s2t. Redirecting to dashboard...`);
    window.location.href = '../dashboard/dashboard.html';
}

function getHashedPassword(username) {
    var p = new Promise((resolve, reject) => {
        s2tDB.connect().query(`SELECT u_password FROM u_users WHERE u_username = '${username}'`, function (err, data) {
            if (err) reject(err);
            if (data.length > 0) {
                resolve(data[0].u_password);
            } else {
                showWarning("Benutzer nicht gefunden. Bitte überprüfen Sie Ihre Eingaben.");
            }
        })
    })
    return p;
}

/**
--------------------------------------------------------------------------------------

Events

--------------------------------------------------------------------------------------
**/

$("document").ready(function () {

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

    checkIfRedirectedFromRegistration();

    //Other events
    $("#fLogin").submit(async function (event) {
        event.preventDefault();
        var username = $("#inUsername").val();
        var password = $("#inPassword").val();
        var hashedPassword = await getHashedPassword(username);
        var validLogin = await bcrypt.compare(password, hashedPassword);

        s2tDB.connect().query(`SELECT u_id, u_email, u_password FROM u_users WHERE u_username = '${username}'`, function (err, data) {
            if (err) throw err;
            try {
                if (validLogin) {
                    writeS2TSaveFile(`${data[0].u_id};${data[0].u_email};${username};${data[0].u_password}`);
                } else {
                    showWarning("Falsches Passwort. Bitte überprüfen Sie Ihre Eingaben.");
                }
            } catch (e) {
                throw e;
            }
        });
    });
});

