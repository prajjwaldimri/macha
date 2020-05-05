<template lang="pug">
  .notifications
    v-list(two-line dense :loading="isLoading")
      v-subheader Notifications
      template(v-if="notifications" v-for="(notification, index) in notifications" )
        v-list-item(:key="notification.id" :to="notification.uri")
          v-list-item-avatar
            v-img(v-if="notification.image" :src="notification.image")
            v-icon(v-else) mdi-halloween
          v-list-item-content {{notification.content}}
        v-divider(v-if="index < notifications.length - 1")

    v-btn(fab @click="clear" bottom color="primary" right fixed style="margin-bottom: 48px" :loading="isLoading")
      v-icon mdi-notification-clear-all

</template>

<script>
import getNotifications from '../gql/getNotifications';
import clearNotifications from '../gql/clearNotifications';

export default {
  data() {
    return {
      notifications: [],
      isLoading: false
    };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    async refresh() {
      try {
        this.isLoading = true;
        await this.$apollo
          .query({
            query: getNotifications,
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => {
            this.notifications = data.getNotifications.notifications;
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Unable to get notifications'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async clear() {
      try {
        this.isLoading = true;
        await this.$apollo
          .mutate({ mutation: clearNotifications })
          .then(({ data }) => {
            this.refresh();
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Unable to clear notifications'
        });
        this.isLoading = false;
      }
    }
  }
};
</script>