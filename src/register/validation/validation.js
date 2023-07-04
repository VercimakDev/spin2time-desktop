const electron = require("electron");
const path = require('path')

const ipc = electron.ipcRenderer;

window.$ = window.jQuery = require('jquery');

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/
function closeMe() {
    var win = electron.remote.getCurrentWindow();
    win.close();
}

/**
--------------------------------------------------------------------------------------

Events

--------------------------------------------------------------------------------------
**/

$("document").ready(function () {
    $("#bBestaetigen").click(function () {
        userSubmCode = $("#inCode1").val() + $("#inCode2").val() + $("#inCode3").val() + $("#inCode4").val();
        ipc.send("user-submitted-code", userSubmCode);

        closeMe();
    });
    $("#aRegister").click(function () {
        closeMe();
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