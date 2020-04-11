export const state = () => ({
  isDarkThemeEnabled: ''
});

export const mutations = {
  setDarkTheme() {
    state.isDarkThemeEnabled = true;
  },
  setLightTheme() {
    state.isDarkThemeEnabled = false;
  }
};
