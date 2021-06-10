import DispenserEndpoints from '@/backend-endpoints/dispenser'

const state = {
    flag: "default",
    default: [],
    global: [],
    defaultError: [],
    globalError: []
}

const getters = {
    get: (state) => {
        let entries = state.default
        if (state.flag === "global") {
            entries = state.global
        }
        return entries.filter((e) => Object.prototype.hasOwnProperty.call(e,'hasAccess') && e.hasAccess)
    },
    default: (state) => {
        return state.default
    },
    global: (state) => {
        return state.global
    },
    getErrors: (state) => {
        let errors = state.defaultError
        if (state.flag === "global") {
            errors = state.globalError
        }
        return errors
    },
    hasDefaultError: (state) => {
        return state.defaultError.length !== 0
    },
    hasGlobalError: (state) => {
        return state.globalError.length !== 0
    },
    getDefaultErrorCode: (state) => {
        var res = null
        if(state.defaultError.length !== null && typeof state.defaultError[0] !== "undefined" && Object.prototype.hasOwnProperty.call(state.defaultError[0], "response")) {
            res = state.defaultError[0].response.code
        }
        return res
    }
}

const utils = {
    hasAccess: function (store, entry) {
        function compare(roleUser, roleRoute) {
            function checkCrewName () {
                return (!Object.prototype.hasOwnProperty.call(roleRoute,"crewNames") || (Object.prototype.hasOwnProperty.call(roleUser,"crew") && roleRoute.crewNames.some((crewName) => crewName === roleUser.crew.name)))
            }
            function checkPillar () {
                return (!Object.prototype.hasOwnProperty.call(roleRoute,"pillars") || (Object.prototype.hasOwnProperty.call(roleUser,"pillar") && roleRoute.pillars.some((pillar) => pillar === roleUser.pillar.pillar)))
            }
            return ((typeof roleUser === "string") && roleUser === roleRoute.role && !Object.prototype.hasOwnProperty.call(roleRoute,"crewNames") && !Object.prototype.hasOwnProperty.call(roleRoute,"pillars")) ||
                ((typeof roleUser === "object") && roleUser.name === roleRoute.role && checkCrewName() && checkPillar())
        }
        return !Object.prototype.hasOwnProperty.call(entry,'permission') || entry.permission.reduce(
            (access, roleRoute) => access || store.rootGetters['user/roles'].reduce((roleAccess, roleUser) => roleAccess || compare(roleUser, roleRoute), false),
            false
        )
    },
    calcAccess (store, entries) {
        let that = this
        return entries.map((entry) => {
            entry['hasAccess'] = that.hasAccess(store, entry)
            if(Object.prototype.hasOwnProperty.call(entry,"entries")) {
                entry.entries = that.calcAccess(store, entry.entries)
            }
            return entry
        })
    }
}

const actions = {
    init (store) {
        let ajax = new DispenserEndpoints(store)
        let successHandlerDefault = (response) => {
            let entries = utils.calcAccess(store, response.data)
            store.commit({ "type": 'setDefault', "entries": entries })
        }
        let errorDefaultHandler = (error) => {
            store.commit({ "type": 'setDefault', "entries": [] })
            store.commit({ "type": 'setDefaultError', error: error })
        }
        let successHandlerGlobal = (response) => {
            let entries = utils.calcAccess(store, response.data)
            store.commit({ "type": 'setGlobal', "entries": entries })
        }
        let errorGlobalHandler = (error) => {
            store.commit({ "type": 'setGlobal', "entries": [] })
            store.commit({ "type": 'setGlobalError', error: error })
        }
        ajax.getDefault(successHandlerDefault, errorDefaultHandler)
        ajax.getGlobal(successHandlerGlobal, errorGlobalHandler)
    },
    updateAccessRights (store) {
        let defaults = utils.calcAccess(store, store.state.default)
        let global = utils.calcAccess(store, store.state.global)
        store.commit({ "type": 'setDefault', "entries": defaults })
        store.commit({ "type": 'setGlobal', "entries": global })
    },
    flagIt (store) {
        if (store.rootGetters['user/isAuthenticated']) {
            store.commit({ "type": 'setFlag', "flag": "global" })
        } else {
            store.commit({ "type": 'setFlag', "flag": "default" })
        }
    }
}

const mutations = {
    setFlag(state, commit) {
        state.flag = commit.flag
    },
    setDefault(state, commit) {
        state.default = commit.entries
    },
    setGlobal(state, commit) {
        state.global = commit.entries
    },
    setDefaultError(state, obj) {
        state.defaultError = obj.error
    },
    setGlobalError(state, obj) {
        state.globalError = obj.error
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
