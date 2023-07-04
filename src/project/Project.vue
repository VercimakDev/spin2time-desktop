<template>
  <div id="app">
    <div id="nav">
      <!-- `<router-link>` will be rendered as an `<a>` tag by default -->
      <div id="header" class="columns material-icons">
        <div class="column is-left material-icons">
          <router-link to="/" exact class="menu-link">Arbeitszeiten</router-link>
          <router-link to="/statistics" class="menu-link">Statistiken</router-link>
          <router-link to="/team" class="menu-link">Team</router-link>
          <router-link v-if="isAdmin == true" to="/settings" class="menu-link"><pencil-outline class="material-icons"/></router-link>
        </div>
        <div class="column has-text-centered"><p>{{ projectName }}</p></div>
        <div class="column is-right has-text-right">
          <a href="../src/dashboard/dashboard.html">Zurück zum Dashboard</a>
        </div>
      </div>
    </div>
    <!-- component matched by the route will render here -->
    <router-view></router-view>
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
const s2tdb = require("../internal/s2tDB");
const $ = require("jquery");
const getAnalyzer = require("./internal/getAnalyzer");
const { remote } = require('electron')
import PencilOutline from "../../node_modules/vue-material-design-icons/PencilOutline.vue";


/**
--------------------------------------------------------------------------------------

Functions

--------------------------------------------------------------------------------------
**/

function readProjectName(projectID, callback) {
  var stmt = `
    SELECT p_name FROM p_projects
    WHERE p_id = '${projectID}';
  `;
  s2tdb.connect().query(stmt, (err, results, fields) => {
    if (err) {
      callback(err, null);
    }
    callback(err, results[0].p_name);
  });
}

export default {
  data: () => {
    return {
      projectName: "",
      isAdmin: false
    };
  },
  components: {
    PencilOutline
  },
  created() {
    this.getProjectName();
    this.setIsAdmin();
  },
  methods: {
    getProjectName() {
      readProjectName(getAnalyzer.getParams(0), (err, data) => {
        this.projectName = data;
      });
    },
    setIsAdmin(){
      var stmt = 
      `
        SELECT pm_isAdmin FROM pm_projectmembers 
        WHERE pm_u_id = ${getAnalyzer.getParams(1)} AND pm_p_id = ${getAnalyzer.getParams(0)};
      `;
      s2tdb.connect().query(stmt, (err, result) => {
        this.isAdmin = result[0].pm_isAdmin >= 1 ? true : false;
      });
    }
  }
};
</script>


<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             STYLE                  ################
#####################################################################################
--------------------------------------------------------------------------------------
-->


<style scoped>
@import url("../../node_modules/bulma/css/bulma.min.css");

#nav {
  margin-top: auto;
}
.menu-link {
  font-size: 18px;
  color: black;
  margin-right: 25px;
}
.menu-link:hover {
  color: black;
}
.router-link-active {
  border-bottom: 2px solid white;
}

.router-link-active:hover {
  color: white;
}

#header a{
    font-size: 20px;
    float: right;
    color: white;
}

p{
  font-size: 24px;
  color: white;
}

#header a:hover{
    border-bottom: 2px solid white;
}

#header{
    width: 100%;
    height: 100px;

    margin-bottom: 20px;
    margin-right: 0;
    margin-left: 0;

    background: #06beb6; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right,#48b1bf,#06beb6); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.material-icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

body, html {
  width: 100%;
}

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