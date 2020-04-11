<template lang="pug">
  v-list(flat)
    v-list-item(three-line)
      v-list-item-content
        v-list-item-title Dark Theme
        v-list-item-subtitle Turn on to enable dark theme on the website
      v-list-item-action
        v-switch(v-model="isDarkThemeEnabled")

    v-divider

    v-list-item(@click="logout")
      v-list-item-content
        v-list-item-title.red--text Logout
      v-list-item-icon
        v-icon(color="red") mdi-logout
</template>

<script>
export default {
  data() {
    return {
      isDarkThemeEnabled: false,
      firstTimePageLoad: true
    };
  },
  mounted() {
    this.getDarkThemeInfo();
  },
  methods: {
    async logout() {
      await this.$apolloHelpers.onLogout();
      this.$router.push('/login');
    },
    getDarkThemeInfo() {
      if (!localStorage.getItem('isDarkThemeEnabled')) {
        localStorage.setItem('isDarkThemeEnabled', false);
        this.$store.commit('theme/setLightTheme');
      }
      this.isDarkThemeEnabled =
        localStorage.getItem('isDarkThemeEnabled') === 'true';
      this.$store.commit('theme/setDarkTheme');
    }
  },
  watch: {
    isDarkThemeEnabled(val) {
      if (val) {
        localStorage.setItem('isDarkThemeEnabled', true);
        this.$store.commit('theme/setDarkTheme');
      } else {
        localStorage.setItem('isDarkThemeEnabled', false);
        this.$store.commit('theme/setLightTheme');
      }
    }
  }
};
</script>