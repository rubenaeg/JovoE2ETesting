// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMicrophone, faPlay, faVolumeUp, faExclamationCircle,
    faCheckCircle, faPlus, faAngleDown, faPen, faTrash, faCheck,
    faEllipsisH, faSpinner, faTimes, faCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
    faMicrophone,
    faPlay,
    faVolumeUp,
    faSpinner,
    faExclamationCircle,
    faCheckCircle,
    faPlus,
    faAngleDown,
    faPen,
    faTrash,
    faCheck,
    faEllipsisH,
    faTimes,
    faCircle,
    faSignOutAlt
);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {App},
    template: '<App/>'
});
