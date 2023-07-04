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
    <div v-if="loaded" id="content">
      <div class="container">
        <div
          v-if="isCurrentUserAdmin == 1 ||isCurrentUserAdmin == 2"
          @mouseleave="dropped=false"
          @mouseenter="dropped=true"
          id="dNonMembers"
        >
          <input
            id="iUserSearch"
            placeholder="Member hinzufügen..."
            class="input"
            @keyup="userSearch()"
          />
          <transition name="dropdown">
            <div v-if="dropped" class="table-container" id="tNonMembers">
              <table class="table is-bordered tNonMembers">
                <tr
                  class="nonMemberTr"
                  v-for="nonMember in nonMembers"
                  v-bind:key="nonMember.u_id"
                  @click="addMember(nonMember.u_id), dropped=false"
                >
                  <td>{{nonMember.u_username}}</td>
                </tr>
              </table>
            </div>
          </transition>
        </div>
      </div>
      <br />
      <table id="tMembers" class="table is-fullwidth">
        <tr>
          <th>Username</th>
          <th>E-Mail</th>
          <th>Rechte</th>
          <th></th>
        </tr>
        <tr v-for="member in members" v-bind:key="member.pm_u_id" class="memberTr">
          <td>{{member.u_username}}</td>
          <td>{{member.u_email}}</td>
          <td v-if="member.pm_isAdmin == 2">Ersteller</td>
          <td v-if="member.pm_isAdmin == 1">Admin</td>
          <td v-if="member.pm_isAdmin == 0">Mitglied</td>
          <td
            v-if="isCurrentUserAdmin == 0 || isCurrentUserAdmin == 1 && member.pm_isAdmin != 1 && member.pm_isAdmin == 2 || isCurrentUserAdmin == 2 && member.pm_isAdmin == 2 || isCurrentUserAdmin == 1 && member.pm_isAdmin == 1"
          ></td>
          <td
            v-if="member.pm_isAdmin == 0 && isCurrentUserAdmin == 1 || member.pm_isAdmin == 0 && isCurrentUserAdmin == 2 || isCurrentUserAdmin == 2 && member.pm_isAdmin == 1"
          >
            <div class="field has-addons">
              <div class="control">
                <div class="select is-small">
                  <select v-model="selected">
                    <option disabled value>Optionen...</option>
                    <option>Rechte ändern</option>
                    <option>Entfernen</option>
                  </select>
                </div>
              </div>
              <div class="control">
                <a class="button is-small" v-if="selected == ''" disabled>Bestätigen</a>
                <a
                  class="button is-small"
                  v-if="selected == 'Rechte ändern'"
                  @click="changeRights(member.pm_u_id, member.pm_isAdmin)"
                >Bestätigen</a>
                <a
                  class="button is-small"
                  v-if="selected == 'Entfernen'"
                  @click="removeMember(member.pm_u_id)"
                >Bestätigen</a>
              </div>
            </div>
          </td>
        </tr>
      </table>
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
const s2tMailer = require("../../internal/s2tMailer");
const s2tStateParser = require("../../internal/s2tStateParser");
const $ = require("jquery");
const getAnalyzer = require("../internal/getAnalyzer");
import DeleteIcon from "../../../node_modules/vue-material-design-icons/Delete.vue";

export default {
  data: function() {
    return {
      members: [],
      nonMembers: [],
      selected: "",
      isCurrentUserAdmin: "",
      dropped: false,
      loaded: false
    };
  },
  async mounted() {
    this.isCurrentUserAdminMethod();
    this.getAllProjectMembersMethod();
    this.getNonMembersMethod();
    this.setLoaded();
  },
  methods: {
    setLoaded() {
      this.loaded = true;
    },
    dropIt() {
      this.dropped = !this.dropped;
    },
    async isCurrentUserAdminMethod() {
      await isUserAdmin((err, data) => {
        this.isCurrentUserAdmin = data;
      }, getAnalyzer.getParams(1));
    },
    removeMember(memberId) {
      s2tdb
        .connect()
        .query(
          `DELETE FROM pm_projectmembers WHERE pm_u_id = ${memberId} AND pm_p_id = ${getAnalyzer.getParams(
            0
          )}`,
          function(err) {
            if (err) throw err;
          }
        );
      this.getAllProjectMembersMethod();
      this.getNonMembersMethod();
    },
    addMember(memberId) {
      s2tdb
        .connect()
        .query(
          `INSERT INTO pm_projectmembers VALUES (${memberId}, ${getAnalyzer.getParams(
            0
          )}, 0)`,
          function(err) {
            if (err) throw err;
          }
        );
      this.getAllProjectMembersMethod();
      this.getNonMembersMethod();
    },
    changeRights(memberId, currentRights) {
      if (currentRights == 1) {
        currentRights = 0;
      } else {
        currentRights = 1;
      }
      var givenRights = currentRights;
      s2tdb
        .connect()
        .query(
          `UPDATE pm_projectmembers SET pm_isAdmin = ${givenRights} WHERE pm_u_id = ${memberId} AND pm_p_id = ${getAnalyzer.getParams(
            0
          )}`,
          function(err) {
            if (err) throw err;
          }
        );
      this.getAllProjectMembersMethod();
      this.getNonMembersMethod();
    },
    getAllProjectMembersMethod() {
      getAllProjectMembers((err, data) => {
        this.members = data;
      });
    },
    getNonMembersMethod() {
      getNonMembers((err, data) => {
        this.nonMembers = data;
      });
    },
    userSearch() {
      // Retrieve the input field text and reset the count to zero
      var filter = $("#iUserSearch").val();

      // Loop through the comment list
      $(".nonMemberTr").each(function() {
        // If the list item does not contain the text phrase fade it out
        if (
          $(this)
            .text()
            .search(new RegExp(filter, "i")) < 0
        ) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    }
  },
  components: {
    "delete-icon": DeleteIcon
  }
};

/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/

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

function getNonMembers(callback) {
  var result = [];
  s2tdb.connect().query(
    `SELECT distinct u_id, u_username, u_email from u_users where u_username NOT IN (
       SELECT u_username FROM u_users JOIN pm_projectmembers ON u_id = pm_u_id WHERE pm_p_id = '${getAnalyzer.getParams(
         0
       )}')`,
    function(err, data) {
      if (err) callback(err, null);
      data.forEach(function(item) {
        result.push(item);
      });
    }
  );
  callback(null, result);
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
@import url("../../../node_modules/bulma/css/bulma.min.css");

#tNonMembers {
  position: absolute;
}

.tNonMembers {
  width: 100%;
}

.nonMemberTr {
  overflow: hidden;
}

.nonMemberTr:hover,
.memberTr:hover {
  cursor: pointer;
  background: #eee;
}

#iUserSearch:focus {
  outline: none;
  border: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: max-height 0.5s ease-in;
}

.dropdown-enter, .dropdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  max-height: 0px;
}

.dropdown-enter-to,
.dropdown-leave {
  max-height: 700px;
}

#content {
  position: relative;
}

#dNonMembers {
  width: 20%;
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
</style>