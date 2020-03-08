export default ({ app, store }, inject) => {
  inject('notifier', {
    showMessage({ content = '' }) {
      store.commit('snackbar/showNotification', { content, color: '' });
    },
    showSuccessMessage({ content = '' }) {
      store.commit('snackbar/showNotification', { content, color: 'success' });
    },
    showErrorMessage({ content = '' }) {
      store.commit('snackbar/showNotification', { content, color: 'error' });
    }
  });
};
