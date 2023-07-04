<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             TEMPLATE                  ##############
#####################################################################################
--------------------------------------------------------------------------------------
-->

<template>
  <div>
    <div v-if="!loaded" class="loadingio-spinner-eclipse-x0iw4mzxng8">
      <div v-if="!loaded" class="ldio-xokqxz8432">
        <div></div>
      </div>
    </div>
    <div v-if="loaded" id="main">
      <!-- SIDE MENU (TEXTUAL AND ICON) -->
      <div v-if="showSideMenu == true" id="side-menu">
        <span>Arbeitszeiten</span>
        <span
          @click="setTextualAddWorktimeMenuVisibility(true)"
          id="spanShowAddWorktimeTextualMenu"
          class="side-menu-addWorktime"
        >eintragen</span>
        <span>/</span>
        <span
          @click="setTextualDeleteWorktimeMenuVisbility(true)"
          class="side-menu-deleteWorktime"
        >löschen</span>
      </div>

      <div id="dTimer">
        <div id="addWorktimeTextualMenu" v-if="showTextualAddWorktimeMenu == true">
          <b-field grouped>
            <b-field label="Von" label-position="on-border">
              <b-datetimepicker
                class="inTextualVon"
                v-model="fromTextualTime"
                placeholder="Type or select a date..."
                editable
              ></b-datetimepicker>
            </b-field>
            <b-field label="Bis" label-position="on-border">
              <b-datetimepicker
                class="inTextualBis"
                v-model="toTextualTime"
                placeholder="Type or select a date..."
                editable
              ></b-datetimepicker>
            </b-field>
            <b-field>
              <div id="spanTextualInsert" @click="addTextualWorktime">Eintragen</div>
            </b-field>
            <b-field>
              <div
                id="spanTextualCancel"
                @click="setTextualAddWorktimeMenuVisibility(false)"
              >Abbrechen</div>
            </b-field>
            <b-field></b-field>
          </b-field>
        </div>
        <div id="deleteWorktimeTextualMenu" v-if="showTextualDeleteWorktimeMenu == true">
          <span
            @click="setTextualDeleteWorktimeMenuVisbility(false)"
            class="textual-menu-cancel-span"
          >Löschmodus beenden</span>
        </div>
      </div>
      <div class="columns is-pulled-right" id="addWorktimeIconMenu">
        <transition name="showtimer">
          <span
            v-if="startDate !== null"
            class="is-vcentered has-text-centered"
            id="spanTimer"
          >{{ elapsedTimeRepresentation }}</span>
        </transition>
        <play
          v-if="startDate === null"
          v-on:click="startRunningTime(null)"
          key="play"
          class="play"
          :size="30"
          fillColor="white"
        />
        <stop
          v-if="startDate !== null"
          v-on:click="stopRunningTime"
          key="stop"
          class="stop"
          :size="30"
          fillColor="white"
        />
        <transition name="timermessage">
          <span
            v-if="startDate === null"
            class="is-vcentered has-text-centered"
            id="timerMessage"
          >Timer starten</span>
        </transition>
      </div>

      <!-- WORKPACKET-EDIT-VIEW-MENU -->
      <div id="workpacket-edit-view-menu" v-if="showWorkpacketEditAndViewMenu == true">
        <!-- Workpacket-View-Menu -->
        <ul v-for="workpacket in workpackets" v-bind:key="workpacket.ID">
          <div :id="workpacket.ID+'workpacket-wrapper'" class="workpacket-wrapper">
            <li
              :id="workpacket.ID+'li'"
              v-on:click="reactToSelect(workpacket.ID)"
              class="workpacket-li"
            >{{ workpacket.name }}</li>
            <span
              @click="deleteWorkpacket(workpacket.ID)"
              :class="workpacket.ID+'view-menu'+' workpacket-delete-span'"
            >X</span>
            <span
              v-if="showWorkpacketNameEditMenu == false"
              @click="enableEditWorkpacket(workpacket.ID, workpacket.name, workpacket.ID+'li')"
              :class="workpacket.ID+'view-menu'+' workpacket-edit-span'"
            ><pencil-outline class="material-icons"/></span>
          </div>
        </ul>
        <!-- Workpacket-Edit-Menu -->
        <input
          id="inAddWorkpacket"
          maxlength="45"
          size="5"
          minlength="1"
          placeholder="Arbeitspaket (max. 45 Zeichen)"
        />
        <span id="spanAddWorkpacket" v-on:click="addWorkpacket()">Hinzufügen</span>
        <br />
        <span
          v-on:click="showWorkpacketMenu(false)"
          class="workpacket-edit-outer-span"
          id="spanCloseAddWorkpacket"
        >Schließen</span>
      </div>

      <!-- WORKTABLE -->
      <table id="worktable" class="table is-fullwidth">
        <tr>
          <th>Von</th>
          <th>Bis</th>
          <th>Nutzer</th>
          <th>Arbeitspaket</th>
        </tr>

        <tr v-for="worktime in worktimes" v-bind:key="worktime.worktableID">
          <td>
            <div class="columns">
              <div class="column col-date">
                <input
                  size="10"
                  maxlength="10"
                  :id="worktime.worktableID+'dateOfStart'"
                  class="live-edit-input"
                  v-on:focus="saveInitialVal(worktime.worktableID+'dateOfStart')"
                  v-on:input="reactToUpdate(worktime.worktableID+'dateOfStart')"
                  :value="worktime.getDateOfStart()"
                  :disabled="timerRunning == true"
                />
                <div class="save-or-reset" hidden>
                  <span
                    v-on:click="reactToSave(worktime.worktableID+'dateOfStart', worktime)"
                    class="save"
                  >Speichern</span>
                  <span
                    v-on:click="reactToReset(worktime.worktableID+'dateOfStart')"
                    class="reset"
                  >Zurück</span>
                </div>
              </div>
              <div class="column col-worktime">
                <input
                  maxlength="5"
                  :id="worktime.worktableID+'worktimeOfStart'"
                  class="live-edit-input input-worktime"
                  v-on:focus="saveInitialVal(worktime.worktableID+'worktimeOfStart')"
                  v-on:input="reactToUpdate(worktime.worktableID+'worktimeOfStart')"
                  :value="worktime.getWorktimeOfStart()"
                  :disabled="timerRunning == true"
                />
                <div class="save-or-reset" hidden>
                  <span
                    v-on:click="reactToSave(worktime.worktableID+'worktimeOfStart', worktime)"
                    class="save"
                  >Speichern</span>
                  <span
                    v-on:click="reactToReset(worktime.worktableID+'worktimeOfStart')"
                    class="reset"
                  >Zurück</span>
                </div>
              </div>
            </div>
          </td>

          <td>
            <div class="columns">
              <div class="column">
                <input
                  size="10"
                  maxlength="10"
                  :id="worktime.worktableID+'dateOfStop'"
                  class="live-edit-input"
                  v-on:focus="saveInitialVal(worktime.worktableID+'dateOfStop')"
                  v-on:input="reactToUpdate(worktime.worktableID+'dateOfStop')"
                  :value="worktime.getDateOfStop()"
                  :disabled="timerRunning == true"
                />
                <div class="save-or-reset" hidden>
                  <span
                    v-on:click="reactToSave(worktime.worktableID+'dateOfStop', worktime)"
                    class="save"
                  >Speichern</span>
                  <span
                    v-on:click="reactToReset(worktime.worktableID+'dateOfStop')"
                    class="reset"
                  >Zurück</span>
                </div>
              </div>
              <div class="column">
                <input
                  maxlength="5"
                  :id="worktime.worktableID+'worktimeOfStop'"
                  class="live-edit-input input-worktime"
                  v-on:focus="saveInitialVal(worktime.worktableID+'worktimeOfStop')"
                  v-on:input="reactToUpdate(worktime.worktableID+'worktimeOfStop')"
                  :value="worktime.getWorktimeOfStop()"
                  :disabled="timerRunning == true"
                />
                <div class="save-or-reset" hidden>
                  <span
                    v-on:click="reactToSave(worktime.worktableID+'worktimeOfStop', worktime)"
                    class="save"
                  >Speichern</span>
                  <span
                    v-on:click="reactToReset(worktime.worktableID+'worktimeOfStop')"
                    class="reset"
                  >Zurück</span>
                </div>
              </div>
            </div>
          </td>

          <td>
            <p>{{ worktime.username }}</p>
          </td>

          <td :id="worktime.workpacketID" class="workpacket-row">
            <p class="pWorkpacketName">{{ worktime.workpacket }}</p>
            <span :id="worktime.worktableID+'notify-affection'"></span>
            <div class="workpacket-change-menu" v-if="showWorkpacketEditAndViewMenu == false">
              <span
                v-on:click="showWorkpacketMenu(true, worktime.workpacketID, worktime.worktableID)"
                class="change-btn"
              >Ändern</span>
            </div>
          </td>

          <td v-if="showTextualDeleteWorktimeMenu == true">
            <span class="delete-worktime-span" @click="deleteWorktime(worktime.worktableID)">X</span>
          </td>
        </tr>
      </table>

      <!-- Load more button -->
      <div
        v-if="numberOfLoadableWorktimes-currentWorktimeLoadLimit > 0"
        id="pLoadWorktimes"
        @click="loadMoreWorktimes()"
      >
        Es sind noch {{ numberOfLoadableWorktimes-currentWorktimeLoadLimit }} Arbeitszeiteinträge vorhanden.
        Weitere {{ worktimeLoadLimit }} laden.
      </div>

      <transition
        enter-active-class="animated fadeInRight"
        leave-active-class="animated fadeOutRight"
      >
        <div
          v-if="showSlidingNotification == true && slidingNotificationContent == 0"
          class="sliding-notification box"
        >
          <p>
            Zeitaufzeichnung eingetragen!
            <check-circle-outline :size="18" fillColor="green" class="material-icons"></check-circle-outline>
          </p>
        </div>
        <div
          v-if="showSlidingNotification == true && slidingNotificationContent == 1"
          class="sliding-notification box"
        >
          <p>
            Zeitaufzeichnung läuft bereits!
            <close-circle-outline :size="18" fillColor="red" class="material-icons"></close-circle-outline>
          </p>
        </div>
        <div
          v-if="showSlidingNotification == true && slidingNotificationContent == 2"
          class="sliding-notification box"
        >
          <p>
            Ungültige Eingabewerte!
            <close-circle-outline :size="18" fillColor="red" class="material-icons"></close-circle-outline>
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>


