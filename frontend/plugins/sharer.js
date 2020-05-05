export default ({ app, store }, inject) => {
  inject('sharer', {
    showSheet({ url = '', text = '' }) {
      store.commit('share/showSheet', { url, text });
    }
  });
};
