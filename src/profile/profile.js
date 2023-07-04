const electron = require("electron");
const remote = electron.remote;
const path = require('path');
const fs = require('fs');
const { dialog } = remote;
const bcrypt = require("bcrypt")
const savesPath = `${remote.app.getPath('userData')}/saves/state.s2t`;

const s2tDB = require("../internal/s2tDB");
const s2tStateParser = require("../internal/s2tStateParser");

window.$ = window.jQuery = require('jquery');


/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/


//overwrite state.s2t
function writeS2TSaveFile(username, password) {
    s2tStateParser.readState((data) => {
        var id = data[0];
        var email = data[1];
        fs.writeFile(savesPath, `${id};${email};${username};${password}`, (err) => {
            if (err) { console.error(`Internal Error: ${err}`); }
            window.location.href = '../dashboard/dashboard.html';
        });
    });
}

function getHashedPassword(username) {
    var p = new Promise((resolve, reject) => {
        s2tDB.connect().query(`SELECT u_password FROM u_users WHERE u_username = '${username}'`, function (err, data) {
            if (err) reject(err);
            if (data.length > 0) {
                resolve(data[0].u_password);
            } else {
                dialog.showErrorBox("Benutzer nicht gefunden. Bitte überprüfen Sie Ihre Eingaben.");
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

    //forbid spaces in inputs
    $('#inUsername').bind('input', function () {
        $(this).val(function (_, v) {
            return v.replace(/\s+/g, '');
        });
    });

    $('#inPassword').bind('input', function () {
        $(this).val(function (_, v) {
            return v.replace(/\s+/g, '');
        });
    });

    $('#inNewUsername').bind('input', function () {
        $(this).val(function (_, v) {
            return v.replace(/\s+/g, '');
        });
    });

    $('#inNewPassword').bind('input', function () {
        $(this).val(function (_, v) {
            return v.replace(/\s+/g, '');
        });
    });

    $('#inNewPasswordConfirm').bind('input', function () {
        $(this).val(function (_, v) {
            return v.replace(/\s+/g, '');
        });
    });



    //inerts Username into input 
    s2tStateParser.readState((data) => {
        $("#inUsername").val(data[2]);
    });

    //back to dashboard
    $("#back").click(function () {
        window.location.href = '../dashboard/dashboard.html';
    });


    $("#bUsernameChange").click(function (e) {

        e.preventDefault();

        $("#confirmBox").addClass("blurred");
        $("#changeBox").removeClass("blurred");
        $('#confirmBox').find('*').attr('disabled', true);
        $("#inNewUsername").prop("disabled", false);
        $("#inNewPassword").addClass("blurred");
        $("#inNewPasswordConfirm").addClass("blurred");
        $("#bCancel").prop("disabled", false);
        $("#bChange").prop("disabled", false);
    })

    $("#bPasswordChange").click(async function (e) {

        e.preventDefault();

        var username = $("#inUsername").val();
        var password = $("#inPassword").val();
        const hashedPassword = await getHashedPassword(username);

        var validLogin = await bcrypt.compare(password, hashedPassword);

        if (password != "" && validLogin) {
            $("#confirmBox").addClass("blurred");
            $("#changeBox").removeClass("blurred");
            $('#confirmBox').find('*').attr('disabled', true);
            $("#inNewUsername").addClass("blurred");
            $("#inNewPassword").prop("disabled", false);
            $("#inNewPasswordConfirm").prop("disabled", false);
            $("#bCancel").prop("disabled", false);
            $("#bChange").prop("disabled", false);
        } else {
            dialog.showErrorBox("Error", "Ihr Passwort ist fehlerhaft. Bitte versuchen Sie es erneut.");
        }
    })

    $("#bCancel").click(function (e) {

        e.preventDefault();
            
        $("#changeBox").addClass("blurred");
        $("#inNewUsername").removeClass("blurred");
        $("#inNewPassword").removeClass("blurred");
        $("#inNewPasswordConfirm").removeClass("blurred");
        $("#confirmBox").removeClass("blurred");
        $('#changeBox').find('*').attr('disabled', true);
        $('#confirmBox').find('*').attr('disabled', false);
        $("#inUsername").prop("disabled", true);
    })

    //change User info
    $("#bChange").click(async function (e) {

        e.preventDefault();

        var username = $("#inUsername").val();
        var password = $("#inPassword").val();
        var newUsername = $("#inNewUsername").val();
        var newPassword = $("#inNewPassword").val();
        var newPasswordConfirm = $("#inNewPasswordConfirm").val();

        const hashedPassword = await getHashedPassword(username);
        const newHashedPassword = await bcrypt.hash(newPassword, 5);

        var validLogin = await bcrypt.compare(password, hashedPassword);

        s2tStateParser.readState((data) => {
            if (username == data[2] && validLogin && newPassword == newPasswordConfirm) {
                var sql = `UPDATE u_users SET u_password = '${newHashedPassword}' WHERE u_username = '${username}'`;
                s2tDB.connect().query(sql, function (err) {
                    if (err) {
                        dialog.showErrorBox("Error", "Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut");
                    } else {
                        writeS2TSaveFile(username, newHashedPassword);
                    }
                });
            }
            else if (newPassword == "" && newPasswordConfirm == "" && newUsername.length > 3) {
                var sql = `UPDATE u_users SET u_username = '${newUsername}' WHERE u_username = '${username}'`
                s2tDB.connect().query(sql, function (err) {
                    if (err) {
                        if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                            dialog.showErrorBox("Error", `Der Nutzer "${newUsername}" exisitiert bereits! Bitte versuchen Sie es erneut.`);
                        } else {
                            dialog.showErrorBox("Error", "Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut");
                        }
                    } else {
                        writeS2TSaveFile(newUsername, hashedPassword);
                    }
                });
            }
            else if (newPassword == "" && newPasswordConfirm == "" && newUsername.length <= 3) {
                dialog.showErrorBox("Falsche Eingabe", "Ihr Benutzername muss länger als 3 Zeichen lang sein!")
            }
            else {
                dialog.showErrorBox("Falsche Eingabe", "Ihre Eingabe ist fehlerhaft!");
            }
        });
    });
});