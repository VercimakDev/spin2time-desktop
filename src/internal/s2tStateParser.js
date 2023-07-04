/**
 * s2tStateParser reads and returns releveant data from the logged-in-user from the state.s2t file in the
 * /saves directory 
 */
const fs = require('fs');
const remote = require("electron").remote;
const savesPath = `${remote.app.getPath('userData')}/saves/state.s2t`;
/**
 * Return an array with 4 elements of the content in /saves/state.s2t 
 * in the order: ID, E-Mail, Username, Password)
 * 
 * @param process a function to be executed while the
 * data stream is active
 */
exports.readState = function(process){
    fs.access(savesPath, fs.F_OK, (err) => {
        if(err) { console.error(err); }
        fs.readFile(savesPath, {encoding: 'utf-8'}, (err, data) => {
            if(err) {console.error(err);}
            var state = data.split(';');
            process(state);                
        });
    })
}