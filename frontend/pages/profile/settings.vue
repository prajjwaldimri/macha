<template lang="pug">
  v-list(flat)
    v-list-item(three-line)
      v-list-item-content
        v-list-item-title Dark Theme
        v-list-item-subtitle Turn on to permanently enable dark theme on the website
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
      isDarkThemeEnabled: false
    };
  },
  methods: {
    async logout() {
      await this.$apolloHelpers.onLogout();
      this.$router.push('/login');
    }
  }
};
</script>