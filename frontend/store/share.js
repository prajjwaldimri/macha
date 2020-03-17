export const state = () => ({
  url: '',
  text: ''
});

export const mutations = {
  showSheet(state, payload) {
    state.url = payload.url;
    state.text = payload.text;
  }
};
