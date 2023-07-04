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
      <div v-if="!loaded"  class="ldio-xokqxz8432">
        <div></div>
      </div>
    </div>
    <div v-if="loaded">
      <div id="chartControllers" class="columns is-centered">
        <div class="field column is-narrow">
          <div class="select" v-if="isCurrentUserAdmin >= 1">
            <select
              v-model="selectedUser"
              @change="getWorktimes(), getStatsPerDayMethod(), getStatsPerMonthMethod()"
            >
              <option v-for="member in members" v-bind:key="member.pm_u_id">{{member.u_username}}</option>
            </select>
          </div>
        </div>

        <div class="field column">
          <div class="select">
            <select v-model="selectedWorkpacket" @change="getWorktimes()">
              <option>Alle Arbeitspakete</option>
              <option
                v-for="workpacket in workpackets"
                v-bind:key="workpacket.wo_id"
                v-bind:value="workpacket.wo_id"
              >{{workpacket.wo_name}}</option>
            </select>
          </div>
        </div>

        <div class="field has-addons column">
          <div class="control">
            <chevron-left
              v-if="selectedMonth != 0 && selectedMonth != 1"
              class="button"
              @click="selectedMonth--, getWorktimes()"
            />
            <chevron-left v-if="selectedMonth == 0" class="button" @click="year--, getWorktimes()" />
            <chevron-left
              v-if="selectedMonth == 1"
              class="button"
              @click="year--, selectedMonth = 12, getWorktimes()"
            />
          </div>
          <div class="control">
            <div class="select">
              <select v-model="selectedMonth" @change="getWorktimes()">
                <option
                  v-for="month in months"
                  v-bind:key="month.value"
                  v-bind:value="month.value"
                >{{month.text}}</option>
              </select>
            </div>
          </div>
          <div class="control">
            <input
              class="input year has-text-centered control"
              v-model="year"
              @change="getWorktimes()"
              v-on:keyup.enter="$event.target.blur()"
            />
          </div>
          <div class="control">
            <chevron-right
              v-if="selectedMonth != 0 && selectedMonth != 12"
              class="button"
              @click="selectedMonth++, getWorktimes()"
            />
            <chevron-right
              v-if="selectedMonth == 0"
              class="button"
              @click="year++, getWorktimes()"
            />
            <chevron-right
              v-if="selectedMonth == 12"
              class="button"
              @click="year++, selectedMonth = 1, getWorktimes()"
            />
          </div>
        </div>
      </div>
      <div>
        <worktime-bar v-if="loaded" class="chart" :chart-data="chartdata" :options="options"></worktime-bar>
      </div>
      <div id="avgValues" class="columns is-centered has-text-centered">
        <div class="column is-narrow">
          <h1>Durchschnittliche Arbeitszeit pro Tag</h1>
          <h1 class="label">{{avgPerDay}}</h1>
        </div>
        <div class="is-divider-vertical"></div>
        <div class="column is-narrow">
          <h1>Durchschnittliche Arbeitszeit pro Monat</h1>
          <h1 class="label">{{avgPerMonth}}</h1>
        </div>
      </div>
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
const Vue = require("vue");
const s2tdb = require("../../internal/s2tDB");
const getAnalyzer = require("../internal/getAnalyzer");
const chart = require("chart.js");
const { ipcRenderer } = require("electron");
import WorktimeBar from "./worktimebar.js";
import ArrowLeft from "../../../node_modules/vue-material-design-icons/ArrowLeftBold.vue";
import ArrowRight from "../../../node_modules/vue-material-design-icons/ArrowRightBold.vue";
import ChevronRight from "../../../node_modules/vue-material-design-icons/ChevronRight.vue";
import ChevronLeft from "../../../node_modules/vue-material-design-icons/ChevronLeft.vue";

