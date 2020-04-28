export const state = () => ({
  sessionErrors: ''
});

export const mutations = {
  add(payload) {
    state.sessionErrors += payload + '\n';
  }
};

export const actions = {
  addError({ commit }, sessionErrors) {
    commit('addError', sessionErrors);
  }
};

export const getters = {
  getSessionErrors() {
    return state.sessionErrors;
  }
};