<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             SCRIPT                  ################
#####################################################################################
--------------------------------------------------------------------------------------
-->


<script>
import Vue from "vue";
import Buefy from "buefy";
const { dialog } = require("electron").remote;
const s2tdb = require("../../internal/s2tDB");
const s2tStateParser = require("../../internal/s2tStateParser");
const $ = require("jquery");
const getAnalyzer = require("../internal/getAnalyzer");
import Play from "../../../node_modules/vue-material-design-icons/Play.vue";
import Stop from "../../../node_modules/vue-material-design-icons/Stop.vue";
import CheckCircleOutline from "../../../node_modules/vue-material-design-icons/CheckCircleOutline.vue";
import CloseCircleOutline from "../../../node_modules/vue-material-design-icons/CloseCircleOutline.vue";
import PencilOutline from "../../../node_modules/vue-material-design-icons/PencilOutline.vue";
import moment from "moment";

/**
--------------------------------------------------------------------------------------

Worktime - Constructor

--------------------------------------------------------------------------------------
**/
/**
 * @param {*} start Start date
 * @param {*} stop End date
 * @param {*} username User of the worktime
 * @param {*} workpacket Name of the workpacket
 */
function Worktime(
  start,
  stop,
  username,
  workpacket,
  workpacketID,
  worktableID
) {
  this.start = start;
  this.stop = stop;
  this.username = username;
  this.workpacket = workpacket;

  //DB related attributes
  this.workpacketID = workpacketID;
  this.worktableID = worktableID;

  //Functions
  this.getDateOfStart = function() {
    return `${start.getDate()}.${start.getMonth() + 1}.${start.getFullYear()}`;
  };
  this.getMYSQLDateOfStart = function() {
    return `${start.getFullYear()}-${(start.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${start
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };
  this.getDateOfStop = function() {
    return `${stop.getDate()}.${stop.getMonth() + 1}.${stop.getFullYear()}`;
  };
  this.getMYSQLDateOfStop = function() {
    return `${stop.getFullYear()}-${(stop.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${stop
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  this.getWorktimeOfStart = function() {
    return `${start
      .getHours()
      .toString()
      .padStart(2, "0")}:${start
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };
  this.getWorktimeOfStop = function() {
    return `${stop
      .getHours()
      .toString()
      .padStart(2, "0")}:${stop
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  this.getWorktime = function() {
    var fromSplitted = this.from.split(":")[0] * 60;
    var toSplitted = this.to.split(":")[0] * 60;
    var min =
      fromSplitted[0] * 60 +
      fromSplitted[1] +
      toSplitted[0] * 60 +
      toSplitted[1];
    return min;
  };
}

/**
--------------------------------------------------------------------------------------

Workpacket - Constructor

--------------------------------------------------------------------------------------
**/
function Workpacket(ID, name) {
  this.ID = ID;
  this.name = name;
}

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/
function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function toMYSQLDateTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hours = date
    .getHours()
    .toString()
    .padStart(2, "0");
  var minutes = date
    .getMinutes()
    .toString()
    .padStart(2, "0");
  var seconds = date
    .getSeconds()
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
--------------------------------------------------------------------------------------

Vue

--------------------------------------------------------------------------------------
**/

function readWorktimes(projectID, userID, worktimeLoadLimit, callback) {
  var stmt = `
    SELECT wt_start, wt_stop, wo_name, u_username, wt_id, wo_id FROM wt_worktable
    INNER JOIN u_users ON wt_u_id = u_id
    LEFT JOIN wo_workpackets ON wt_worktable.wt_wo_id = wo_workpackets.wo_id
    WHERE
      wt_p_id = ${projectID} AND wt_u_id = ${userID} AND wt_stop is not null
    ORDER BY UNIX_TIMESTAMP(wt_start) DESC
    LIMIT ${worktimeLoadLimit};
  `;

  s2tdb.connect().query(stmt, (err, results) => {
    if (err) {
      callback(err, null);
    }
    var worktimes = [];
    for (let i = 0; i < results.length; i++) {
      var worktime = new Worktime(
        results[i].wt_start,
        results[i].wt_stop,
        results[i].u_username,
        results[i].wo_name,
        results[i].wo_id,
        results[i].wt_id
      );
      worktimes.push(worktime);
    }
    callback(null, worktimes);
  });
}

function readWorkpackets(projectID, callback) {
  var stmt = `
    SELECT wo_id, wo_name
    FROM wo_workpackets
    WHERE wo_p_id = ${projectID};
  `;

  var workpackets = [];
  s2tdb.connect().query(stmt, (err, result) => {
    if (err) {
      callback(err, null);
    }
    for (let workpacket of result) {
      workpackets.push(new Workpacket(workpacket.wo_id, workpacket.wo_name));
    }
    callback(null, workpackets);
  });
}

/**
 * Saves a worktime in the database and notify the user about user-related errors
 */
function saveIntoWorktable(tagID, worktimeObj, callback) {
  for (let key of backup.keys()) {
    //Check for backup. Was the initial value saved to backup? Answer should always be yes.
    if (key == tagID) {
      var newValue = $(`#${tagID}`).val(); //Get new modified value

      //Create individiual update statement
      var stmt = ``;

      //Date changed
      if (tagID.includes("date")) {
        //Format user input to MYSQL-DATETIME-FORMAT YYYY-MM-DD HH:MM:SS
        //Important: seconds will be omitted
        var splittedNewValue = newValue.split(".");
        for (let i = 0; i < splittedNewValue.length; i++) {
          splittedNewValue[i] = splittedNewValue[i].toString().padStart(2, "0");
        }
        var mysql_formatted_newValue = `${splittedNewValue[2]}-${splittedNewValue[1]}-${splittedNewValue[0]}`; //Format input value to MySQL-Datetime Format YYYY-MM-DD HH:MM //NOTE: Seconds are omitted

        //Create individual SQL statement
        if (tagID.includes("OfStart")) {
          var newDate = new Date(
            `${mysql_formatted_newValue} ${worktimeObj.getWorktimeOfStart()}:00`
          );

          //Is the date created with user input invalid?
          if (newDate instanceof Date && isNaN(newDate.valueOf())) {
            dialog.showErrorBox(
              "Ungültige Daten",
              `${newValue} ist keine gültige Eingabe.`
            );
            callback();
            return;
          }
          if (newDate < worktimeObj.stop) {
            stmt = `
                UPDATE wt_worktable 
                SET wt_start = '${mysql_formatted_newValue} ${worktimeObj.getWorktimeOfStart()}:00'
                WHERE wt_id = ${worktimeObj.worktableID};
                `;
          } else {
            dialog.showErrorBox(
              "Anfangsdatum Überschreitung",
              "Das Startdatum muss vor dem Enddatum sein"
            );
            callback();
            return;
          }
        } else if (tagID.includes("OfStop")) {
          var newDate = new Date(
            `${mysql_formatted_newValue} ${worktimeObj.getWorktimeOfStop()}:00`
          );

          //Is the date created with user input invalid?
          if (newDate instanceof Date && isNaN(newDate.valueOf())) {
            dialog.showErrorBox(
              "Ungültige Daten",
              `${newValue} ist keine gültige Eingabe.`
            );
            callback();
            return;
          }
          if (newDate > worktimeObj.start) {
            stmt = `
                UPDATE wt_worktable 
                SET wt_stop = 
                '${mysql_formatted_newValue} ${worktimeObj.getWorktimeOfStop()}:00'
                WHERE wt_id = ${worktimeObj.worktableID};
                `;
          } else {
            dialog.showErrorBox(
              "Enddatum Unterschreitung",
              "Das Enddatum muss größer als das Startdatum sein."
            );
            callback();
            return;
          }
        }
      }
      //Worktime changed
      else if (tagID.includes("worktime")) {
        if (tagID.includes("OfStart")) {
          var newDate = new Date(
            `${worktimeObj.getMYSQLDateOfStart()} ${newValue}:00`
          );

          //Is the date created with user input invalid?
          if (newDate instanceof Date && isNaN(newDate.valueOf())) {
            dialog.showErrorBox(
              "Ungültige Daten",
              `${newValue} ist keine gültige Eingabe.`
            );
            callback();
            return;
          }

          //Create individual SQL statement
          if (newDate < worktimeObj.stop) {
            stmt = `
              UPDATE wt_worktable 
              SET wt_start = '${worktimeObj.getMYSQLDateOfStart()} ${newValue}:00'
              WHERE wt_id = ${worktimeObj.worktableID};
            `;
          } else {
            dialog.showErrorBox(
              "Anfangszeit Überschreitung",
              "Die Startzeit muss vor der Endzeit sein"
            );
            callback();
            return;
          }
        } else if (tagID.includes("OfStop")) {
          var newDate = new Date(
            `${worktimeObj.getMYSQLDateOfStop()} ${newValue}:00`
          );

          //Is the date created with user input invalid?
          if (newDate instanceof Date && isNaN(newDate.valueOf())) {
            dialog.showErrorBox(
              "Ungültige Daten",
              `${newValue} ist keine gültige Eingabe.`
            );
            callback();
            return;
          }
          if (newDate > worktimeObj.start) {
            stmt = `
                  UPDATE wt_worktable 
                  SET wt_stop = '${worktimeObj.getMYSQLDateOfStop()} ${newValue}:00'
                  WHERE wt_id = ${worktimeObj.worktableID};
                  `;
          } else {
            dialog.showErrorBox(
              "Endzeit Unterschreitung",
              "Die Endzeit muss größer als die Startzeit sein"
            );
            callback();
            return;
          }
        }
      }

      //Issue UPDATE-Query
      s2tdb.connect().query(stmt, (err, result) => {
        if (err) {
          if (err.code == "ER_TRUNCATED_WRONG_VALUE") {
            console.log(
              `User entered invalid input. Please refer to S2T-Help. Query: ${stmt}`
            );
            dialog.showErrorBox(
              "Ungültige Daten",
              "Bitte überprüfen Sie Ihre Eingabe."
            );
            callback();
          } else {
            console.error(
              `Update failed. Most likely a database connection could not be established: ${err.code} of the Query: ${stmt}`
            );
            callback();
          }
        } else if (result.affectedRows == 1) {
          console.log(`Succesfully updated. Query: ${stmt}`);
          callback();
        }
      });
      //Log
      console.log(`Save was issued by tag:${tagID}. New value is:${newValue}.`);
      //Hide Save-Or-Reset menu
      $(`#${tagID}`)
        .next(".save-or-reset")
        .hide();
    }
  }
}

/**
--------------------------------------------------------------------------------------

Important Variables

--------------------------------------------------------------------------------------
**/
var backup = new Map(); //To save initial value of the Live-Edit enabled spans
var workpacketIntermediateStore = []; //To save the WorktableID after spanAddWorkpacket was clicked

/**
--------------------------------------------------------------------------------------

Vue SFC Export

--------------------------------------------------------------------------------------
**/

require("moment/locale/de");

Vue.use(Buefy, {
  defaultDayNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  defaultMonthNames: [
    "Jänner",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
  ]
});

export default {
  components: {
    Play,
    Stop,
    CheckCircleOutline,
    CloseCircleOutline,
    PencilOutline
  },
  data: () => {
    return {
      date: new Date(),

      worktimes: [],
      workpackets: [],
      showWorkpacketEditAndViewMenu: false,

      startDate: null,
      elapsedTimeRepresentation: null,
      timerID: null,

      showSideMenu: true,
      showTextualAddWorktimeMenu: false,
      showTextualDeleteWorktimeMenu: false,

      fromTextualTime: null,
      toTextualTime: null,

      showWorkpacketNameEditMenu: false, //Only one workpacket may be edited at the same time

      numberOfLoadableWorktimes: null,
      initialWorktimeLoadLimit: 5,
      worktimeLoadLimit: 5, //may be changed ONLY programmatically
      currentWorktimeLoadLimit: 12, //just set the initial val (must be the same as worktimeLoadLimit), this property gets incremented at runtime

      timerRunning: false,

      showSlidingNotification: null,
      slidingNotificationContent: "",

      loaded: false
    };
  },
  async created() {
    this.checkStartTimeState();
    this.getWorktimes();
    this.getWorkpackets();
    this.getNumberOfLoadableWorktimes();
    this.returnNow();
    this.setLoaded();
  },
  methods: {
    moment,
    // Ignoring seconds for text time entry
    returnNow() {
      var date = new Date()
      date.setSeconds(0, 0);
      this.fromTextualTime = date;
      this.toTextualTime = date;
    },
    setLoaded() {
      this.loaded = true;
    },
    getWorktimes() {
      readWorktimes(
        getAnalyzer.getParams(0),
        getAnalyzer.getParams(1),
        this.currentWorktimeLoadLimit,
        (err, data) => {
          if (err) {
            console.error(`Worktimes could not be retrieved. ${err}`);
          } else {
            this.worktimes = data;
            console.log(`Worktimes successfully retrieved/refreshed`);
          }
        }
      );
    },
    getWorkpackets() {
      readWorkpackets(getAnalyzer.getParams(0), (err, result) => {
        if (err) {
          console.error(err);
        } else {
          this.workpackets = result;
          console.log(`Workpackets successfully retrieved/refreshed`);
        }
      });
    },
    getNumberOfLoadableWorktimes() {
      var stmt = `
      SELECT COUNT(*) AS 'numberOfLoadableWorktimes' FROM wt_worktable
      WHERE wt_p_id = ${getAnalyzer.getParams(
        0
      )} AND wt_u_id = ${getAnalyzer.getParams(1)}
      AND wt_stop is not null;
      `;
      s2tdb.connect().query(stmt, (err, result) => {
        if (err) {
          console.error(
            `Could not retrieve numberOfLoadableWorktimes. Err:${err}`
          );
        } else {
          this.worktimeLoadLimit = this.initialWorktimeLoadLimit; //worktimeLoadLimit may have changed
          this.numberOfLoadableWorktimes = result[0].numberOfLoadableWorktimes;

          //This if statement is necessarily for UI demands
          if (
            this.numberOfLoadableWorktimes - this.currentWorktimeLoadLimit <=
            this.worktimeLoadLimit
          ) {
            this.worktimeLoadLimit =
              this.numberOfLoadableWorktimes - this.currentWorktimeLoadLimit;
            console.log(
              `NumberOfLoadableWorktimes is lesser than worktimeLoadLimit adjusted worktimeLoadLimit to ${this.worktimeLoadLimit}`
            );
          } else {
            console.log(
              `NumberOfLoadableWorktimes ${this.numberOfLoadableWorktimes} successfully retrieved/refreshed`
            );
          }
        }
      });
    },
    loadMoreWorktimes() {
      this.currentWorktimeLoadLimit =
        this.currentWorktimeLoadLimit + this.worktimeLoadLimit;

      this.refresh();

      console.log(
        `CurrentWorktimeLoadLimit increased by ${this.worktimeLoadLimit} resulting to ${this.currentWorktimeLoadLimit}`
      );
    },
    refresh() {
      this.getWorktimes();
      this.getWorkpackets();
      this.getNumberOfLoadableWorktimes();
    },
    saveInitialVal: function(tagID) {
      //Save the initial value at index 0 and the tag attribute 'ID' of the input at index 1
      var initialVal = $(`#${tagID}`).val();
      backup.set(tagID, initialVal);
      console.log(`Backup was set with key:${tagID} and value:${initialVal}`);
    },
    reactToUpdate: function(tagID) {
      if (
        $(`#${tagID}`)
          .next(".save-or-reset")
          .is(":hidden")
      ) {
        $(`#${tagID}`)
          .next(".save-or-reset")
          .show();
        console.log(`Opened .save-or-reset menu for tag:${tagID}`);
      }
    },
    reactToSave: function(tagID, worktimeObj, callback) {
      saveIntoWorktable(tagID, worktimeObj, () => {
        //Update data objects
        //this.getWorktimes(); //Refreshing data set. Initial value may be set when no succesfull SQL statement was issued
      });
    },
    reactToReset: function(tagID) {
      for (let key of backup.keys()) {
        if (key == tagID) {
          $(`#${tagID}`).val(backup.get(tagID));
          $(`#${tagID}`)
            .next(".save-or-reset")
            .hide();
        }
      }
    },
    showWorkpacketMenu: function(show, workpacketID, worktableID) {
      //Show Workpacket-Edit-View-Menu
      this.showWorkpacketEditAndViewMenu = show;

      //Show/Remove Notify Affection and reset showWorkpacketNameEditMenu
      if (show) {
        $(`#${worktableID}notify-affection`).html("🖉");
      } else {
        this.showWorkpacketNameEditMenu = false;
        $(`#${workpacketIntermediateStore[0]}notify-affection`).html("");
      }

      //Wait until render is finished
      Vue.nextTick().then(function() {
        if (show == true) {
          //Execute when only shown
          var selectedWorkpacketFromWorktable = $(`#${workpacketID} p`).text();

          //Highlight initial selected workpacket
          var initialSelectedElem = $(`#${workpacketID}li`);
          initialSelectedElem.attr("userselected", "true");
          initialSelectedElem.html(
            `<strong>${selectedWorkpacketFromWorktable}</strong> ausgewählt`
          );

          //Save selected workpacket into intermediate store
          workpacketIntermediateStore[0] = worktableID;
          console.log(`Intermediate Store: ${workpacketIntermediateStore[0]}`);
        }
      });
    },
    reactToSelect: function(workpacketID) {
      var lastSelectedElem = $(`#${workpacketID}li[userselected='true']`); //Assignment needs to be initially done, because the needed userselected attribute gets removed further down the code
      //Remove highlight of last selected element
      var lastSelectedElem = $(`li[userselected='true']`); //workpacketID of lastSelectedElem is unknown. Therefore query by userselected attribute
      lastSelectedElem.removeAttr("userselected");
      lastSelectedElem.html(lastSelectedElem.text().replace("ausgewählt", ""));

      //Get the ID of lastSelectedElem
      var idOfLastSelectedElem =
        typeof lastSelectedElem.attr("id") === "undefined"
          ? ""
          : lastSelectedElem.attr("id");

      //Was the same workpacket clicked as the previous selected one?
      if (idOfLastSelectedElem.includes(workpacketID)) {
        var stmt = `
                UPDATE wt_worktable
                SET wt_wo_id = null
                WHERE wt_id = ${workpacketIntermediateStore[0]};
                `;
        s2tdb.connect().query(stmt, err => {
          if (err) {
            console.error(
              `Error deselecting previously selected workpacket with ID:${workpacketID}. Query:${stmt}`
            );
          } else {
            console.log(
              `Successfully deselected previously selected workpacket with ID:${workpacketID}. Query:${stmt}`
            );
          }
        });
      } else {
        //Highlight new selected element
        var selectedElem = $(`#${workpacketID}li`);
        selectedElem.attr("userselected", "true");
        selectedElem.html(`<strong>${selectedElem.text()}</strong> ausgewählt`);

        //Issue SQL-Update-Statemt
        var stmt = `
                UPDATE wt_worktable 
                SET wt_wo_id = ${workpacketID}
                WHERE wt_id = ${workpacketIntermediateStore[0]}
              `;
        s2tdb.connect().query(stmt, (err, result) => {
          if (err) {
            console.error(
              `Error updating workpacket assignment to worktable ${workpacketIntermediateStore[0]}`
            );
          }
          console.log(`Successfully updated workpacket with query: ${stmt}`);
        });
      }
      this.getWorktimes();
    },
    deleteWorkpacket(workpacketID) {
      var stmt = `
      START TRANSACTION;
        UPDATE wt_worktable
        SET wt_wo_id = null
        WHERE wt_wo_id = ${workpacketID};

        DELETE FROM wo_workpackets
        WHERE wo_id = ${workpacketID};
      COMMIT;
      `;
      s2tdb.connect().query(stmt, err => {
        if (err) {
          console.error(
            `Couldn't delete workpacket with ID:${workpacketID}. ${err}`
          );
        } else {
          console.log(
            `Successfully deleted workpacket with ID:${workpacketID}`
          );
          this.refresh();
        }
      });
    },
    addWorkpacket: function() {
      var workpacketName = $(`#inAddWorkpacket`).val();
      if (workpacketName.length == 0) {
        console.log("A new workpacket can not be created with an empty string");
        return;
      }
      var stmt = `
        INSERT INTO wo_workpackets (wo_name, wo_p_id)
        VALUES ('${workpacketName}', ${getAnalyzer.getParams(0)});
      `;
      s2tdb.connect().query(stmt, err => {
        if (err) {
          console.error(
            `Workpacket '${workpacketName}' could not be created. Stmt: ${stmt}`
          );
        } else {
          console.log(
            `Created workpacket '${workpacketName}' for project:${getAnalyzer.getParams(
              0
            )}`
          );
          $("#inAddWorkpacket").val("");
          //Update workpacket data
          this.getWorkpackets();
        }
      });
    },
    enableEditWorkpacket(workpacketID, workpacketname, tagID) {
      //Create temporary replacement html to enable editing
      var replacementHTML = `
      <div id="edit-mode-view-menu">
              <input class="input-edit-workpacket" placeholder="Arbeitspaket (max. 45 Zeichen)" style="outline: none; border:none; border-bottom: 1px solid #06beb6;" value="${workpacketname}">
              <span id="spRenameWP" style="cursor: pointer" >Umbennen</span>
              <span id="spCancelRenameWP" style="cursor: pointer; margin-left: 10px;">Abbrechen</span>
          
          <style>
              #spRenameWP{
                cursor: pointer;
                
                background: #06beb6; /* fallback for old browsers */
                background: -webkit-linear-gradient(to right, #48b1bf, #06beb6); /* Chrome 10-25, Safari 5.1-6 */
                background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
              
                color: white; 
                
                padding: 5px;
                border-radius: 15px;
                margin-bottom: 10px;
              }
              #spCancelRenameWP{
                cursor: pointer;
                margin-left: 13px;

                background-color: lightgrey;

                padding: 5px;
                border-radius: 15px;
              }
              #spRenameWP:hover, #spCancelRenameWP:hover{
                -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
                -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
                box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
              }
          </style>
      </div>
      `;

      //Save old html as it will be used later to restore the view-edit-menu
      var old = $(`#${workpacketID}workpacket-wrapper`).replaceWith(
        replacementHTML
      );
      $(`.${workpacketID}view-menu`).remove();
      this.showWorkpacketNameEditMenu = true;

      //Register event handler for rename
      $("#spRenameWP").click(event => {
        var inputVal = $(".input-edit-workpacket").val();
        if (inputVal.length > 0) {
          var stmt = `
            UPDATE wo_workpackets
            SET wo_name = '${inputVal}'
            WHERE wo_id = ${workpacketID};
          `;
          s2tdb.connect().query(stmt, err => {
            if (err) {
              console.error(
                `Failed to rename workpacket with stmt:${stmt}. Err:${err}`
              );
            } else {
              console.log(`Succesfully renamend workpacket with ID:${stmt}`);
            }
            old.find("strong").html($(".input-edit-workpacket").val());
            $("#edit-mode-view-menu").replaceWith(old);
            this.showWorkpacketNameEditMenu = false;
            this.refresh();
          });
        }
      });

      //Register event handler for cancel
      $("#spCancelRenameWP").click(() => {
        $(`#edit-mode-view-menu`).replaceWith(old);
        this.showWorkpacketNameEditMenu = false;
        this.getWorkpackets();
      });
    },
    runTimer() {
      if (this.startDate != null) {
        var runningDate = new Date();
        var differenceInSeconds =
          (runningDate.getTime() - this.startDate.getTime()) / 1000;
        var seconds = Math.floor(differenceInSeconds % 60)
          .toString()
          .padStart(2, "0");
        var minutes = Math.floor((differenceInSeconds / 60) % 60)
          .toString()
          .padStart(2, "0");
        var hours = Math.floor((differenceInSeconds / 60 / 60) % 60)
          .toString()
          .padStart(2, "0");

        this.elapsedTimeRepresentation = `${hours}:${minutes}:${seconds}`;
      }
    },
    async startRunningTime(time) {
      //Set Timer on 00:00:00 so it loads as fast as possible
      this.elapsedTimeRepresentation = `00:00:00`;
      var context = this;
      if (time == null && (await this.isOtherTimeRunning())) {
        this.startDate = new Date();
        this.timerRunning = true;
        var stmt = `
                INSERT INTO wt_worktable
                (wt_p_id, wt_start, wt_stop, wt_u_id)
                VALUES( 
                ${getAnalyzer.getParams(0)}, 
                '${toMYSQLDateTime(this.startDate)}', 
                null,
                '${getAnalyzer.getParams(1)}' 
                );`;
        s2tdb.connect().query(stmt, function(err, data) {
          if (err) throw err;
          this.timerID = setInterval(function() {
            context.runTimer();
          }, 1000);
        });
      } else if (time != null) {
        this.startDate = new Date(time);
        this.timerRunning = true;
        this.timerID = setInterval(function() {
          context.runTimer();
        }, 1000);
      } else {
        this.showTimerRunningNotification();
        this.elapsedTimeRepresentation = null;
      }
    },
    isOtherTimeRunning() {
      var p = new Promise((resolve, reject) => {
        s2tdb.connect().query(
          `SELECT 1 FROM wt_worktable 
                  WHERE wt_stop is null 
                  AND wt_u_id = ${getAnalyzer.getParams(1)}
                  AND wt_p_id not like ${getAnalyzer.getParams(0)}`,
          function(err, data) {
            if (err) reject(err);
            if (data.length <= 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
      });
      return p;
    },
    checkStartTimeState() {
      var context = this;
      var stmt = `SELECT UNIX_TIMESTAMP(wt_start) as startTime, wt_start FROM wt_worktable WHERE wt_stop is null AND wt_u_id = ${getAnalyzer.getParams(
        1
      )} AND wt_p_id = ${getAnalyzer.getParams(0)}`;
      s2tdb.connect().query(stmt, function(err, data) {
        if (err) throw err;
        if (data.length > 0) {
          // Convert from unix timestamp to js time
          context.startRunningTime(data[0].startTime * 1000);
        }
      });
    },
    stopRunningTime() {
      //Stop Interval
      clearInterval(this.timerID);
      this.timerRunning = false;

      //Adding new Worktime
      var stoppedDate = new Date();
      var stmt = `
        UPDATE wt_worktable
        SET wt_stop = '${toMYSQLDateTime(stoppedDate)}'
        WHERE wt_p_id = ${getAnalyzer.getParams(0)}
        AND wt_start = '${toMYSQLDateTime(this.startDate)}'
        AND wt_u_id = ${getAnalyzer.getParams(1)}`;

      s2tdb.connect().query(stmt, err => {
        if (err) {
          console.error(
            `Timer initiated Worktable Action threw an error. Query:${stmt} Error:${err}`
          );
        } else {
          console.log(
            `Timer initiated Worktable Action was successful. Query:${stmt}`
          );
          this.refresh();
        }
      });

      //Cleanup
      this.startDate = null;
      this.elapsedTimeRepresentation = null;
      this.timerID = null;

      this.showWorktimeEntryNotification();
    },
    showWorktimeEntryNotification() {
      this.slidingNotificationContent = 0;
      this.showNotification();
    },
    showTimerRunningNotification() {
      this.slidingNotificationContent = 1;
      this.showNotification();
    },
    showInvalidInputNotification() {
      this.slidingNotificationContent = 2;
      this.showNotification();
    },
    showNotification() {
      this.showSlidingNotification = true;
      var context = this;
      setTimeout(() => {
        context.showSlidingNotification = false;
      }, 3000);
    },
    setTextualAddWorktimeMenuVisibility(show) {
      this.showSideMenu = !show; //Hides SideMenu
      this.showTextualAddWorktimeMenu = show;
    },
    setTextualDeleteWorktimeMenuVisbility(show) {
      this.showSideMenu = !show; //Hides SideMenu
      this.showTextualDeleteWorktimeMenu = show;
    },
    addTextualWorktime() {
      var start = this.fromTextualTime; //$("#inTextualVon").val(); //fromTextualTime
      var stop = this.toTextualTime; //$("#inTextualBis").val(); //toTextualTime
      console.log(start, stop);
      if (start != null && stop != null) {
        var stmt = `
          INSERT INTO wt_worktable
          (wt_p_id, wt_start, wt_stop, wt_u_id)
          VALUES(
            ${getAnalyzer.getParams(0)},
            '${toMYSQLDateTime(start)}',
            '${toMYSQLDateTime(stop)}',
            ${getAnalyzer.getParams(1)}
          );
        `;
        s2tdb.connect().query(stmt, err => {
          if (err) {
            dialog.showErrorBox(
              `Beim Hinzufügen ist ein Fehler aufgetreten`,
              "Bitte versuchen Sie es erneut"
            );
            console.error(
              `Failed to insert textual initiated worktime. Query:${stmt}`
            );
          } else {
            console.log(
              `Successfully inserted textual initiated worktime. Query: ${stmt}`
            );
            this.setTextualAddWorktimeMenuVisibility(false);
            this.showSideMenu = true;
            this.showWorktimeEntryNotification();
            this.refresh();
          }
        });
      } else {
        console.error(
          `Failed to insert worktime. Start or Stop dates were not filled`
        );
        this.showInvalidInputNotification();
      }
    },
    deleteWorktime(worktableID) {
      var stmt = `
        DELETE FROM wt_worktable
        WHERE wt_id = ${worktableID};
      `;

      s2tdb.connect().query(stmt, err => {
        if (err) {
          console.error(
            `Worktime could not be deleted with ID:${worktableID}${err}`
          );
        } else {
          console.log(`Successfully deleted worktime with ID:${worktableID}`);
        }
      });

      this.getWorktimes();
      this.getNumberOfLoadableWorktimes();
    }
  }
};
</script>


<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             STYLE                  #################
#####################################################################################
--------------------------------------------------------------------------------------
-->



<style scoped>
@import url("../../../node_modules/bulma/css/bulma.min.css");
@import url("../../../node_modules/animate.css/animate.min.css");
@import url("../../../node_modules/animate.css/source/sliding_entrances/slideInLeft.css");
@import url("../../../node_modules/animate.css/source/sliding_entrances/slideInRight.css");
@import url("../../../node_modules/animate.css/source/sliding_exits/slideOutRight.css");
@import url("../../../node_modules/animate.css/source/fading_entrances/fadeInRight.css");
@import url("../../../node_modules/animate.css/source/fading_exits/fadeOutRight.css");
@import url("../../../node_modules/buefy/dist/buefy.min.css");
@import url("../../../node_modules/@mdi/font/css/materialdesignicons.min.css");

/** y                                                                                          
----------------------------------------------------------------------------------
-----------------------------------     Worktable   ------------------------------
----------------------------------------------------------------------------------
 */

#worktable {
  margin-top: 40px;
}

/** 
----------------------------------------------------------------------------------
------------------------------------ LoadWorktimes  ------------------------------
----------------------------------------------------------------------------------
 */

#pLoadWorktimes {
  margin-left: 20px;
  background: lightgrey;
  cursor: pointer;
  display: inline-block;
  padding: 10px;
  margin-bottom: 100px;
}

#pLoadWorktimes:hover {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);

  color: white;
}

/** 
----------------------------------------------------------------------------------
-----------------------------------     Side-Menu   ------------------------------
----------------------------------------------------------------------------------
 */

#side-menu {
  margin-left: 20px;
}

.side-menu-addWorktime {
  padding: 5px;
  border-radius: 30px;
}

.side-menu-deleteWorktime {
  padding: 5px;
  border-radius: 30px;
}

.side-menu-addWorktime:hover {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  color: white;

  cursor: pointer;
}

.side-menu-deleteWorktime:hover {
  background: #ec008c; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  color: white;

  padding: 5px;

  cursor: pointer;
}

/** 
----------------------------------------------------------------------------------
--------------------------------   addWorktimeTextualMenu ------------------------
----------------------------------------------------------------------------------
 */
#addWorktimeTextualMenu {
  margin-left: 20px;
}
.inTextualVon,
.inTextualBis {
  outline: none;
  border: none;
  width: 135px;
}

.input-text {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  color: white;
  /*border-radius: 6px;*/

  cursor: default;
}

#spanShowAddWorktimeTextualMenu,
#spanTextualInsert,
#spanTextualCancel {
  cursor: pointer;
}

#spanTextualInsert {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  color: white;
  padding: 7px;
  border-radius: 20px;
}

#spanTextualCancel {
  background: lightgrey;
  padding: 7px;
  border-radius: 20px;
}

#spanTextualInsert:hover,
#spanTextualCancel:hover {
  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
}

