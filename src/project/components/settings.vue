<template>
<div id="mainBody">
    <div id="menu">
        <h1 id="h1Headline">Ich möchte</h1>
        <p id="pMenuOptProjectName" class="menu-option" @click="showOrHideProjectNameMenu('pMenuOptProjectName')">Projektnamen ändern</p>
        
        <div id="projectNameMenu" v-if="showProjectNameMenu == true">
            <p>Ihr Projekt lautet gerade <strong>{{ projectName }}</strong> </p>
            <span id="spanProjectNameHeadline">Neuer Projektname</span>
                <input type="text" maxlength="45" id="inProjectName" placeholder="Projektname (max. 45 Zeichen)"> 
            <check class="material-icons" @click="setProjectName('inProjectName')" id="spanOKProjectName"></check>
        </div>

        <p id="pMenuOptProjectArchive" class="menu-option" @click="showOrHideProjectArchiveMenu('pMenuOptProjectArchive')">Projekt archivieren</p>
        <div v-if="showProjectArchiveMenu == true" id="projectArchiveMenu">
            <span id="spanOKArchive" @click="archiveProject()">Ja</span><span>, Projekt archivieren</span><span id="spanCANCELArchive" @click="showOrHideProjectArchiveMenu('pMenuOptProjectArchive')">Nein</span><span>, doch nicht</span>
        </div>

        <p id="pMenuOptProjectDescription" class="menu-option" @click="showOrHideProjectDescriptionMenu('pMenuOptProjectDescription')">Projektbeschreibung ändern</p>
        <div v-if="showProjectDescriptionMenu == true" id="projectDescriptionMenu">
            <textarea placeholder="Projektbeschreibung (max. 250 Zeichen)" id="descriptionTA" size="250" rows="3" maxlength="250" v-model="projectDesc"></textarea>
            <span @click="saveProjectDescription('descriptionTA'), showOrHideProjectDescriptionMenu('pMenuOptProjectDescription')" id="sSaveDescription">Projektbeschreibung speichern</span>
            <p id="pDescriptionChangeResult"></p>
        </div>
    </div>
</div>
</template>

<script>
const s2tdb = require("../../internal/s2tDB");
const getAnalyzer = require("../internal/getAnalyzer");
const $ = require("jquery");
import Check from "../../../node_modules/vue-material-design-icons/Check.vue";


export default {
    components: {
        Check
    },
    data: function() {
        return {
            showProjectNameMenu : false,
            showProjectArchiveMenu : false,
            showProjectDescriptionMenu: false,
            projectName: "",
            projectDesc: ""
        }
    },
    created() {
        this.getProjectname();
        this.getProjectDescription();
    },
    methods: {
        getProjectname(){
            var stmt = 
            `
            SELECT p_name 
            FROM p_projects
            WHERE p_id = ${getAnalyzer.getParams(0)};
            `;
            console.log(stmt)
            s2tdb.connect().query(stmt, (err, result) => {
                this.projectName = result[0].p_name;
                console.log(`Successfully retrieved current project name '${this.projectName}'`);
            });
        },
        getProjectDescription() {
            var stmt = 
            `
            SELECT p_description 
            FROM p_projects
            WHERE p_id = ${getAnalyzer.getParams(0)};
            `;
            s2tdb.connect().query(stmt, (err, result) => {
                this.projectDesc = result[0].p_description;
            })
        },
        showOrHideProjectNameMenu(tagID){
            this.showProjectNameMenu = !this.showProjectNameMenu;
            if(this.showProjectNameMenu) { $(`#${tagID}`).addClass("active"); } else{ $(`#${tagID}`).removeClass("active"); }
        },
        showOrHideProjectArchiveMenu(tagID){
            this.showProjectArchiveMenu = !this.showProjectArchiveMenu;
            if(this.showProjectArchiveMenu) { $(`#${tagID}`).addClass("active"); } else{ $(`#${tagID}`).removeClass("active"); }
        },
        showOrHideProjectDescriptionMenu(tagID){
            this.showProjectDescriptionMenu = !this.showProjectDescriptionMenu;
            if(this.showProjectDescriptionMenu) { $(`#${tagID}`).addClass("active"); } else{ $(`#${tagID}`).removeClass("active"); }
        },
        setProjectName(id){
            var newProjectName = $.trim($(`#${id}`).val());
            if(newProjectName.length > 0 && newProjectName !== ''){
            var stmt = 
            `
            UPDATE p_projects
            SET p_name = '${$(`#${id}`).val()}'
            WHERE p_id = ${getAnalyzer.getParams(0)}
            `;
            s2tdb.connect().query(stmt, (err) => {
                if(err) { console.error(`Failed to update project name with stmt:${stmt}. Err:${err}`)}
                else { console.log(`Successfully changed projectname to ${$(`#${id}`).val()} of project with id:${getAnalyzer.getParams(0)}`)}
                
                this.getProjectname();
            });
            $(`#${id}`).val("");
            }else{
                console.log("A empty projectname can not be set.");
            }
        },
        archiveProject(){
            var stmt = 
            `
                UPDATE p_projects
                SET p_isArchived = 1
                WHERE p_id = ${getAnalyzer.getParams(0)}
            `;

            s2tdb.connect().query(stmt, (err) => {
                if(err) { console.error(`Failed to archive project with id:${getAnalyzer.getParams(0)}. Err:${err}`)}
                else { console.log(`Succesfully archived project with id:${getAnalyzer.getParams(0)}. Redirecting now to dashboard.`)};
                window.location.href = "../src/dashboard/dashboard.html";
            });
        },
        saveProjectDescription(tagID){
            var newDescription = $.trim($(`#${tagID}`).val());
            var stmt =
            `
            UPDATE p_projects
            SET p_description = '${newDescription}'
            WHERE p_id = ${getAnalyzer.getParams(0)}
            `;
            s2tdb.connect().query(stmt, (err) => {
                if(err){
                    console.error(`Failed to update description. Err:${err}`);
                }else{
                    console.log(`Succesfully updated description:${newDescription}`);
                    var text = "";
                    if(newDescription.length > 0){
                        text = `Erfolgreich Projektbeschreibung zu <strong>${newDescription}</strong> geändert`;
                    }else{
                        text = "Erfolreich Projektbeschreibung gelöscht";
                    }
                    $(`#${tagID}`).val("");
                    $("#pDescriptionChangeResult").html(text);
                }
            });

        }
    }
}
</script>


