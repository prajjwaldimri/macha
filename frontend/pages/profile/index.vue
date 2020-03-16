<template lang="pug">
  v-toolbar(prominent flat height="240")
    .top-profile.pt-5
      v-avatar(color="primary" size="80")
        span.white--text.headline PD
      span.title.pt-2 {{user.name}}

    template(v-slot:extension)
      v-tabs(v-model="tab" grow show-arrows)
        v-tab(key="profile") Profile
        v-tab(key="friends") Friends
        v-tab(key="photos") Photos
        v-tab(key="settings") Settings
</template>

<script>
import profile from '~/gql/profile';

export default {
  async mounted() {
    try {
      const token = this.$apolloHelpers.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      this.user = await this.$apollo
        .query({
          query: profile
        })
        .then(({ data }) => data.me);
    } catch (e) {
      console.log(e);
      //TODO: Redirect to login page
      this.$notifier.showErrorMessage({
        content: 'You need to be logged in to view the profile page'
      });
    }
  },
  data() {
    return {
      tab: 'profile-tab',
      user: {}
    };
  }
};
</script>

<style lang="scss">
.top-profile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.1rem;
}
</style>