const electron = require("electron");
const remote = electron.remote;
const path = require('path');
const fs = require('fs');

const s2tStateParser = require("../internal/s2tStateParser");
const savesPath = `${remote.app.getPath('userData')}/saves/state.s2t`;

const { BrowserWindow } = remote;
const s2tDB = require("../internal/s2tDB");

let projectCreation;

window.$ = window.jQuery = require('jquery');


/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/

function refresh() {

    s2tStateParser.readState((data) => {
        var stmt =
            `
        SELECT p_id, p_name, p_description, pm_u_id, pm_isAdmin 
        FROM p_projects 
        JOIN pm_projectmembers ON p_id = pm_p_id 
        WHERE pm_u_id = ${data[0]} AND p_isArchived = 0
        
        `;
        s2tDB.connect().query(stmt, (err, result) => {
            if (err) {
                console.error(`Failed to load projects. Err: ${err}`)
            } else {
                var html = ``;
                for (var i = 0; i < result.length; i++) {
                    var project = result[i];
                    var addition = ``;
                    var rights;
                    if (project.pm_isAdmin == 0) {
                        rights = "Mitglied";
                    } else if (project.pm_isAdmin == 1) {
                        rights = "Admin";
                    } else if (project.pm_isAdmin == 2) {
                        rights = "Ersteller";
                    }
                        
                    if (project.p_description == "") {
                        addition = `project-box-without-desc`
                    }
                    html += i % 4 == 0 ? "<div class='columns'>" : "";
                    html +=
                        `
                    <div class="project-box column ${addition}">
                    <span id="${project.p_id}" class="info-id">${project.p_id}</span><span class="info-right">| ${rights}</span>
                    <p class="info-projectName">${project.p_name}</p>
                    <p class="info-description">${project.p_description}</p>
                    </div>
                    `
                    html += i % 4 == 3 ? "</div>" : "";
                }
                $("#uProjectList").html(html);
                projectLink();
                getRunningTimer();
                console.log('Successfully retrieved/refreshed projects');
            }
        });
    });
}


function projectLink() {
    $(".project-box").click((event) => {
        var projID = $(event.currentTarget).find(".info-id").attr("id");
        s2tStateParser.readState((data) => {
            window.location.href = `../../dist-project/project.html?projname=${projID}&userid=${data[0]}`;
        })
    });
}

function getRunningTimer() {
    s2tStateParser.readState((localData) => {
        var stmt = `SELECT UNIX_TIMESTAMP(wt_start) as startTime, wt_p_id, p_name 
                FROM wt_worktable JOIN p_projects ON wt_p_id = p_id 
                WHERE wt_stop is null 
                AND wt_u_id = ${localData[0]}`;
        s2tDB.connect().query(stmt, function (err, data) {
            if (err) throw err;
            if (data.length > 0) {
                data.forEach(function (item) {
                    var countDownDate = new Date(item.startTime * 1000).getTime();
                    // Update the count down every 1 second
                    var x = setInterval(function () {

                        // Get today's date and time
                        var now = new Date().getTime();

                        // Find the distance between now and the count down date
                        var differenceInSeconds = (now - countDownDate) / 1000;
                        var seconds = Math.floor(differenceInSeconds % 60)
                            .toString()
                            .padStart(2, "0");
                        var minutes = Math.floor((differenceInSeconds / 60) % 60)
                            .toString()
                            .padStart(2, "0");
                        var hours = Math.floor((differenceInSeconds / 60 / 60) % 60)
                            .toString()
                            .padStart(2, "0");

                        // Display the result in the element with id="demo"
                        document.getElementById(item.wt_p_id).innerHTML = hours + ":" + minutes + ":" + seconds;
                        document.getElementById(item.wt_p_id).style.fontWeight = "bold";

                    }, 1000);

                });
            }
        });
    });
}




//search for project
function enableProjectSearch() {
    $("#iSearch").keyup(function () {

        // Retrieve the input field text and reset the count to zero
        var filter = $(this).val();

        // Loop through the comment list
        $(".project-box").each(function () {

            // If the list item does not contain the text phrase fade it out
            if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                $(this).hide();

            } else {
                $(this).show();
            }
        });
    });
}




/**
--------------------------------------------------------------------------------------

Events

--------------------------------------------------------------------------------------
**/


$("document").ready(function () {

    s2tStateParser.readState((data) => {
        $("#pUserName").html(`Willkommen, ${data[2]}`);
    });

    $("#bProjectCreationWindow").click(function () {
        //Project Creation Page
        const modalPath = path.join('file://', __dirname, 'projectCreation//projectCreation.html');
        let currentWin = remote.getCurrentWindow();

        var xOffset = currentWin.getPosition()[0] + (currentWin.getBounds().width - 700) / 2;
        var yOffset = currentWin.getPosition()[1] + ((currentWin.getBounds().height - 420) / 2);

        projectCreation = new BrowserWindow({
            width: 700, height: 420, center: true, parent: currentWin, x: xOffset, y: yOffset, show: false, frame: false, modal: true, webPreferences: {
                nodeIntegration: true
            }
        });

        projectCreation.setMenu(null);

        projectCreation.once('ready-to-show', () => {
            projectCreation.show();
        });

        projectCreation.on('close', function () {
            projectCreation = null;
            refresh();
        });

        projectCreation.loadURL(modalPath);
        // Open the DevTools when dev flag is open
        /*if (remote.process.argv[2] == "--dev") {
            projectCreation.webContents.openDevTools();
        }*/
    });

    //Refresh Button
    $("#bRefresh").click(refresh);

    //Profile Button
    $("#aProfile").click(function () {
        window.location.href = '../profile/profile.html';
    });

    //Logout Button
    $("#aLogOut").click(function () {
        fs.writeFile(savesPath, "", function (err) {
            if (err) throw err;
            window.location.href = '../login/login.html';
        });
    });


    //Bulma Burger
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });

    //Search function
    enableProjectSearch();

    // Refresh/Creation of Project List on startup
    refresh();

    //Link to Project
    projectLink();


    $(document).on("click", '.tTrash', function () {
        console.log("trash");
    });

    getRunningTimer();
});