
const state = {
    valueData:[]
}

const getters = {
    getValueData: state => state.valueData
}

const mutations = {
    setValueData (state, valueData) {
        state.valueData = valueData;
    }
}

const actions = {
    setValueData({commit}, valueData){
        commit('setValueData',valueData)
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
