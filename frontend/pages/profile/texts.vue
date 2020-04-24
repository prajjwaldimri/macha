<template lang="pug">
  v-container(fluid)
    v-row(v-for="text in texts" :key="text.content" class="d-flex child-flex" )
      v-card-subtitle(flat tile @click="$router.push('/text/' + text.uri)").d-flex {{text.content}}
      v-divider.mx-7
</template>

<script>
import getTextPostsOfUser from '../../gql/getTextPostsOfUser';

export default {
  async mounted() {
    try {
      await this.$apollo
        .query({
          query: getTextPostsOfUser
        })
        .then(({ data }) => {
          this.texts = data.getTextPostsOfUser.textPosts;
        });
    } catch (e) {
      this.$notifier.showErrorMessage({
        content: e
      });
    }
  },
  data() {
    return {
      texts: []
    };
  }
};
</script>