export default {
  data() {
    return {
      loaded: false,
      members: null,
      workpackets: null,
      isCurrentUserAdmin: null,
      selectedWorkpacket: "Alle Arbeitspakete",
      selectedUser: null,
      chartdata: null,
      options: null,
      year: null,
      avgPerDay: null,
      avgPerMonth: null,
      selectedMonth: 0,
      months: [
        { text: "Alle Monate", value: "0" },
        { text: "Jänner", value: "1" },
        { text: "Februar", value: "2" },
        { text: "März", value: "3" },
        { text: "April", value: "4" },
        { text: "Mai", value: "5" },
        { text: "Juni", value: "6" },
        { text: "Juli", value: "7" },
        { text: "August", value: "8" },
        { text: "September", value: "9" },
        { text: "Oktober", value: "10" },
        { text: "November", value: "11" },
        { text: "Dezember", value: "12" }
      ]
    };
  },
  components: {
    WorktimeBar,
    ChevronLeft,
    ChevronRight
  },
  async mounted() {
    await this.getCurrentUserNameMethod();
    await this.getCurrentYear();
    await this.getWorkpacketsMethod();
    await this.getStatsPerDayMethod();
    await this.getStatsPerMonthMethod();
    await this.getWorktimes(this.selectedUser, this.year, this.selectedMonth);
    await this.getAllProjectMembersMethod();
    await this.isCurrentUserAdminMethod();
    this.setLoaded();
  },

  methods: {
    setLoaded() {
      this.loaded = true;
    },
    async getWorktimes() {
      var context = this;
      var result = [];
      var workMinute;
      var workTime;
      var workHour;
      var stmt = `
        SELECT (UNIX_TIMESTAMP(wt_stop)-UNIX_TIMESTAMP(wt_start)) as time, MONTH(wt_start) as month, YEAR(wt_start) as year, 
        DAY(wt_start) as day, DAY(wt_stop) as stopDay, 
        TIME(wt_start) as startTime, TIME(wt_stop) as stopTime
        FROM wt_worktable JOIN u_users ON wt_u_id = u_id
        WHERE u_username = '${this.selectedUser}' 
        AND YEAR(wt_start) = ${this.year}
        AND wt_p_id = ${getAnalyzer.getParams(0)}
        AND wt_stop is not null 
        `;
      if (this.selectedMonth == 0) {
        if (this.selectedWorkpacket != "Alle Arbeitspakete") {
          stmt = stmt.concat(`AND wt_wo_id = ${this.selectedWorkpacket}`);
        }
        await s2tdb.connect().query(stmt, (err, data) => {
          if (err) throw err;
          else if (data.length > 0) {
            result.length = 12;
            result.fill(0);
            data.forEach(function(item) {
              if (item.time == null) throw err;
              else {
                var time = new Date(item.time*1000);
                // same month & year
                if (item.stopDay >= item.day)
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((time.getUTCDate() - 1) * 24);
                // Case time on start day > or = time on stop day AND not same month/year
                if (item.startTime <= item.stopTime && item.stopDay < item.day)
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((item.stopDay + context.daysInMonth(item.month, item.year) - item.day) * 24);
                // Case time on start day < time on stop day AND not same month/year
                if (item.startTime > item.stopTime && item.stopDay < item.day) 
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((item.stopDay + context.daysInMonth(item.month, item.year) - item.day - 1) * 24);
                
                if (time.getUTCMinutes() <= 6) {
                  workMinute = "0" + Math.floor(time.getUTCMinutes() / 60 * 100); 
                  workTime = `${workHour}.${workMinute.substr(-2)}`;
                } else {
                  workMinute = time.getUTCMinutes() / 60 * 100;
                  workTime = `${workHour}.${workMinute}`;
                }
                result[item.month - 1] += parseFloat(workTime);
              }
            });
          }
          this.chartdata = {
            labels: [
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
            ],
            datasets: [
              {
                label: "Arbeitszeit in Stunden",
                backgroundColor: "#006991",
                data: result
              }
            ]
          };
          this.options = {
            scales: {
              yAxes: [
                {
                  ticks: {
                    suggestedMax: 200
                  }
                }
              ],
              xAxes: [
                {
                  gridLines: {
                    display: false
                  }
                }
              ]
            },
            responsive: true,
            maintainAspectRatio: false
          };
        });
      } else if (this.selectedMonth != null) {
        var labeldata = [];
        stmt = stmt.concat(`AND MONTH(wt_start) = ${this.selectedMonth}`);
        if (this.selectedWorkpacket != "Alle Arbeitspakete") {
          stmt = stmt.concat(`AND wt_wo_id = '${this.selectedWorkpacket}'`);
        }
        await s2tdb.connect().query(stmt, (err, data) => {
          if (err) throw err;
          result.length = this.daysInMonth(this.selectedMonth, this.year);
          for (var i = 0; i < result.length; i++) {
            labeldata.push(`${i + 1}.${this.selectedMonth}.${this.year}`);
          }
          result.fill(0);
          if (data.length > 0) {
            data.forEach(function(item) {
              if (item.time == null) throw err;
              else {
                var time = new Date(item.time*1000);
                // same month & year
                if (item.stopDay >= item.day)
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((time.getUTCDate() - 1) * 24);
                // Case time on start day > or = time on stop day AND not same month/year
                if (item.startTime <= item.stopTime && item.stopDay < item.day)
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((item.stopDay + context.daysInMonth(item.month, item.year) - item.day) * 24);
                // Case time on start day < time on stop day AND not same month/year
                if (item.startTime > item.stopTime && item.stopDay < item.day) 
                  workHour =
                    parseInt(time.getUTCHours()) +
                    parseInt((item.stopDay + context.daysInMonth(item.month, item.year) - item.day - 1) * 24);
                if (time.getUTCMinutes() <= 6) {
                  workMinute = "0" + Math.floor(time.getUTCMinutes() / 60 * 100); 
                  workTime = `${workHour}.${workMinute.substr(-2)}`;
                } else {
                  workMinute = time.getUTCMinutes() / 60 * 100;
                  workTime = `${workHour}.${workMinute}`;
                }               
                result[item.day - 1] += parseFloat(workTime);
              }
            });
          }
          this.chartdata = {
            labels: labeldata,
            datasets: [
              {
                label: "Arbeitszeit in Stunden",
                backgroundColor: "#006991",
                data: result
              }
            ]
          };
          this.options = {
            scales: {
              yAxes: [
                {
                  ticks: {
                    suggestedMax: 12
                  }
                }
              ],
              xAxes: [
                {
                  gridLines: {
                    display: false
                  }
                }
              ]
            },
            responsive: true,
            maintainAspectRatio: false
          };
        });
      }
    },
    vuelog(content) {
      console.log(content);
    },
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    },
    getCurrentYear() {
      this.year = new Date().getFullYear();
    },
    async getWorkpacketsMethod() {
      const data = await getWorkpackets();
      this.workpackets = data;
    },
    getAllProjectMembersMethod() {
      getAllProjectMembers((err, data) => {
        this.members = data;
      });
    },
    isCurrentUserAdminMethod() {
      isUserAdmin((err, data) => {
        this.isCurrentUserAdmin = data;
      }, getAnalyzer.getParams(1));
    },
    async getCurrentUserNameMethod() {
      const data = await getCurrentUserName();
      this.selectedUser = data;
    },
    async getStatsPerDayMethod() {
      const data = await getStatsPerDay(this.selectedUser);
      this.avgPerDay = data;
    },
    async getStatsPerMonthMethod() {
      const data = await getStatsPerMonth(this.selectedUser);
      this.avgPerMonth = data;
    }
  }
};

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/

