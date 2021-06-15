import DispenserEndpoints from '@/backend-endpoints/dispenser'

const state = {
    flag: "default",
    localRule: "concat", // possible values: "concat" or "replace"
    local: [],
    default: [],
    global: [],
    defaultError: [],
    globalError: []
}

const getters = {
    get: (state) => {
        function applyLocalRule (items) {
            let result = items
            if(Array.isArray(state.local) && state.local.length !== 0) {
                switch (state.localRule) {
                    case "concat":
                        result = state.local.concat(items)
                        break
                    case "replace":
                        result = state.local
                        break
                }
            }
            return result
        }
        let entries = applyLocalRule(state.default) // TODO: REPLACE CONCAT BY USER DEFINED RULES
        if (state.flag === "global") {
            entries = applyLocalRule(state.global) // TODO: REPLACE CONCAT BY USER DEFINED RULES
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
            let entryCopy = {}
            Object.assign(entryCopy, entry)
            entryCopy['hasAccess'] = that.hasAccess(store, entryCopy)
            if(Object.prototype.hasOwnProperty.call(entryCopy,"entries")) {
                entryCopy.entries = that.calcAccess(store, entryCopy.entries)
            }
            return entryCopy
        })
    }
}

const actions = {
    init (store, local) {
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
        let localEntries = utils.calcAccess(store, local.entries)
        let data = {
            "entries": localEntries,
            "rule": local.rule
        }
        store.commit({ "type": 'setLocal', "data": data })
    },
    updateAccessRights (store) {
        let defaults = utils.calcAccess(store, store.state.default)
        let global = utils.calcAccess(store, store.state.global)
        let localEntries = utils.calcAccess(store, store.state.local)
        let data = {
            "entries": localEntries,
            "rule": store.state.localRule
        }
        store.commit({ "type": 'setDefault', "entries": defaults })
        store.commit({ "type": 'setGlobal', "entries": global })
        store.commit({ "type": 'setLocal', "data": data })
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
    setLocal(state, commit) {
        state.local = commit.data.entries
        if(['concat', 'replace'].indexOf(commit.data.rule) !== -1)
            state.localRule = commit.data.rule
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
