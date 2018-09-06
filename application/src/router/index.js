import Vue from 'vue'
import Router from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import TestContent from '@/components/TestContent'

Vue.use(BootstrapVue);
Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/:id',
            name: 'TestContent',
            component: TestContent
        },
        {
            path: '/authresponse/alexa',
            name: 'Authorization Response',
            redirect: '/ruben'
        },
        {
            path: '/authresponse/dialogflow',
            redirect: '/ruben'
        }
    ],
    mode: 'history'
})