function getStatsPerDay(memberName) {
  var p = new Promise((resolve, reject) => {
    s2tdb.connect().query(
      `
      SELECT DATE(wt_start) as date, SUM(UNIX_TIMESTAMP(wt_stop)-UNIX_TIMESTAMP(wt_start)) AS time  
      FROM wt_worktable JOIN u_users ON wt_u_id = u_id
      WHERE u_username = '${memberName}'
      AND wt_p_id = ${getAnalyzer.getParams(0)}
      AND wt_stop is not null
      GROUP BY date;`,
      function(err, data) {
        if (err) reject(err);
        resolve(getStats(data));
      }
    );
  });
  return p;
}

function getStats(data) {
  if (data.length <= 0) {
    return "00:00";
  }
  var result = [];
  data.forEach(function(item) {
    result.push(item.time*1000);
  });

  var sum = 0;
  for (var i = 0; i < result.length; i++) {
    sum += result[i];
  }
  
  var resultAvg = sum / result.length;
  var date = new Date(resultAvg);
  // Hours part from the timestamp
  var hours = date.getUTCHours() + (date.getUTCDate() - 1) * 24;
  // Minutes part from the timestamp
  var minutes = "0" + date.getUTCMinutes();
  resultAvg = `${hours}:${minutes.substr(-2)}`;
  return resultAvg;
}

