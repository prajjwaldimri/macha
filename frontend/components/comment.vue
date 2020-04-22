<template lang="pug">
  v-card(:loading="isCommentsLoading" flat)
    v-list-item(v-for='comment in comments' :key='comment.id' dense three-line)
      v-list-item-avatar(v-if ="comment.authorDetails.profileImage" size)
        v-img(:src="comment.authorDetails.profileImage" aspect-ratio="1")
      v-list-item-content
        v-list-item-title {{comment.authorDetails.name}} 
        v-list-item-subtitle {{comment.text}}
      v-list-item-action
        v-btn(icon v-if="comment.isCurrentUserAuthor" @click="deleteComment(comment.id)" color="error" :disabled="isCommentsLoading")
          v-icon(small) mdi-delete

</template>


<script>
import getCommentsForThePost from '../gql/getCommentsForThePost';
import deleteComment from '../gql/deleteComment';

export default {
  props: {
    postId: String,
    commentId: String
  },
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      comments: [],
      skip: 0,
      limit: 15,
      isCommentsLoading: false
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
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => {
            this.comments = data.getCommentsForThePost.comments;
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error loading your comments'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    },
    async deleteComment(commentId) {
      try {
        this.isCommentsLoading = true;
        await this.$apollo.mutate({
          mutation: deleteComment,
          variables: {
            commentId: commentId
          }
        });

        this.refresh();
        this.$emit('postDeleted');
      } catch (e) {
        console.log(e);
        this.$notifier.showErrorMessage({
          content: 'Error deleting your comment'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    }
  }
};
</script>