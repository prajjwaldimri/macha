<template lang="pug">
v-list(flat two-line)
  v-list-item(v-for="macha in machas" :key="macha.username")
    v-list-item-avatar
      v-avatar
        v-img(:src="macha.profileImage" aspect-ration="1" v-if="macha.profileImage")
        v-icon(v-else large) mdi-halloween

    v-list-item-content
      v-list-item-title(v-text="macha.name")
      v-list-item-subtitle @{{macha.username}}

    v-list-item-action
      v-btn(icon)
        v-icon(color="error") mdi-account-multiple-remove
</template>

<script>
import getMachas from '~/gql/getMachas';

export default {
  data() {
    return {
      machas: []
    };
  },
  async mounted() {
    try {
      this.machas = await this.$apollo
        .query({
          query: getMachas
        })
        .then(({ data }) => data.getMachas.machas);
    } catch (e) {
      this.$notifier.showErrorMessage({
        content: 'Not able to get machas'
      });
    }
  }
};
</script>