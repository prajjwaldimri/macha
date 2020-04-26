<template lang="pug">
  
  v-list(two-line)
    template( v-for="(text,index) in texts" class="d-flex child-flex")
      v-list-item(:key="text.uri" )
        v-list-item-content
          v-list-item-subtitle(flat tile @click="$router.push('/text/' + text.uri)").d-flex {{text.content}}
      v-divider(v-if="index != texts.length - 1" :key="text.uri") 
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