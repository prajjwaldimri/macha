<template lang="pug">
  v-card(:loading="isCommentsLoading" flat)
    v-list-item(v-for='comment in comments' :key='comment.id' dense three-line)
      v-list-item-avatar(v-if ="comment.authorDetails.profileImage" size).px-0
        v-img(:src="comment.authorDetails.profileImage" aspect-ratio="1")
      v-list-item-content
        v-list-item-title {{comment.authorDetails.name}} 
        v-list-item-subtitle {{comment.text}}
      v-list-item-action
        v-btn(v-if="comment.hasCurrentUserLikedComment" icon @click="toggleLikeComment(comment)" color="pink" left :disabled="isCommentsLoading" :loading="isLikeLoading")
          v-icon(small) mdi-heart
          span.pl-0  {{comment.likeCount}}
        v-btn(icon @click="toggleLikeComment(comment)" color="pink" :disabled="isCommentsLoading" :loading="isLikeLoading" v-else)
          v-icon(small) mdi-heart-outline
          span.pl-0  {{comment.likeCount}}
        v-btn(icon v-if="comment.isCurrentUserAuthor" @click="deleteComment(comment.id)" color="error" :disabled="isCommentsLoading")
          v-icon(small).pr-3 mdi-delete

</template>


<script>
import getCommentsForThePost from '../gql/getCommentsForThePost';
import deleteComment from '../gql/deleteComment';
import isCurrentUserLiker from '../gql/isCurrentUserLiker';
import likeComment from '../gql/likeComment';
import unlikeComment from '../gql/unlikeComment';

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
      isCommentsLoading: false,
      isLikeLoading: false
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
        this.$notifier.showErrorMessage({
          content: 'Error deleting your comment'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    },
    async toggleLikeComment(comment) {
      try {
        this.isLikeLoading = true;
        if (comment.hasCurrentUserLikedComment) {
          await this.$apollo.mutate({
            mutation: unlikeComment,
            variables: {
              commentId: comment.id
            }
          });
          comment.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likeComment,
            variables: {
              commentId: comment.id
            }
          });
          comment.likeCount += 1;
        }
        comment.hasCurrentUserLikedComment = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: comment.id
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        console.log(e);
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the comment.'
        });
      } finally {
        this.isLikeLoading = false;
      }
    }
  }
};
</script>