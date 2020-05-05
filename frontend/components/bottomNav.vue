<template lang="pug">
  v-bottom-navigation(app grow color="primary" height="48")
    v-btn(to="/" nuxt)
      v-icon mdi-home
    v-btn(to="/profile" nuxt )
      v-icon mdi-account-cog
    v-btn(v-if="!unreadNotifications" to="/notifications" nuxt @click="unreadNotifications = false")
      v-icon mdi-bell
    v-btn(v-else to="/notifications" nuxt @click="unreadNotifications = false")
      v-badge(color="error" dot offset-y="6" bottom)
        v-icon mdi-bell-ring
    v-btn(to="/feedback" nuxt)
      v-icon mdi-comment-quote-outline
</template>

<script>
import getNotifications from '../gql/getNotifications';

export default {
  data() {
    return {
      unreadNotifications: false,
      polling: null
    };
  },
  async mounted() {
    this.polling = setInterval(async () => {
      try {
        this.isLoading = true;
        await this.$apollo
          .query({
            query: getNotifications,
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => {
            if (data.getNotifications.notifications.length > 0) {
              this.unreadNotifications = true;
            } else {
              this.unreadNotifications = false;
            }
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Unable to get notifications'
        });
      }
    }, 30000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>
