import Vue from 'vue'
import Vuex from 'vuex'
import navigationEntries from './modules/navigationEntries'
import user from './modules/user'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        'heureka_widget_navigation_entries': navigationEntries,
        'heureka_widget_navigation_user': user
    },
    strict: debug
})