/** 
----------------------------------------------------------------------------------
--------------------------------   deleteWorktimeTextualMenu ------------------------
----------------------------------------------------------------------------------
*/
.textual-menu-cancel-span {
  margin-left: 20px;
  cursor: pointer;

  background: #ec008c; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  color: white;

  top: 100px;

  padding: 7px;
  border-radius: 20px;

  position: fixed;
}

.textual-menu-cancel-span:hover {
  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
}

.delete-worktime-span {
  background-color: lightgrey;

  color: white;

  height: 5px;
  width: 5px;

  font-size: 9px;
  padding: 7px;

  cursor: pointer;
}

.delete-worktime-span:hover {
  background: #ec008c; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
}

/** 
----------------------------------------------------------------------------------
--------------------------------   addWorktimeIconMenu ------------------------
----------------------------------------------------------------------------------
 */

#addWorktimeIconMenu {
  margin-right: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-top: 10px;
  border-radius: 6px;
  right: 0;
  overflow: hidden;
  position: sticky;
  position: fixed;

  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  text-align: center;
}

#spanTimer {
  background: white;
  border-radius: 3px;
  width: 90px;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: bottom;


}

#timerMessage {
  background: white;
  border-radius: 3px;
  width: 110px;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: bottom;
}

.play {
  padding: 0;
  width: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  margin-right: 9px;
  margin-left: 9px;
}

