<template lang="pug">
  .notifications
    v-list(two-line dense :loading="isLoading")
      v-subheader Notifications
      .noNotification(v-if="notificationExist" style="display: flex; justify-content: center;").subtitle-2.pa-4 You have no notification yet.
      template(v-else-if="notifications " v-for="(notification, index) in notifications" )
        v-list-item(:key="notification.id" :to="notification.uri")
          v-list-item-avatar
            v-img(v-if="notification.image" :src="notification.image")
            v-icon(v-else) mdi-halloween
          v-list-item-content
            v-list-item-title {{notification.content}}
            v-list-item-subtitle {{updatedAt(notification.updatedAt)}}
        v-divider(v-if="index < notifications.length - 1" inset)

    v-btn(fab @click="clear" bottom color="primary" right fixed style="margin-bottom: 48px" :loading="isLoading")
      v-icon mdi-notification-clear-all

</template>

<script>
import getNotifications from '../gql/getNotifications';
import clearNotifications from '../gql/clearNotifications';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default {
  data() {
    return {
      notifications: [],
      isLoading: false,
      notificationExist: false
    };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    updatedAt(time) {
      return dayjs(parseInt(time)).fromNow();
    },
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
            if (this.notifications.length <= 0) {
              this.notificationExist = true;
            }
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
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
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Unable to clear notifications'
        });
        this.isLoading = false;
      }
    }
  }
};
</script>