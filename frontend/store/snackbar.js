export const state = () => ({
  content: '',
  color: ''
});

export const mutations = {
  showNotification(state, payload) {
    state.content = payload.content;
    state.color = payload.color;
  }
};