.stop {
  padding: 0;
  width: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  margin-right: 9px;
  margin-left: 9px;
}

.sliding-notification {
  outline: rgba(0, 0, 0, 0.41) 1px;
  border-radius: 10px;
  right: 0;
  bottom: 0;
  margin-right: 20px;
  margin-bottom: 50px;
  position: fixed;
}

.is-vcentered {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

.material-icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

/** 
----------------------------------------------------------------------------------
-----------------------------------     Animations       -------------------------
----------------------------------------------------------------------------------
 */

.showtimer-enter-active,
.showtimer-leave-active {
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
}

.showtimer-enter, .showtimer-leave-to /* .fade-leave-active below version 2.1.8 */ {
  max-width: 0px;
  background: #48b1bf;
}

.showtimer-enter-to,
.showtimer-leave {
  max-width: 90px;
  background: white;
}

.timermessage-enter-active,
.timermessage-leave-active {
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
}

.timermessage-enter, .timermessage-leave-to /* .fade-leave-active below version 2.1.8 */ {
  max-width: 0px;
  background: #48b1bf;
}

.timermessage-enter-to,
.timermessage-leave {
  max-width: 110px;
  background: white;
}

/** 
----------------------------------------------------------------------------------
-------------------- Live-Editing (.live-edit-input & .input-worktime)  ----------
----------------------------------------------------------------------------------
 */

.live-edit-input {
  outline: none;
  border: none;
  font-size: 16px;
}

.live-edit-input:disabled {
  background: transparent;
}

.input-worktime:disabled {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  text-align: center;
  color: white;

  /*width: 60px; FOR FUTURE VERSION */
  width: 40%;
}

.input-worktime {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  text-align: center;
  color: white;

  /*width: 60px; FOR FUTURE VERSION */
  width: 40%;
}

/** 
----------------------------------------------------------------------------------
-------------------- Live-Editing (.save-or.reset)  ------------------------------
----------------------------------------------------------------------------------
 */

.save-or-reset {
  margin-top: 4px;
}

.save-or-reset span {
  cursor: pointer;
}

.save-or-reset {
  width: 100%;
}

.save-or-reset span + span {
  margin-left: 10px; /* Space between the spans */
}

.save-or-reset .save {
  background-color: #6dd5ed;
  color: white;
  font-size: 11px;
  border-radius: 20px;
  padding: 7px;
}

/** 
----------------------------------------------------------------------------------
-------------------- Workpacket Edit-View-Menu ("Ändern related") ----------------
----------------------------------------------------------------------------------
 */
.pWorkpacketName {
  float: left;
}

.workpacket-row:hover .workpacket-change-menu {
  display: block;
}

/** 
----------------------------------------------------------------------------------
-------------------- Workpacket Edit-View-Menu       -----------------------------
----------------------------------------------------------------------------------
 */

#workpacket-edit-view-menu {
  position: sticky;
  border: 1px solid lightgrey;
  background-color: white;
  border-radius: 10px;

  top: 0px;

  min-width: 550px;
  width: 40%;

  margin: 0 auto;

  padding: 30px;

  user-select: none;
}

