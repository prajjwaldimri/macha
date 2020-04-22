<template lang="pug">
  v-container(fluid)
    v-card(:loading="isCommentsLoading" flat).mx-3
      v-list-item(v-for='comment in comments' :key='comment.id' :dense="dense")
        v-list-item-avatar(v-if ="comment.authorDetails.profileImage")
          v-img(:src="comment.authorDetails.profileImage" aspect-ratio="1")
        v-list-item-content
          v-list-item-title() {{comment.authorDetails.name}}
          v-list-item-subtitle(v-text='comment.text')
  
</template>


<script>
import getCommentsForThePost from '../gql/getCommentsForThePost';

export default {
  props: {
    postId: String
  },
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      comments: [],
      skip: 0,
      limit: 15,
      isCommentsLoading: false,
      dense: true
    };
  },
  methods: {
    async refresh() {
      try {
        this.isCommentsLoading = true;
        await this.$apollo
          .query({
            query: getCommentsForThePost,
            variables: {
              skip: this.skip,
              limit: this.limit,
              postId: this.postId
            }
          })
          .then(({ data }) => {
            this.comments = data.getCommentsForThePost.comments;
          });
      } catch (e) {
        console.log(e);
        this.$notifier.showErrorMessage({
          content: 'Error loading your comments'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    }
  }
};
</script>