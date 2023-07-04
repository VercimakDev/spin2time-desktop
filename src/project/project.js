import Vue from 'vue';
import VueRouter from 'vue-router';

import Worktable from './components/worktable.vue'; //ES6 module
import Statistics from './components/statistics.vue'; //ES6 module
import Team from './components/team.vue'; //ES6 module
import Settings from './components/settings.vue' //ES6 module

import Project from './Project.vue'

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Worktable },
  { path: '/statistics', component: Statistics },
  { path: '/team', component: Team },
  { path: '/settings', component: Settings}
];

const router = new VueRouter({
  routes // short for `routes: routes`
})


const app = new Vue({
    router,
    render: function(h) { return h(Project); }
  }).$mount('#app')