.workpacket-li {
  display: inline-block;
  margin: 3px;
}

.workpacket-delete-span {
  font-size: 11px;
  padding: 7px;
  border-radius: 40%;

  margin-left: 30px;

  display: none;

  cursor: pointer;

  background: lightgrey;
}

.workpacket-edit-span {
  font-size: 11px;
  padding: 7px;
  border-radius: 15px;

  margin-left: 5px;

  display: none;

  cursor: pointer;

  background: lightgrey;
}

.workpacket-wrapper:hover .workpacket-delete-span {
  display: inline;
}

.workpacket-wrapper:hover .workpacket-edit-span {
  display: inline;
}

.workpacket-delete-span:hover {
  background: #ec008c; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #fc6767,
    #ec008c
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);

  color: white;
}

.workpacket-edit-span:hover {
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
}

.workpacket-change-menu {
  color: #6dd5ed;
  float: right;
  display: none;
  margin-left: 10px;
  cursor: pointer;
}

/** 
----------------------------------------------------------------------------------
-------------------- Workpacket View-Menu       -----------------------------
----------------------------------------------------------------------------------
 */
#workpacket-edit-view-menu li {
  margin-bottom: 10px;
  cursor: pointer;
}

/** 
----------------------------------------------------------------------------------
-------------------- Workpacket Edit       -----------------------------
----------------------------------------------------------------------------------
 */
