<template lang="pug">
  v-bottom-navigation(app grow color="primary" height="48")
    v-btn(to="/" nuxt)
      v-icon mdi-home
    v-btn(to="/profile" nuxt)
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
import notificationSub from '../gql/notificationSub';

export default {
  data() {
    return {
      unreadNotifications: false
    };
  },
  mounted() {
    const observer = this.$apollo.subscribe({
      query: notificationSub
    });

    observer.subscribe({
      next: data => {
        let notification = data.data.notificationSub;
        this.unreadNotifications = true;
        if (Notification.permission === 'granted') {
          navigator.serviceWorker.getRegistration().then(reg => {
            reg.showNotification(notification.content, {
              icon: notification.image,
              vibrate: [100, 50, 100]
            });
          });
        }
      },
      error: error => {
        this.$notifier.showErrorMessage({
          content:
            'Unable to subscribe to notifications. Please reload to get realtime notifications.'
        });
      }
    });
  }
};
</script>
