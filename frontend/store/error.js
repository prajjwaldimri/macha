export const state = () => ({
  sessionErrors: ''
});

export const mutations = {
  add(state, payload) {
    state.sessionErrors += `${new Date().toString()} - ${payload.toString()} \n`;
  }
};

export const actions = {
  addError({ commit }, sessionErrors) {
    commit('add', sessionErrors);
  }
};