<!--
--------------------------------------------------------------------------------------
#####################################################################################
################                             STYLE                  ################
#####################################################################################
--------------------------------------------------------------------------------------
-->


<style scoped>
*{
    user-select: none;
}
#h1Headline{
    font-size: 30px;
    text-align: center;
}

.menu-option{
    text-align: center;
    font-size: 20px;
    
    cursor: pointer;
    margin: 20px;

    width: 25%;

    margin: 0 auto;

    margin-bottom: 30px;
    margin-top: 15px;

    cursor: pointer;
}

.menu-option:hover{
    background: #06beb6; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right,#48b1bf,#06beb6); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

    -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);      

    color: white;
}

.active{
    background: #06beb6; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right,#48b1bf,#06beb6); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

    -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);      

    color: white;
}

/** 
----------------------------------------------------------------------------------
--------------------------------   projectNameMenu        ------------------------
----------------------------------------------------------------------------------
 */
 #projectNameMenu{
     width: 80%;
     margin: 0 auto;
     text-align: center;
 }

 #spanProjectNameHeadline{
     font-size: 20px;
     margin-right: 20px;
 }

 #inProjectName{
     min-width: 200px;
     border: none;
     outline: none;
     border-bottom: 1px solid #01B5DD;
     margin-right: 20px;
 }

 #spanOKProjectName{
     font-size: 18px;
     padding: 10px;

     cursor: pointer;
 }

 #spanOKProjectName:hover{
    background: #06beb6; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right,#48b1bf,#06beb6); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

    -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);  
    
    color: white;
 }

 /** 
----------------------------------------------------------------------------------
--------------------------------   projectArchiveMenu        ---------------------
----------------------------------------------------------------------------------
 */
 #projectArchiveMenu{
     margin: 0 auto;
     width: 80%;
     text-align: center;
 }
#spanOKArchive, #spanCANCELArchive{
    font-size: 20px;
    padding: 10px;
    border-radius: 50%;

    cursor: pointer;
}
#spanOKArchive{
    background: #06beb6; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right,#48b1bf,#06beb6); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right,#48b1bf,#06beb6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    
    color: white;   
}

#spanOKArchive:hover, #spanCANCELArchive:hover{
    
    -webkit-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    -moz-box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);
    box-shadow: 0px 0px 12px -2px rgba(0, 0, 0, 0.41);  
}

#spanCANCELArchive{
    
  background: #ec008c; /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #fc6767,#ec008c); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #fc6767,#ec008c); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  color: white;

  margin-left: 30px;
}

/** 
----------------------------------------------------------------------------------
--------------------------------   projectDescriptionMenu        ------------------------
----------------------------------------------------------------------------------
 */
#projectDescriptionMenu{
    margin: 0 auto;
    text-align: center;
}
#descriptionTA{
     width: 70%;
     margin: 0 auto;
    display: block;
    outline: none;
    border: 1px solid #48b1bf;

    padding: 10px;
    margin-bottom: 30px;
 }

 #sSaveDescription{
     cursor: pointer;
 }

 #sSaveDescription:hover{
     font-weight: bold;
 }

 #pDescriptionChangeResult{
     width: 50%;
    word-wrap: break-word;
    text-align: center;
    margin: 0 auto;
 }

 /** 
----------------------------------------------------------------------------------
--------------------------------     Material Icons       ------------------------
----------------------------------------------------------------------------------
 */

 .material-icons {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
}
</style>