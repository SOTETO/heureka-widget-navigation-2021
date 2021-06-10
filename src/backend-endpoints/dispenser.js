import axios from 'axios'

export default class DispenserEndpoints {
    constructor(store) {
        this.store = store

        this.defaultErrorHandler = function(error, errorHandler) {
            switch(error.response.status) {
                case 401:
                    this.store.root.dispatch('user/logout')
                    break;
                default:
                    errorHandler(error)
                    break;
            }
        }
    }

    getGlobal(successHandler, errorHandler) {
        axios.get(
            '/dispenser/navigation/global'
        )
            .then(response => successHandler(response))
            .catch(error => this.defaultErrorHandler(error, errorHandler))
    }

    getDefault(successHandler, errorHandler) {
        axios.get(
            '/dispenser/navigation/default'
        )
            .then(response => successHandler(response))
            .catch(error => this.defaultErrorHandler(error, errorHandler))
    }
}