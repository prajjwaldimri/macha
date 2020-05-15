<template lang="pug">
.friendsPage
  v-progress-linear(indeterminate v-if="isLoading")
  v-list(v-else-if="friendsExist" flat two-line) 
    v-list-item(v-for="macha in machas" :key="macha.username")
      v-list-item-avatar
        v-avatar
          v-img(:src="macha.profileImage" aspect-ration="1" v-if="macha.profileImage")
          v-icon(v-else large color="orange" left) mdi-halloween

      v-list-item-content
        v-list-item-title(v-text="macha.name")
        v-list-item-subtitle @{{macha.username}}

      v-list-item-action
        v-btn(icon @click="removeMacha(macha.id)")
          v-icon(color="error") mdi-account-multiple-remove
  .noFriends(v-else style="display: flex; justify-content: center;").subtitle-2.pa-4 You have no macha yet.
</template>

<script>
import getMachas from '~/gql/getMachas';
import removeMacha from '~/gql/removeMacha';

export default {
  data() {
    return {
      machas: [],
      friendsExist: false,
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
            query: getMachas,
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => {
            this.machas = data.getMachas.machas;
            if (this.machas.length > 0) {
              this.friendsExist = true;
            }
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Not able to get machas'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async removeMacha(id) {
      try {
        await this.$apollo.mutate({
          mutation: removeMacha,
          variables: {
            uniqueMachaId: id
          }
        });
        this.refresh();
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Not able to delete macha'
        });
      }
    }
  }
};
</script>