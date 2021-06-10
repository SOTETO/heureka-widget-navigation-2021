import axios from 'axios'

export default class DropsEndpoints {
    constructor(store) {
        this.store = store
    }

    get(successHandler, unauthorizedHandler, errorHandler) {
        axios.get(
            '/drops/webapp/identity'
        )
            .then(response => successHandler(response.data.additional_information))
            .catch(error => {
                console.log(error)
                switch(error.response.status) {
                    case 401:
                        unauthorizedHandler(error)
                        //this.store.root.dispatch('user/logout')
                        break;
                    default:
                        errorHandler(error)
                        break;
                }
            })
    }
}