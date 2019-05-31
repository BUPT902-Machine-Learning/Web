import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)


import numbersValue from './numbersValue/';


export default new Vuex.Store({
    modules: {
        numbersValue
    }
});

