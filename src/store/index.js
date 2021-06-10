import Vue from 'vue'
import Vuex from 'vuex'
import navigationEntries from './modules/navigationEntries'
import user from './modules/user'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        navigationEntries: navigationEntries,
        user: user
    },
    strict: debug
})
