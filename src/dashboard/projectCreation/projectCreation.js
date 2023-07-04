const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
var mysql = require('mysql');

const s2tStateParser = require("../../internal/s2tStateParser");

const { app, BrowserWindow, Menu, ipcRenderer, dialog } = remote;
const s2tDB = require("../../internal/s2tDB");

window.$ = window.jQuery = require('jquery');

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/

function makeId(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



function create() {

    s2tStateParser.readState((data) => {

        const projId = makeId(4);
        const projDesc = $.trim(document.querySelector('#inProjectDescription').value);
        const projName = $.trim(document.querySelector('#inProjectName').value);

        s2tDB.connect().query(`SELECT p_id from p_projects where p_id = ${projId}`, function (err, result) {
            if (result.length > 0) {
                if (err) throw err;
                create();
            } else
                if (projName !== '') {
                    var sqlP = `INSERT INTO p_projects (p_id, p_name, p_description) VALUES (${projId}, '${projName}', '${projDesc}')`;
                    var sqlPm = `INSERT INTO pm_projectmembers (pm_u_id, pm_p_id, pm_isAdmin) VALUES (${data[0]}, '${projId}', 2)`;
                    s2tDB.connect().query(sqlP, function (err) {
                        if (err) throw err;
                        s2tDB.connect().query(sqlPm, function (err) {
                            if (err) throw err;
                            closeMe();
                        });
                    });
                } else {
                    dialog.showErrorBox("Falsche Eingabe", "Ihre Eingabe ist fehlerhaft!");
                }
        });
    });
}

//closes Project Creation Window
function closeMe() {
    var win = remote.getCurrentWindow();
    win.close();
}

/**
--------------------------------------------------------------------------------------

Events

--------------------------------------------------------------------------------------
**/

$("document").ready(function () {

    //Creates Project when submit button is clicked
    $("#bSubmitCreate").click(function (e) {
        e.preventDefault();
        create();
    });

    //Closes Project Creation Window when cancel button is clicked
    $("#bCancel").click(function () {
        closeMe();
    });
});