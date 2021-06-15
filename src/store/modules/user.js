import DropsEndpoints from '@/backend-endpoints/drops'

const state = {
    user: null,
    currentUserRoles: [],
    authenticated: false,
    pending: false,
    error: null
}

const getters = {
    get: (state) => {
        return state.user
    },
    roles: (state) => {
        return state.currentUserRoles
    },
    isAuthenticated: (state) => {
        return state.authenticated
    },
    is: (state) => (roles) => {
        var userRoles = state.user.roles
            .filter((role) => Object.prototype.hasOwnProperty.call(role,"name") && !Object.prototype.hasOwnProperty.call(role,"crewName") && !Object.prototype.hasOwnProperty.call(role,"pillar"))
        var supporterRoles = state.user.roles
            .filter((role) => Object.prototype.hasOwnProperty.call(role,"name") && (Object.prototype.hasOwnProperty.call(role,"crewName") || Object.prototype.hasOwnProperty.call(role,"pillar")))
        return roles.reduce((fulfills, role) => {
            var has = false
            if((typeof role === "string") && role !== "VolunteerManager") {
                // searching for a simple role (admin, supporter or employee)
                has = userRoles.some((userRole) => userRole.name.toLowerCase() === role.toLowerCase())
            } else if(role === "VolunteerManager") {
                // The user has to be Volunteer Manager, but the pillar is not important
                has = supporterRoles.reduce((found, supporterRole) => (found || supporterRole.name === role), false)
            } else {
                // The user has to be Volunteer Manager with a concrete pillar or for a concrete crew
                has = supporterRoles.reduce((found, supporterRole) =>
                        (found || (supporterRole.name === role.name &&
                            ((Object.prototype.hasOwnProperty.call(role,"crew") && Object.prototype.hasOwnProperty.call(role,"name") && supporterRole.crewName === role.crew.name) ||
                                !Object.prototype.hasOwnProperty.call(role,"crew") || !Object.prototype.hasOwnProperty.call(role.crew,"name")) &&
                            ((Object.prototype.hasOwnProperty.call(role,"crew") && Object.prototype.hasOwnProperty.call(role.crew,"id") && supporterRole.crewId === role.crew.id) ||
                                !Object.prototype.hasOwnProperty.call(role,"crew") || !Object.prototype.hasOwnProperty.call(role.crew,"id")) &&
                            ((Object.prototype.hasOwnProperty.call(role,"pillar") && supporterRole.pillar === role.pillar) || !Object.prototype.hasOwnProperty.call(role,"pillar"))
                        )),
                    false
                )
            }
            return fulfills || has
        }, false)
    },
    same: (state) => (userId) => {
        return state.user.uuid === userId
    },
    isEmployee: (state, getters) => {
        return getters.is(["Employee"])
    },
    isAdmin: (state, getters) => {
        return getters.is(["Admin"])
    },
    isVolunteerManager: (state, getters) => {
        return getters.is([{ "name": "VolunteerManager" }]) // Todo: consider Crew!
    },
    getCrew: (state) => {
        var crewRole = state.user.roles.find(role => Object.prototype.hasOwnProperty.call(role,"crewId"))
        var res = null
        if(typeof crewRole !== "undefined") {
            res =  [
                {
                    "uuid": crewRole.crewId,
                    "name": crewRole.crewName
                }
            ]
        }
        return res
    },
    getErrors: (state) => {
       return state.error
    },
    isError: (state) => {
        return state.error !== null
    },
    getErrorCode: (state) => {
        var res = null
        if(state.error !== null && Object.prototype.hasOwnProperty.call(state.error, "response") && Object.prototype.hasOwnProperty.call(state.error.response, "status")) {
            res = state.error.response.status
        }
        return res
    }
}

const actions = {
    init (store, followUpHandler) {
        let ajax = new DropsEndpoints(store)
        store.commit('API_USER_PENDING')
        let successHandler = function (user) {
            store.commit('API_USER_SUCCESS', user)
            store.dispatch('heureka_widget_navigation_entries/updateAccessRights', null, { root: true })
            followUpHandler()
        }
        let unauthorizedHandler = function (error) {
            store.commit('API_USER_LOGOUT', error)
            //store.actions.heureka_widget_navigation_entries.updateAccessRights(store.navigatenEntries)
            store.dispatch('heureka_widget_navigation_entries/updateAccessRights', null, { root: true })
            followUpHandler()
        }
        let errorHandler = function (error) {
            store.commit('API_USER_FAILURE', error)
            //store.actions.heureka_widget_navigation_entries.updateAccessRights(store.navigatenEntries)
            store.dispatch('heureka_widget_navigation_entries/updateAccessRights', null, { root: true })
            followUpHandler()
        }
        ajax.get(successHandler, unauthorizedHandler, errorHandler)
    },
    pending (store) {
        store.commit('API_USER_PENDING')
    },
    success (store, user) {
        store.commit('API_USER_SUCCESS', user)
        store.actions.heureka_widget_navigation_entries.updateAccessRights(store.navigatenEntries)
    },
    error (store, error) {
        store.commit('API_USER_FAILURE', error)
        store.actions.heureka_widget_navigation_entries.updateAccessRights(store.navigatenEntries)
    },
    /**
     * Has to be called by all other AJAX requests, if they receive an [401 status code](https://tools.ietf.org/html/rfc7235#section-3.1).
     * If an ajax call receives a 401, the user has been logged out.
     *
     * Since all AJAX requests are executed by the VUEX store, this is a matter of accuracy.
     *
     * @author Johann Sell
     * @param store
     * @param error
     */
    logout(store, error) {
        store.commit('API_USER_LOGOUT', error)
        store.actions.heureka_widget_navigation_entries.updateAccessRights(store.navigatenEntries)
    }
}

const mutations = {
    API_USER_PENDING(state) {
        state.user = null
        state.currentUserRoles = []
        state.authenticated = false
        state.pending = true
        state.error = null
    },
    API_USER_SUCCESS(state, user) {
        let getRoles = function (u) {
            let roles = u.roles.map((role) => role.role)
            return roles.concat(
                u.profiles.reduce((supporterRoles, profile) => supporterRoles.concat(profile.supporter.roles), [])
            )
        }
        state.user = user
        state.currentUserRoles = getRoles(user)
        state.authenticated = true
        state.pending = false
        state.error = null
    },
    API_USER_FAILURE(state, error) {
        state.user = null
        state.currentUserRoles = []
        state.authenticated = false
        state.pending = false
        state.error = error
    },
    API_USER_LOGOUT(state, error) {
        state.user = null
        state.currentUserRoles = []
        state.authenticated = false
        state.pending = false
        state.error = error
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}