function getStatsPerMonth(memberName) {
  var p = new Promise((resolve, reject) => {
    s2tdb.connect().query(
      `
      SELECT DATE_FORMAT(wt_start, '%m-%Y') as month, SUM(UNIX_TIMESTAMP(wt_stop)-UNIX_TIMESTAMP(wt_start)) AS time  
      FROM wt_worktable JOIN u_users ON wt_u_id = u_id
      WHERE u_username = '${memberName}'
      AND wt_p_id = ${getAnalyzer.getParams(0)}
      AND wt_stop is not null
      GROUP BY month;`,
      function(err, data) {
        if (err) reject(err);
        resolve(getStats(data));
      }
    );
  });
  return p;
}

function getCurrentUserName() {
  var p = new Promise((resolve, reject) => {
    s2tdb
      .connect()
      .query(
        `SELECT u_username FROM u_users WHERE u_id = ${getAnalyzer.getParams(
          1
        )}`,
        function(err, data) {
          if (err) reject(err);
          resolve(data[0].u_username);
        }
      );
  });
  return p;
}

function getWorkpackets() {
  var result = [];
  var p = new Promise((resolve, reject) => {
    s2tdb.connect().query(
      `
    SELECT wo_id, wo_name
    FROM wo_workpackets
    WHERE wo_p_id = ${getAnalyzer.getParams(0)}`,
      function(err, data) {
        if (err) reject(err);
        data.forEach(function(item) {
          result.push(item);
        });
        resolve(result);
      }
    );
  });
  return p;
}

function getAllProjectMembers(callback) {
  var result = [];
  s2tdb
    .connect()
    .query(
      `SELECT u_username, u_email, pm_u_id, pm_isAdmin FROM u_users JOIN pm_projectmembers ON u_id = pm_u_id WHERE pm_p_id = '${getAnalyzer.getParams(
        0
      )}' ORDER BY pm_isAdmin DESC`,
      function(err, data) {
        if (err) callback(err, null);
        data.forEach(function(item) {
          result.push(item);
        });
      }
    );
  callback(null, result);
}

function isUserAdmin(callback, memberId) {
  s2tdb
    .connect()
    .query(
      `SELECT pm_isAdmin FROM pm_projectmembers WHERE pm_p_id = ${getAnalyzer.getParams(
        0
      )} AND pm_u_id = ${memberId}`,
      function(err, data) {
        if (err) callback(err, null);
        callback(null, data[0].pm_isAdmin);
      }
    );
}
</script>


<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             STYLE                   ################
#####################################################################################
--------------------------------------------------------------------------------------
-->


<style scoped>
@import url("../../../node_modules/bulma-divider/dist/css/bulma-divider.min.css");
@import url("../../../node_modules/bulma/css/bulma.min.css");

#chartControllers {
  margin-left: 10%;
  margin-top: 2.5%;
}

.chart {
  height: 70%;
  width: 90%;
  margin-top: 2.5%;
  margin-left: 5%;
}

.year {
  width: 80px;
}

#avgValues {
  margin-top: 5%;
}

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

/** 
----------------------------------------------------------------------------------
--------------------------------           Scrollbar        ----------------------
----------------------------------------------------------------------------------
 */

::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #05A69F;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background-color: #DDD;
}
</style>