#inAddWorkpacket {
  outline: none;
  border: none;
  border-bottom: 1px solid #06beb6;
  color: black;
  margin-bottom: 20px;
  min-width: 200px;

  margin-top: 12px;
}

#spanAddWorkpacket,
#spanSelectAddWorkpacket {
  cursor: pointer;
  background: #06beb6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #48b1bf,
    #06beb6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  padding: 5px;
  border-radius: 13px;
  color: white;
}

#spanAddWorkpacket:hover,
#spanSelectAddWorkpacket:hover {
  -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
  box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
}
li {
  cursor: pointer;
}
.workpacket-edit-outer-span {
  cursor: pointer;
}

.user-selected-workpacket {
  font-weight: bold;
}
#spanCloseAddWorkpacket:hover {
  border-bottom: 1px solid black;
}

/** 
----------------------------------------------------------------------------------
--------------------      Loading Screen             -----------------------------
----------------------------------------------------------------------------------
 */

@keyframes ldio-xokqxz8432 {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.ldio-xokqxz8432 div {
  position: absolute;
  animation: ldio-xokqxz8432 0.89s linear infinite;
  width: 86.4px;
  height: 86.4px;
  top: 10.8px;
  left: 10.8px;
  border-radius: 50%;
  box-shadow: 0 3.5640000000000005px 0 0 #6dd5ed;
  transform-origin: 43.2px 44.982px;
}
.loadingio-spinner-eclipse-x0iw4mzxng8 {
  width: 108px;
  height: 108px;
  display: inline-block;
  overflow: hidden;
  background: #ffffff;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.ldio-xokqxz8432 {
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateZ(0) scale(1);
  backface-visibility: hidden;
  transform-origin: 0 0; /* see note above */
}
.ldio-xokqxz8432 div {
  box-sizing: content-box;
}
/* generated by https://loading.io/ */
</style>