<template lang="pug">
  .textsPage
    v-progress-linear(indeterminate v-if="isLoading")
    v-list(v-else-if="textPostExist" two-line)
      template(v-for="(text,index) in texts" class="d-flex child-flex")
        v-list-item(:key="text.uri" )
          v-list-item-content
            v-list-item-subtitle(flat tile @click="$router.push('/text/' + text.uri)").d-flex {{text.content}}
        v-divider(v-if="index != texts.length - 1")
    .noTexts(v-else style="display: flex; justify-content: center;").subtitle-2.pa-4 You have not posted any texts yet.
</template>

<script>
import getTextPostsOfUser from '../../gql/getTextPostsOfUser';

export default {
  async mounted() {
    try {
      this.isLoading = true;
      await this.$apollo
        .query({
          query: getTextPostsOfUser
        })
        .then(({ data }) => {
          this.texts = data.getTextPostsOfUser.textPosts;
          if (this.texts.length > 0) {
            this.textPostExist = true;
          }
        });
    } catch (e) {
      this.$store.dispatch('error/addError', e);
      this.$notifier.showErrorMessage({
        content: 'Not able to get the texts'
      });
    } finally {
      this.isLoading = false;
    }
  },
  data() {
    return {
      texts: [],
      textPostExist: false,
      isLoading: false
    };
  }
};
</script>