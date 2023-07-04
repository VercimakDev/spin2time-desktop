const electron = require("electron")
const remote = require("electron").remote;
const savesPath = `${remote.app.getPath('userData')}/saves/state.s2t`;

const fs = require('fs');
const s2tDB = require('../internal/s2tDB');
const s2tStateParser = require("../internal/s2tStateParser");
const ipc = electron.ipcRenderer;

const $ = require("jquery");
/**
--------------------------------------------------------------------------------------

Main

--------------------------------------------------------------------------------------
**/


$('document').ready(() => {
    checkLoggedInStatus();
});


/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/


/**
 * Checks if the user is logged in by quering the data in /saves/save.s2t. If the directory and/or the file do not exist, 
 * they are created.
 * If User is logged in = Redirecting to dashboard
 * If User is not logged in = Redirecting to login
 */
function checkLoggedInStatus(){
    fs.access(savesPath, fs.F_OK, (err) => {
        //If save folder does not exist user gets redirected to login
        if(err){
            ipc.send("splash-done", "src/login/login.html");
        }else //... otherwise the user gets redirected to dashboard
        {
            s2tStateParser.readState((state) => {
                    s2tDB.connect().query(`SELECT u_email, u_username, u_password FROM u_users WHERE u_email = '${state[1]}' AND u_username = '${state[2]}' AND u_password = '${state[3]}'`, (err, data) =>
                        {
                            if(err){console.error(err);}
                            else{
                                if(data.length == 0){
                                    //User is not logged in, redirecting to login
                                    ipc.send("splash-done", "src/login/login.html");
                                }else{
                                    //User is already logged in, redirecting to dashboard
                                    ipc.send("splash-done", "src/dashboard/dashboard.html");
                                }  
                            }
                    });
            });
        }
    });
}