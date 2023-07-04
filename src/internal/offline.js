const {ipcRenderer} = require('electron');
const $ = require('jquery');

$("document").ready(function() {
    $("#closeApp").click(function() {
        console.log("d");
        ipcRenderer.send('close-app');
    })
})
