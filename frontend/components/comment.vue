<template lang="pug">
  div
    v-card(v-for='comment in comments' :key='comment.id' :loading="isCommentsLoading" flat )
     
      v-list-item( dense )
        v-list-item-avatar(v-if ="comment.authorDetails.profileImage" size)
          v-img(:src="comment.authorDetails.profileImage" aspect-ratio="1")
        v-list-item-content
          v-list-item-title() {{comment.authorDetails.name}} 
      v-card-subtitle.pt-0 {{comment.text}}
        v-card-actions
          v-btn(v-if="comment.hasCurrentUserLikedComment" icon @click="toggleLikeComment(comment)" color="pink" left :disabled="isCommentsLoading" :loading="isLikeLoading")
            v-icon(small) mdi-heart
            span.pl-0  {{comment.likeCount}}
          v-btn(icon @click="toggleLikeComment(comment)" color="pink" :disabled="isCommentsLoading" :loading="isLikeLoading" v-else)
            v-icon(small) mdi-heart-outline
            span.pl-0  {{comment.likeCount}}
          v-btn(icon v-if="comment.isCurrentUserAuthor" @click="deleteComment(comment.id)" color="error" :disabled="isCommentsLoading")
            v-icon(small) mdi-delete
    #newComment 
      v-text-field( placeholder="Add a comment" outlined rounded solo dense v-model="caption" @input="$v.caption.$touch()" @blur="$v.caption.$touch()" :loading="isLoading" :error-messages="captionErrors")
        v-btn(text fab x-small slot="prepend-inner" nuxt to="/profile" :loading="isLoading")
          v-list-item-avatar(v-if="user" size)
            v-img(:src="user.profileImage" aspect-ratio="1")
        v-btn(icon slot="append" @click="createComment")
          v-icon mdi-send
</template>


<script>
import getCommentsForThePost from '../gql/getCommentsForThePost';
import deleteComment from '../gql/deleteComment';
import isCurrentUserLiker from '../gql/isCurrentUserLiker';
import likeComment from '../gql/likeComment';
import unlikeComment from '../gql/unlikeComment';
import createComment from '../gql/createComment';
import profileQuery from '../gql/profile';

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    postId: String
  },
  mixins: [validationMixin],
  validations: {
    caption: { required: true }
  },
  async mounted() {
    try {
      const token = this.$apolloHelpers.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      this.user = await this.$apollo
        .query({
          query: profileQuery
        })
        .then(({ data }) => data.me);
      if (!this.user.profileImage) {
        this.user.profileImage = `https://api.adorable.io/avatars/128/${this.user.username}.png`;
      }
    } catch (e) {
      await this.$apolloHelpers.onLogout();
      this.$router.replace('/login');
      this.$notifier.showErrorMessage({
        content: 'Please login first'
      });
    }
    await this.refresh();
  },
  data() {
    return {
      comments: [],
      user: {},
      skip: 0,
      limit: 15,
      isCommentsLoading: false,
      isLikeLoading: false,
      isLoading: false,
      caption: '',
      captionErrors: ''
    };
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
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
            fetchPolicy
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

        this.refresh('network-only');
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
    },
    async createComment() {
      try {
        this.isLoading = true;
        await this.$apollo
          .mutate({
            mutation: createComment,
            variables: {
              postId: this.postId,
              text: this.caption
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Comment posted successfully'
            });
            this.caption = '';
            this.refresh('network-only');
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Comment cannot be empty'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss">
#newComment {
  display: flex;
  width: 98vw;
  position: fixed;
  bottom: 27px;
  margin: auto;
  left: 0;
  right: 0;
}
</style>
